// src/lib/notifications/worker.ts
// BullMQ worker — processes notification jobs from the queue
// Each job type has its own handler
// Worker retries automatically on failure (configured in queue.ts)

import { Worker } from 'bullmq'
import { redis } from '@/lib/db/redis'
import { twilioClient, TWILIO_PHONE } from './twilio'
import type { NotificationJob } from './queue'
import { sendEmail, welcomeEmail, givingReceiptEmail, devotionalAlertEmail } from './email'

// SMS message templates — keep them short for Nigerian mobile networks
function buildSmsBody(job: NotificationJob): string {
  switch (job.type) {
    case 'otp':
      return `Your Sure Word GGA login code is: ${job.code}. Valid for 10 minutes. Do not share this code.`

    case 'welcome_sms':
      return `Welcome to Sure Word GGA, ${job.firstName}! We are glad you are here. Visit surewordgga.org or join Pastor Chii Daily on WhatsApp: wa.me/channel/0029VbB8W8k2f3ELvngFmd3W`

    case 'devotional_alert':
      return `Pastor Chii Daily Ep.${job.episode}: "${job.title}" is now available. Read, listen or watch at surewordgga.org/ministries/pastor-chii-daily`

    case 'giving_receipt':
      return `Thank you for giving to Sure Word GGA! Amount: NGN ${job.amount.toLocaleString()} | Fund: ${job.fund} | Ref: ${job.reference}. God bless you.`

    case 'event_reminder':
      return `Reminder: "${job.eventTitle}" is coming up on ${job.eventDate}. We look forward to seeing you at Sure Word GGA, Warri.`

    default:
      return ''
  }
}

// Create the worker — it listens to the notifications queue
export const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const data = job.data as NotificationJob

    // Route each job type to the right handler
    switch (data.type) {

      // Raw SMS — used for OTP and other direct messages
      case 'sms': {
        await twilioClient.messages.create({
          body: data.body,
          from: TWILIO_PHONE,
          to: data.to,
        })
        console.log(`[worker] SMS sent to ${data.to}`)
        break
      }

      // OTP code SMS
      case 'otp': {
        const body = buildSmsBody(data)
        await twilioClient.messages.create({
          body,
          from: TWILIO_PHONE,
          to: data.phone,
        })
        console.log(`[worker] OTP sent to ${data.phone}`)
        break
      }

      // Welcome SMS for new member registrations
      case 'welcome_sms': {
        const body = buildSmsBody(data)
        await twilioClient.messages.create({
          body,
          from: TWILIO_PHONE,
          to: data.phone,
        })
        console.log(`[worker] Welcome SMS sent to ${data.phone}`)
        break
      }

      // Daily devotional published alert
      case 'devotional_alert': {
        const body = buildSmsBody(data)
        await twilioClient.messages.create({
          body,
          from: TWILIO_PHONE,
          to: data.phone,
        })
        console.log(`[worker] Devotional alert sent to ${data.phone}`)
        break
      }

      // Giving receipt SMS
      case 'giving_receipt': {
        const body = buildSmsBody(data)
        await twilioClient.messages.create({
          body,
          from: TWILIO_PHONE,
          to: data.phone,
        })
        console.log(`[worker] Giving receipt sent to ${data.phone}`)
        break
      }

      // Event reminder SMS
      case 'event_reminder': {
        const body = buildSmsBody(data)
        await twilioClient.messages.create({
          body,
          from: TWILIO_PHONE,
          to: data.phone,
        })
        console.log(`[worker] Event reminder sent to ${data.phone}`)
        break
      }

      // Transactional email via SendGrid
      case 'email': {
        await sendEmail(data.to, data.subject, data.html)
        console.log(`[worker] Email sent to ${data.to}`)
        break
      }

      default:
        console.warn(`[worker] Unknown job type: ${(data as any).type}`)
    }
  },
  {
    connection: redis,
    concurrency: 5, // process up to 5 jobs simultaneously
  }
)

// Log worker events for monitoring
notificationWorker.on('completed', job => {
  console.log(`[worker] Job ${job.id} (${job.name}) completed`)
})

notificationWorker.on('failed', (job, err) => {
  console.error(`[worker] Job ${job?.id} (${job?.name}) failed:`, err.message)
})

notificationWorker.on('error', err => {
  console.error('[worker] Worker error:', err)
})
