// src/app/api/v1/admin/media/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSanityClient } from '@sanity/client'

const SYNC_ROLES = ['R01', 'R02', 'R07']

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn:    false,
  token:     process.env.SANITY_API_TOKEN,
})

const SANITY_QUERY = `*[_type == "sermon"] | order(publishedAt desc) {
    _id,
    title,
    sermonType,
    youtubeUrl,
    facebookUrl,
    audioUrl,
    notesUrl,
    speaker,
    series,
    topic,
    scripture,
    publishedAt,
    downloadEnabled,
    ministry
}`

export async function POST(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !SYNC_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Fetch all sermons from Sanity
    const sanitySermons = await sanity.fetch(SANITY_QUERY)

    if (!sanitySermons || sanitySermons.length === 0) {
      return NextResponse.json({ synced: 0, message: 'No sermons found in Sanity' })
    }

    const supabase = await createClient()

    // Map Sanity fields to Supabase schema
    const rows = sanitySermons.map((s: any) => ({
        sanity_id:        s._id,
        title:            s.title                ?? 'Untitled',
        content_type:     resolveContentType(s),
        video_url:        s.youtubeUrl ?? s.facebookUrl ?? null,
        audio_url:        s.audioUrl ?? null,
        notes_url:        s.notesUrl             ?? null,
        speaker:          s.speaker              ?? 'Rev. Chijioke Igbani',
        series:           s.series               ?? null,
        topic:            s.topic                ?? null,
        scripture:        s.scripture            ?? null,
        sermon_date:      s.publishedAt
            ? s.publishedAt.split('T')[0]
            : new Date().toISOString().split('T')[0],
        download_enabled: s.downloadEnabled      ?? false,
        ministry_tag:     null,
    }))

    // Upsert — update if sanity_id exists, insert if not
    const { data, error } = await supabase
      .from('sermons')
      .upsert(rows, { onConflict: 'sanity_id' })
      .select()

    if (error) {
      console.error('[admin/media/sync POST]', error.message)
      return NextResponse.json({ error: 'Sync failed', detail: error.message }, { status: 500 })
    }

    await supabase.from('audit_logs').insert({
      actor_id:      userId,
      action:        'SYNC_SERMONS_FROM_SANITY',
      resource_type: 'sermon',
      resource_id:   null,
    })

    return NextResponse.json({
      synced:  data?.length ?? 0,
      message: `Successfully synced ${data?.length ?? 0} sermons from Sanity`,
    })

  } catch (err: any) {
    console.error('[admin/media/sync] Sanity fetch error:', err.message)
    return NextResponse.json(
      { error: 'Failed to connect to Sanity', detail: err.message },
      { status: 500 }
    )
  }
}

// Map Sanity content type values to Supabase schema values
function resolveContentType(s: any): string {
    if (s.facebookUrl) return 'video_facebook'
    if (s.youtubeUrl)  return 'video_youtube'
    if (s.audioUrl)    return 'audio_s3'
    if (s.notesUrl)    return 'notes_pdf'
    // fallback based on sermonType field
    const type = s.sermonType ?? ''
    if (type.includes('facebook')) return 'video_facebook'
    if (type.includes('video'))    return 'video_youtube'
    if (type.includes('audio'))    return 'audio_s3'
    if (type.includes('podcast'))  return 'podcast'
    return 'video_youtube'
  }