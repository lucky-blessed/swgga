// src/app/api/v1/admin/events/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSanityClient } from '@sanity/client'

const SYNC_ROLES = ['R01', 'R02', 'R03']

const sanity = createSanityClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn:     false,
  token:      process.env.SANITY_API_TOKEN,
})

const SANITY_QUERY = `*[_type == "event"] | order(date desc) {
  _id,
  title,
  description,
  date,
  location,
  ministry,
  registrationEnabled,
  featured,
  image
}`

export async function POST(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !SYNC_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const sanityEvents = await sanity.fetch(SANITY_QUERY)

    if (!sanityEvents || sanityEvents.length === 0) {
      return NextResponse.json({ synced: 0, message: 'No events found in Sanity' })
    }

    const supabase = await createClient()

    // Look up ministry IDs by name
    const { data: ministries } = await supabase
      .from('ministries')
      .select('id, name')

    const ministryMap = Object.fromEntries(
      (ministries ?? []).map((m: any) => [m.name.toLowerCase(), m.id])
    )

    const rows = sanityEvents.map((e: any) => {
      // Resolve Sanity image reference to CDN URL
      // Ref format: image-{hash}-{width}x{height}-{format}
      // URL format: https://cdn.sanity.io/images/{project}/{dataset}/{hash}-{width}x{height}.{format}
      let image_url = null
      if (e.image?.asset?._ref) {
        const ref      = e.image.asset._ref as string
        const filename = ref
          .replace(/^image-/, '')           // remove "image-" prefix
          .replace(/-([a-z]+)$/, '.$1')     // replace last -png/-jpg with .png/.jpg
        image_url = `https://cdn.sanity.io/images/op8s9jyc/production/${filename}`
      }

      return {
        title:                e.title              ?? 'Untitled',
        description:          e.description        ?? null,
        ministry_id:          e.ministry
          ? (ministryMap[e.ministry.toLowerCase()] ?? null)
          : null,
        start_time:           e.date               ?? new Date().toISOString(),
        end_time:             null,
        location:             e.location           ?? null,
        members_only:         false,
        registration_enabled: e.registrationEnabled ?? true,
        is_recurring:         false,
        recurrence_pattern:   null,
        is_cty_event:         false,
        image_url,
        created_by:           userId,
      }
    })

    // Upsert by title + start_time
    let synced = 0
    for (const row of rows) {
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('title',      row.title)
        .eq('start_time', row.start_time)
        .single()

      if (!existing) {
        await supabase.from('events').insert(row)
        synced++
      } else {
        // Update image_url if we now have one
        if (row.image_url) {
          await supabase
            .from('events')
            .update({ image_url: row.image_url })
            .eq('id', existing.id)
          synced++
        }
      }
    }

    await supabase.from('audit_logs').insert({
      actor_id:      userId,
      action:        'SYNC_EVENTS_FROM_SANITY',
      resource_type: 'event',
      resource_id:   null,
    })

    return NextResponse.json({
      synced,
      message: `Successfully synced ${synced} new events from Sanity`,
    })

  } catch (err: any) {
    console.error('[admin/events/sync]', err.message)
    return NextResponse.json(
      { error: 'Failed to sync from Sanity', detail: err.message },
      { status: 500 }
    )
  }
}