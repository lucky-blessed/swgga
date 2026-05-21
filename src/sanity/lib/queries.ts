import { groq } from 'next-sanity'

// Latest devotional
export const latestDevotionalQuery = groq`
  *[_type == "devotional"] | order(publishedAt desc) [0] {
    _id,
    title,
    episodeNumber,
    publishedAt,
    scripture,
    scriptureText,
    body,
    audioUrl,
    youtubeUrl,
    podcastUrl,
    prayerPoint,
    declaration,
  }
`

// Latest prayer connect session
export const latestPrayerConnectQuery = groq`
  *[_type == "prayerConnect"] | order(date desc) [0] {
    _id,
    date,
    facebookLiveUrl,
    whatsappChannelUrl,
    topic,
    scripture,
    isLive,
    recordingUrl,
  }
`

// Devotional archive (last 20)
export const devotionalArchiveQuery = groq`
  *[_type == "devotional"] | order(publishedAt desc) [0..19] {
    _id,
    title,
    episodeNumber,
    publishedAt,
    audioUrl,
    youtubeUrl,
  }
`

// Latest sermons (for homepage featured + sermons page)
export const latestSermonsQuery = groq`
  *[_type == "sermon"] | order(publishedAt desc) [0..7] {
    _id,
    title,
    slug,
    speaker,
    scripture,
    publishedAt,
    sermonType,
    youtubeUrl,
    audioUrl,
    notesUrl,
    duration,
    series,
    ministry,
    summary,
    "thumbnailUrl": thumbnail.asset->url,
  }
`

// Upcoming events (from today onwards)
export const upcomingEventsQuery = groq`
  *[_type == "event" && date >= now()] | order(date asc) [0..5] {
    _id,
    title,
    slug,
    date,
    description,
    location,
    ministry,
    registrationEnabled,
    featured,
    "imageUrl": image.asset->url,
  }
`
