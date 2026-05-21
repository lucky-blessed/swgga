// src/app/page.tsx
import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/public/home/HeroSection'
import ServicesStrip from '@/components/layout/ServicesStrip'
import VisionBand from '@/components/public/home/VisionBand'
import FeaturedSermon from '@/components/public/home/FeaturedSermon'
import UpcomingEvents from '@/components/public/home/UpcomingEvents'
import MinistriesGrid from '@/components/public/home/MinistriesGrid'
import GiveCTA from '@/components/public/home/GiveCTA'
import Testimonials from '@/components/public/home/Testimonials'
import Footer from '@/components/layout/Footer'



export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
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