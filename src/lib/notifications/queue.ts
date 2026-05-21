// src/lib/notifications/queue.ts
// BullMQ queue for all outgoing notifications
// Jobs are added here, the worker processes them asynchronously
// This keeps API responses fast — SMS/email delivery happens in background

import { Queue } from 'bullmq'
import { redis } from '@/lib/db/redis'

// Single queue for all notification types
export const notificationQueue = new Queue('notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,           // retry up to 3 times if delivery fails
    backoff: {
      type: 'exponential',
      delay: 5000,         // wait 5s, then 10s, then 20s between retries
    },
    removeOnComplete: 100, // keep last 100 completed jobs for audit
    removeOnFail: 200,     // keep last 200 failed jobs for debugging
  },
})

// Job type definitions — what data each notification type needs
export type NotificationJob =
  | { type: 'sms';             to: string;   body: string }
  | { type: 'email';           to: string;   subject: string; html: string }
  | { type: 'devotional_alert';phone: string; title: string; episode: number }
  | { type: 'giving_receipt';  phone: string; email?: string; amount: number; fund: string; reference: string }
  | { type: 'event_reminder';  phone: string; eventTitle: string; eventDate: string }
  | { type: 'welcome_sms';     phone: string; firstName: string }
  | { type: 'otp';             phone: string; code: string }

// Helper — add any notification job to the queue
export async function enqueueNotification(job: NotificationJob, delayMs = 0) {
  await notificationQueue.add(job.type, job, {
    delay: delayMs,
  })
}
