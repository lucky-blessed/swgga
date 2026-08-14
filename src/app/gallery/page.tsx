import { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/client'
import { GALLERY_PHOTOS_QUERY, GALLERY_STORIES_QUERY } from '@/sanity/lib/queries'
import GalleryHero from './components/GalleryHero'
import StorySection from './components/StorySection'
import GalleryGrid from './components/GalleryGrid'
import type { GalleryPhotoItem } from './components/GalleryCard'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Photo Gallery | Sure Word Glorious Gospel Assembly',
  description:
    'Browse through the moments, milestones, and memories that have shaped ' +
    'Sure Word Glorious Gospel Assembly — Our Journey of Faith.',
  openGraph: {
    title: 'Photo Gallery | Sure Word Glorious Gospel Assembly',
    description:
      'Our Journey of Faith — browse the moments and milestones of SWGGA.',
    images: [{ url: '/og-gallery.jpg' }],
  },
}

interface StoryItem {
  _id:         string
  title:       string
  description: string | null
  slug:        string
  coverImage:  { url: string; lqip: string; alt: string } | null
  photos:      Array<{
    _id:   string
    title: string
    image: { url: string; lqip: string; alt: string }
  }>
}

export default async function GalleryPage() {
  const [photos, stories] = await Promise.all([
    sanityFetch<GalleryPhotoItem[]>(GALLERY_PHOTOS_QUERY),
    sanityFetch<StoryItem[]>(GALLERY_STORIES_QUERY),
  ])

  return (
    <main className="min-h-screen bg-[#060E1A]">
      <GalleryHero />
      <StorySection stories={stories} />
      <GalleryGrid photos={photos} />
    </main>
  )
}