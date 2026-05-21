// src/app/api/webhooks/sanity/route.ts
// Receives webhook calls from Sanity when content is published
// Triggers the appropriate notification based on document type

import { NextRequest, NextResponse } from 'next/server'
import { onDevotionalPublished } from '@/lib/triggers/onDevotionalPublished'

// Verify the webhook came from Sanity using a shared secret
function verifyWebhook(req: NextRequest): boolean {
  const secret = req.headers.get('x-webhook-secret')
  return secret === process.env.SANITY_WEBHOOK_SECRET
}

export async function POST(req: NextRequest) {
  try {
    // Verify the request is from Sanity
    if (!verifyWebhook(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { _type, title, episodeNumber, scripture } = body

    // Route to the correct trigger based on document type
    switch (_type) {
      case 'devotional':
        if (title && episodeNumber) {
          await onDevotionalPublished({
            title,
            episode:   episodeNumber,
            scripture: scripture || '',
          })
        }
        break

      default:
        console.log(`[webhook/sanity] Unhandled type: ${_type}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[webhook/sanity] Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
