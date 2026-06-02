// src/app/api/podcast/route.ts
// RSS 2.0 podcast feed - compatible with Spotify, Apple Podcasts, Google Podcasts
// Pulls all devotional audio records from Sanity and generates valid RSS XML
// Accessible at: /api/podcast

import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { groq } from 'next-sanity'

// Fetch all devotionals with audio from Sanity
const podcastQuery = groq`
  *[_type == "devotional" && defined(audioUrl)] | order(publishedAt desc) [0..99] {
    _id,
    title,
    episodeNumber,
    publishedAt,
    scripture,
    scriptureText,
    audioUrl,
    prayerPoint,
    body,
  }
`

export async function GET() {
  try {
    const episodes = await client.fetch(podcastQuery)

    const siteUrl   = 'https://swgga.vercel.app'
    const feedUrl   = `${siteUrl}/api/podcast`
    const imageUrl  = `${siteUrl}/images/pastor-chii.jpg`
    const now       = new Date().toUTCString()

    // Helper - extract plain text from Sanity portable text blocks
    function blockToText(blocks: any[]): string {
      if (!blocks || !Array.isArray(blocks)) return ''
      return blocks
        .filter(b => b._type === 'block')
        .map(b => b.children?.map((c: any) => c.text).join('') || '')
        .join(' ')
    }

    // Build RSS XML string
    const items = episodes.map((ep: any) => {
      const pubDate   = new Date(ep.publishedAt).toUTCString()
      const desc      = blockToText(ep.body) || ep.scriptureText || ''
      const duration  = '00:15:00' // default duration - update when actual duration is available
      const epNumber  = ep.episodeNumber || 1
      const cleanDesc = desc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const cleanTitle = (ep.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const scripture  = (ep.scripture || '').replace(/&/g, '&amp;')

      return `
    <item>
      <title>${cleanTitle}</title>
      <description>${cleanDesc ? cleanDesc.substring(0, 500) : `Daily devotional - ${scripture}`}</description>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${ep.audioUrl}" type="audio/mpeg" length="0" />
      <guid isPermaLink="false">${ep._id}</guid>
      <itunes:episode>${epNumber}</itunes:episode>
      <itunes:title>${cleanTitle}</itunes:title>
      <itunes:summary>${scripture ? `Scripture: ${scripture}` : cleanTitle}</itunes:summary>
      <itunes:duration>${duration}</itunes:duration>
      <itunes:episodeType>full</itunes:episodeType>
    </item>`
    }).join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">

  <channel>
    <title>Pastor Chii Daily - Sure Word Glorious Gospel Assembly</title>
    <description>Daily prayer and devotional with Rev. Chijioke Igbani - grounding you in the Word of God, every single day.</description>
    <link>${siteUrl}/ministries/pastor-chii-daily</link>
    <language>en-ng</language>
    <copyright>© ${new Date().getFullYear()} Sure Word Glorious Gospel Assembly, Warri, Nigeria</copyright>
    <lastBuildDate>${now}</lastBuildDate>
    <pubDate>${now}</pubDate>
    <ttl>60</ttl>

    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />

    <itunes:author>Rev. Chijioke Igbani</itunes:author>
    <itunes:summary>Daily prayer and devotional with Rev. Chijioke Igbani - grounding you in the Word of God, every single day. Sure Word Glorious Gospel Assembly, Warri, Delta State, Nigeria.</itunes:summary>
    <itunes:owner>
      <itunes:name>Sure Word Glorious Gospel Assembly Media</itunes:name>
      <itunes:email>media.sureword@gmail.com</itunes:email>
    </itunes:owner>
    <itunes:image href="${imageUrl}" />
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Christianity" />
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    ${items}
  </channel>
</rss>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type':  'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
      },
    })

  } catch (error) {
    console.error('[podcast/feed] Error:', error)
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 })
  }
}
