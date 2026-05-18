// src/lib/notifications/twilio.ts
// Twilio client - used for SMS OTP delivery and notifications

import twilio from 'twilio'

export const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
)

export const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER!

// Send an SMS message to a given phone number
export async function sendSMS(to: string, body: string): Promise<boolean> {
    try {
        await twilioClient.messages.create({
            from: TWILIO_FROM,
            to,
            body,
        })
        return true
    } catch (error) {
        console.error('SMS send error:', error)
        return false
    }
}