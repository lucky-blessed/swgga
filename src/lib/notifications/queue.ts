// src/lib/notifications/queue.ts
// BullMQ queue for all outgoing notifications
// Uses dynamic import to prevent build-time Redis connection attempts

export interface NotificationJob {
  type: 'sms' | 'email' | 'whatsapp' | 'otp' | 'devotional_alert' | 'event_reminder' | 'welcome_sms'
  to?: string
  phone?: string
  subject?: string
  body?: string
  html?: string
  templateId?: string
  templateData?: Record<string, unknown>
  [key: string]: unknown
}

export async function enqueueNotification(job: NotificationJob): Promise<void> {
  // Skip queue in build/test environments
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn('[queue] Redis not configured, skipping notification queue')
    return
  }

  try {
    // Dynamic import prevents BullMQ from connecting at build time
    const { Queue } = await import('bullmq')
    const { redis } = await import('@/lib/db/redis')

    const queue = new Queue('notifications', {
      connection: redis as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    })

    await queue.add(job.type, job, { priority: job.type === 'sms' ? 1 : 2 })
  } catch (err) {
    console.error('[queue] Failed to enqueue notification:', err)
    // Don't throw — notification failure should not break the main request
  }
}
