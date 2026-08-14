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
    facebookUrl,
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
    "imageLqip": image.asset->metadata.lqip,
  }
`

// Gallery 

export const GALLERY_STORIES_QUERY = groq`
  *[_type == "galleryStory"] | order(order asc) {
    _id,
    title,
    description,
    order,
    "slug": slug.current,
    "coverImage": coverImage {
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      alt
    },
    "photos": *[_type == "galleryPhoto" && references(^._id)] | order(date desc) [0..4] {
      _id,
      title,
      "image": image {
        "url": asset->url,
        "lqip": asset->metadata.lqip,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height,
        alt
      }
    }
  }
`

export const GALLERY_PHOTOS_QUERY = groq`
  *[_type == "galleryPhoto"] | order(featured desc, date desc) {
    _id,
    title,
    description,
    category,
    tags,
    date,
    featured,
    "story": story->{ _id, title },
    "image": image {
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height,
      alt
    }
  }
`

// Featured event (homepage spotlight)
export const featuredEventQuery = groq`
  *[_type == "event" && featured == true] | order(date desc) [0] {
    _id,
    title,
    theme,
    date,
    endDate,
    sessionTimes,
    description,
    location,
    registrationEnabled,
    speakers[] { name, role },
    "flyer": image {
      "url": asset->url,
      "lqip": asset->metadata.lqip,
    },
    "eventPhotos": eventPhotos[] {
      "url": asset->url,
      "lqip": asset->metadata.lqip,
    },
  }
`