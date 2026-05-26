// src/lib/triggers/onDevotionalPublished.ts
// Fires when a new devotional is published in Sanity
// Sends SMS alert to all subscribed members
// Called via Sanity webhook (configured in Week 4)

import { enqueueNotification } from '@/lib/notifications/queue'
import { devotionalAlertEmail } from '@/lib/notifications/email'
import { createServiceClient } from '@/lib/supabase/server'

export async function onDevotionalPublished(params: {
  title: string
  episode: number
  scripture: string
}) {
  const { title, episode, scripture } = params

  // Fetch all members who have opted in to devotional notifications
  const supabase = createServiceClient()
  const { data: members } = await supabase
    .from('users')
    .select('phone, email, first_name')
    .eq('devotional_notifications', true)
    .not('phone', 'is', null)

  if (!members || members.length === 0) return

  // Queue SMS for each subscribed member (BullMQ processes in background)
  for (const member of members) {
    if (member.phone) {
      await enqueueNotification({
        type:   'devotional_alert',
        phone:  member.phone,
        title,
        episode,
      })
    }

    // Queue email if member has email
    if (member.email) {
      await devotionalAlertEmail(
        member.email,
        member.first_name ?? 'Member',
        title,
        episode,
        `${process.env.NEXT_PUBLIC_APP_URL}/ministries/pastor-chii-daily`
      )
    }
  }

  console.log(`[trigger] Devotional Ep.${episode} notifications queued for ${members.length} members`)
}
