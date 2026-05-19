// src/app/page.tsx
import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/public/home/HeroSection'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
    </main>
  )
}