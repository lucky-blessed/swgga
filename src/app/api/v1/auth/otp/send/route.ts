// src/app/api/v1/auth/otp/send/route.ts
// Generates a 6-digit OTP, stores it in Redis for 10 minutes,
// and queues an SMS via BullMQ (non-blocking — response is instant)

import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/db/redis'
import { enqueueNotification } from '@/lib/notifications/queue'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Normalise phone number — ensure it starts with +
    const normalised = phone.startsWith('+') ? phone : `+${phone}`

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    // Store OTP in Redis with 10-minute expiry
    // Key format: otp:{phone} — overwrites any previous OTP for this number
    await redis.set(`otp:${normalised}`, otp, { ex: 600 })

    // Queue the SMS — returns immediately, Twilio call happens in background
    await enqueueNotification({ type: 'otp', phone: normalised, code: otp })

    return NextResponse.json({ success: true, message: 'OTP sent' })

  } catch (error) {
    console.error('[otp/send] Error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
