// src/lib/triggers/onMemberRegistered.ts
// Fires when a new member completes registration
// Sends welcome SMS and welcome email

import { enqueueNotification } from '@/lib/notifications/queue'
import { welcomeEmail } from '@/lib/notifications/email'

export async function onMemberRegistered(params: {
  firstName: string
  phone?: string
  email?: string
}) {
  const { firstName, phone, email } = params

  // Queue welcome SMS
  if (phone) {
    await enqueueNotification({
      type: 'welcome_sms',
      phone,
      firstName,
    })
  }

  // Queue welcome email
  if (email) {
    const { subject, html } = welcomeEmail(firstName)
    await enqueueNotification({
      type: 'email',
      to: email,
      subject,
      html,
    })
  }
}
