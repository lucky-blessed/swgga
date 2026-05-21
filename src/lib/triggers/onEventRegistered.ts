// src/lib/triggers/onEventRegistered.ts
// Fires when a member registers for an event
// Sends SMS and email confirmation within 60 seconds

import { enqueueNotification } from '@/lib/notifications/queue'
import { eventRegistrationEmail } from '@/lib/notifications/email'

export async function onEventRegistered(params: {
  firstName: string
  phone?: string
  email?: string
  eventTitle: string
  eventDate: string
  location: string
}) {
  const { firstName, phone, email, eventTitle, eventDate, location } = params

  // Queue SMS confirmation
  if (phone) {
    await enqueueNotification({
      type:       'event_reminder',
      phone,
      eventTitle,
      eventDate,
    })
  }

  // Queue email confirmation
  if (email) {
    const { subject, html } = eventRegistrationEmail(
      firstName,
      eventTitle,
      eventDate,
      location
    )
    await enqueueNotification({
      type:    'email',
      to:      email,
      subject,
      html,
    })
  }
}
