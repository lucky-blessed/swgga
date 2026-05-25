// src/app/api/webhooks/sanity/route.ts
// Receives webhook calls from Sanity when content is published
// Triggers the appropriate notification based on document type
import { NextRequest, NextResponse } from 'next/server'
import { onDevotionalPublished } from '@/lib/triggers/onDevotionalPublished'
import { createClient } from '@/lib/supabase/server'

function verifyWebhook(req: NextRequest): boolean {
  const secret = req.headers.get('x-webhook-secret')
  return secret === process.env.SANITY_WEBHOOK_SECRET
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyWebhook(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { _type, _id, title, episodeNumber, scripture } = body

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

      case 'sermon': {
        // Upsert sermon into Supabase when published in Sanity
        const supabase = await createClient()
        await supabase.from('sermons').upsert({
          sanity_id:        _id,
          title:            body.title            ?? 'Untitled',
          content_type:     resolveContentType(body),
          video_url:        body.youtubeUrl ?? body.facebookUrl ?? null,
          audio_url:        body.audioUrl          ?? null,
          notes_url:        body.notesUrl           ?? null,
          speaker:          body.speaker            ?? 'Rev. Chijioke Igbani',
          series:           body.series             ?? null,
          topic:            body.topic              ?? null,
          scripture:        body.scripture          ?? null,
          sermon_date:      body.publishedAt
            ? body.publishedAt.split('T')[0]
            : new Date().toISOString().split('T')[0],
          download_enabled: body.downloadEnabled    ?? false,
          ministry_tag:     null,
        }, { onConflict: 'sanity_id' })
        console.log(`[webhook/sanity] Sermon upserted: ${_id}`)
        break
      }

      case 'event': {
        const supabase = await createClient()
        await supabase.from('events').insert({
          title:                body.title            ?? 'Untitled',
          description:          body.description      ?? null,
          start_time:           body.date             ?? new Date().toISOString(),
          location:             body.location         ?? null,
          registration_enabled: body.registrationEnabled ?? true,
          members_only:         false,
          is_recurring:         false,
          is_cty_event:         false,
          created_by:           null,
        })
        console.log(`[webhook/sanity] Event inserted: ${_id}`)
        break
      }
      default:
        console.log(`[webhook/sanity] Unhandled type: ${_type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[webhook/sanity] Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

function resolveContentType(s: any): string {
  if (s.facebookUrl) return 'video_facebook'
  if (s.youtubeUrl)  return 'video_youtube'
  if (s.audioUrl)    return 'audio_s3'
  if (s.notesUrl)    return 'notes_pdf'
  const type = s.sermonType ?? ''
  if (type.includes('facebook')) return 'video_facebook'
  if (type.includes('video'))    return 'video_youtube'
  if (type.includes('audio'))    return 'audio_s3'
  if (type.includes('podcast'))  return 'podcast'
  return 'video_youtube'
}