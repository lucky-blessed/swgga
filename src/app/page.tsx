import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/public/home/HeroSection'
import ServicesStrip from '@/components/layout/ServicesStrip'
import VisionBand from '@/components/public/home/VisionBand'
import FeaturedEventSection from '@/components/public/home/FeaturedEventSection'
import FeaturedSermon from '@/components/public/home/FeaturedSermon'
import UpcomingEvents from '@/components/public/home/UpcomingEvents'
import MinistriesGrid from '@/components/public/home/MinistriesGrid'
import GiveCTA from '@/components/public/home/GiveCTA'
import Testimonials from '@/components/public/home/Testimonials'
import Footer from '@/components/layout/Footer'
import { sanityFetch } from '@/sanity/lib/client'
import { featuredEventQuery } from '@/sanity/lib/queries'

export const revalidate = 3600

export default async function HomePage() {
  const featuredEvent = await sanityFetch<any>(featuredEventQuery).catch(() => null)

  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturedEventSection event={featuredEvent} />
      <ServicesStrip />
      <VisionBand />
      <FeaturedSermon />
      <UpcomingEvents />
      <MinistriesGrid />
      <Testimonials />
      <GiveCTA />
      <Footer />
    </main>
  )
}