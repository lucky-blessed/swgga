// src/app/api/v1/auth/register/route.ts
// Self-registration with 3-layer email validation + email verification flow

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase/server'
import { createAccessToken, createRefreshToken } from '@/lib/auth/jwt'
import { validateEmail } from '@/lib/auth/email-validation'
import { sendVerificationEmail } from '@/lib/notifications/email'
import { redis } from '@/lib/db/redis'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { first_name, last_name, email, phone, password, confirm_password } = body

    // ── Validate name ──────────────────────────────────────────────────────
    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json(
        { error: 'First and last name are required' },
        { status: 400 }
      )
    }

    if (first_name.trim().length < 2 || last_name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Names must be at least 2 characters' },
        { status: 400 }
      )
    }

    // ── Require email or phone ─────────────────────────────────────────────
    if (!email?.trim() && !phone?.trim()) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    // ── 3-layer email validation ───────────────────────────────────────────
    if (email?.trim()) {
      const emailResult = await validateEmail(email.trim())
      if (!emailResult.valid) {
        return NextResponse.json({ error: emailResult.error }, { status: 400 })
      }
    }

    // ── Phone validation ───────────────────────────────────────────────────
    let normalised_phone: string | null = null
    if (phone?.trim()) {
      try {
        // Try parsing with country code first
        const phoneStr = phone.trim()
        const withPlus = phoneStr.startsWith('+') ? phoneStr : `+${phoneStr}`

        if (!isValidPhoneNumber(withPlus)) {
          return NextResponse.json(
            { error: 'Please enter a valid phone number with country code (e.g. +2348012345678)' },
            { status: 400 }
          )
        }
        const parsed = parsePhoneNumber(withPlus)
        normalised_phone = parsed.format('E.164')
      } catch {
        return NextResponse.json(
          { error: 'Invalid phone number format. Include country code (e.g. +2348012345678)' },
          { status: 400 }
        )
      }
    }

    // ── Password validation ────────────────────────────────────────────────
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Password strength — must have at least one letter and one number
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one letter and one number' },
        { status: 400 }
      )
    }

    if (password !== confirm_password) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // ── Check duplicates ───────────────────────────────────────────────────
    if (email?.trim()) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
    }

    if (normalised_phone) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('phone', normalised_phone)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists' },
          { status: 409 }
        )
      }
    }

    // ── Create account ─────────────────────────────────────────────────────
    const password_hash = await bcrypt.hash(password, 12)

    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert({
        email:         email?.toLowerCase().trim() ?? null,
        phone:         normalised_phone,
        password_hash,
        role:          'R10',
        // inactive until email verified — phone-only users are active immediately
        is_active:     !email?.trim(),
      })
      .select('id, email, phone, role')
      .single()

    if (userErr || !user) {
      console.error('[auth/register] user insert error:', userErr?.message)
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    // ── Create member profile ──────────────────────────────────────────────
    const { error: memberErr } = await supabase
      .from('members')
      .insert({
        id:         user.id,
        first_name: first_name.trim(),
        last_name:  last_name.trim(),
      })

    if (memberErr) {
      console.error('[auth/register] member insert error:', memberErr.message)
      await supabase.from('users').delete().eq('id', user.id)
      return NextResponse.json(
        { error: 'Failed to create member profile. Please try again.' },
        { status: 500 }
      )
    }

    // ── Send verification email ────────────────────────────────────────────
    let verificationSent = false
    if (email?.trim()) {
      try {
        // Generate signed verification token
        const token     = crypto.randomBytes(32).toString('hex')
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

        // Store token in Redis
        await redis.set(
          `email_verify:${token}`,
          { userId: user.id, email: email.toLowerCase().trim() },
          { ex: 60 * 60 * 24 } // 24 hours
        )

        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/verify-email?token=${token}`

        await sendVerificationEmail(
          email.toLowerCase().trim(),
          first_name.trim(),
          verifyUrl
        )
        verificationSent = true
      } catch (emailErr) {
        console.error('[auth/register] verification email error:', emailErr)
        // Don't fail registration if email fails — user can request resend
      }
    }

    // ── Issue JWT for auto-login ───────────────────────────────────────────
    const accessToken  = createAccessToken(user.id, 'R10')
    const refreshToken = createRefreshToken(user.id)

    const response = NextResponse.json({
      success:           true,
      verificationSent,
      requiresVerification: !!email?.trim(),
      user: {
        id:    user.id,
        email: user.email,
        phone: user.phone,
        role:  'R10',
        name:  `${first_name.trim()} ${last_name.trim()}`,
      },
      accessToken,
    }, { status: 201 })

    response.cookies.set('swgga_refresh', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   60 * 60 * 24 * 30,
      path:     '/',
    })

    return response

  } catch (error) {
    console.error('[auth/register] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
