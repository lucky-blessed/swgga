// src/app/api/v1/admin/media/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { userHasPermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'

const VIEW_ROLES  = ['R01', 'R02', 'R03', 'R04', 'R05', 'R07']
const WRITE_ROLES = ['R01', 'R02', 'R07']

const CONTENT_TYPES = [
  'video_youtube', 'video_facebook', 'audio_s3', 'podcast', 'notes_pdf'
]

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get("x-user-id")
  const viewOk = await userHasPermission(userId ?? "", role ?? "", VIEW_ROLES, "MEDIA_MANAGEMENT")
  if (!viewOk) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const search       = searchParams.get('search')?.trim() ?? ''
  const content_type = searchParams.get('content_type') ?? 'all'
  const speaker      = searchParams.get('speaker')      ?? 'all'
  const series       = searchParams.get('series')       ?? ''
  const page         = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit        = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const offset       = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('sermons')
    .select(`
      id, sanity_id, title, content_type,
      video_url, audio_url, notes_url,
      speaker, series, topic, scripture,
      sermon_date, download_enabled,
      ministry_tag, created_at,
      ministries ( id, name, slug )
    `, { count: 'exact' })

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,speaker.ilike.%${search}%,series.ilike.%${search}%,topic.ilike.%${search}%`
    )
  }
  if (content_type !== 'all') query = query.eq('content_type', content_type)
  if (speaker      !== 'all') query = query.eq('speaker', speaker)
  if (series)                 query = query.ilike('series', `%${series}%`)

  query = query
    .order('sermon_date', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[admin/media GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }

  return NextResponse.json({
    sermons: data ?? [],
    total:   count ?? 0,
    page,
    limit,
    pages:   Math.ceil((count ?? 0) / limit),
  })
}

export async function POST(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')
  const writeUserId = req.headers.get('x-user-id')
  const writeOk = await userHasPermission(writeUserId ?? '', role ?? '', WRITE_ROLES, 'MEDIA_MANAGEMENT')
  if (!writeOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)

  if (!body?.title || !body?.content_type || !body?.speaker || !body?.sermon_date) {
    return NextResponse.json(
      { error: 'title, content_type, speaker, and sermon_date are required' },
      { status: 400 }
    )
  }

  if (!CONTENT_TYPES.includes(body.content_type)) {
    return NextResponse.json(
      { error: `content_type must be one of: ${CONTENT_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  // Validate URL fields based on content type
  if (body.content_type === 'video_youtube' && !body.video_url) {
    return NextResponse.json({ error: 'video_url is required for video_youtube' }, { status: 400 })
  }
  if (body.content_type === 'video_facebook' && !body.facebook_url) {
    return NextResponse.json({ error: 'facebook_url is required for video_facebook' }, { status: 400 })
  }
  if (body.content_type === 'audio_s3' && !body.audio_url) {
    return NextResponse.json({ error: 'audio_url is required for audio_s3' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sermons')
    .insert({
      sanity_id:        body.sanity_id       ?? `manual-${Date.now()}`,
      title:            body.title,
      content_type:     body.content_type,
      video_url:      body.video_url     ?? null,
      audio_url:        body.audio_url       ?? null,
      notes_url:        body.notes_url       ?? null,
      speaker:          body.speaker,
      series:           body.series          ?? null,
      topic:            body.topic           ?? null,
      scripture:        body.scripture       ?? null,
      sermon_date:      body.sermon_date,
      download_enabled: body.download_enabled ?? false,
      ministry_tag:     body.ministry_tag    ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A sermon with this Sanity ID already exists' }, { status: 409 })
    }
    console.error('[admin/media POST]', error.message)
    return NextResponse.json({ error: 'Failed to create sermon' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'CREATE_SERMON',
    resource_type: 'sermon',
    resource_id:   data.id,
  })

  return NextResponse.json({ sermon: data }, { status: 201 })
}