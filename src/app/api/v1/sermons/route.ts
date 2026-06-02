// src/app/api/v1/sermons/route.ts
// Public sermons API - no auth required
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const limit        = Math.min(50, parseInt(searchParams.get('limit')        ?? '20'))
  const page         = Math.max(1,  parseInt(searchParams.get('page')         ?? '1'))
  const offset       = (page - 1) * limit
  const search       = searchParams.get('search')?.trim()       ?? ''
  const series       = searchParams.get('series')?.trim()       ?? ''
  const speaker      = searchParams.get('speaker')?.trim()      ?? ''
  const content_type = searchParams.get('content_type')?.trim() ?? ''

  const supabase = await createClient()

  let query = supabase
    .from('sermons')
    .select(`
      id, title, speaker, series, topic, scripture,
      content_type, video_url, audio_url, sermon_date,
      download_enabled, created_at
    `, { count: 'exact' })

  if (search)       query = query.or(`title.ilike.%${search}%,topic.ilike.%${search}%,scripture.ilike.%${search}%`)
  if (series)       query = query.ilike('series', `%${series}%`)
  if (speaker)      query = query.ilike('speaker', `%${speaker}%`)
  if (content_type) query = query.eq('content_type', content_type)

  query = query
    .order('sermon_date', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[api/v1/sermons GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch sermons' }, { status: 500 })
  }

  return NextResponse.json({
    sermons: data ?? [],
    total:   count ?? 0,
    page,
    limit,
    pages:   Math.ceil((count ?? 0) / limit),
  })
}