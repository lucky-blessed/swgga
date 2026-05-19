// src/app/api/v1/auth/otp/send/route.ts
// Generates a 6-digit OTP, stores it in Redis, and sends it via Twilio SMS

import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/db/redis'
import { sendSMS } from '@/lib/notifications/twilio'
import { AUTH_CONFIG } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Rate limit — max 3 OTP requests per hour per phone number
    const rateLimitKey = `otp_rate:${phone}`
    const requests = await redis.incr(rateLimitKey)
    await redis.expire(rateLimitKey, 60 * 60)

    if (requests > 3) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait before trying again.' },
        { status: 429 }
      )
    }
 
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in Redis — expires in 10 minutes
    const otpKey = `otp:${phone}`
    await redis.set(otpKey, otp, { ex: 60 * AUTH_CONFIG.OTP_EXPIRY_MINUTES })

    // Send OTP via Twilio
    const sent = await sendSMS(
      phone,
      `Your Sure Word GGA verification code is: ${otp}. Valid for 10 minutes.`
    )

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })

  } catch (error) {
    console.error('OTP send error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}