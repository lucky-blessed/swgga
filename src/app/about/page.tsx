import ServicesStrip from '@/components/layout/ServicesStrip'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import VisionBand from '@/components/public/home/VisionBand'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const beliefs = [
  { title: 'The Holy Scriptures', body: 'We believe the Bible is the inspired, infallible Word of God, the supreme authority for all faith and practice.' },
  { title: 'Salvation by Grace', body: 'We believe in salvation through faith in Jesus Christ alone; not by works but by His grace and finished work on the cross.' },
  { title: 'The Holy Spirit', body: 'We believe in the baptism of the Holy Spirit with the evidence of speaking in other tongues, as on the day of Pentecost.' },
  { title: 'Divine Healing', body: 'We believe that healing is provided in the atonement of Christ and that God still heals the sick today through prayer and faith.' },
]

const services = ['Sunday Service', 'Wednesday Word Feast', 'Saturday Moment of Encounter']

export default function AboutPage() {
  return (
    <main>
      <ServicesStrip />
      <Navbar />
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[rgba(184,134,11,0.15)] border border-[rgba(184,134,11,0.3)] text-[#F5C518] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-5">
            Pentecostal · Warri, Delta State
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-4">
            About Sure Word Glorious Gospel Assembly
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto leading-relaxed">
            A Spirit-filled church built on the uncompromising Word of God, serving Warri, Delta State and the world
          </p>
        </div>
      </section>
      <VisionBand />
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">Senior Pastor</p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-8">Meet Our Shepherd</h2>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-md">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/5 relative min-h-[420px] lg:min-h-[540px]">
                <Image
                  src="/images/pastor-chii.jpg"
                  alt="Rev. Chijioke Igbani - Senior Pastor, Sure Word Glorious Gospel Assembly"
                  fill
                  className="object-cover object-top"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0D1B2A] to-transparent p-5">
                  <div className="inline-block bg-[#B8860B] text-white text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                    Senior Pastor
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-1">Rev. Chijioke Igbani</h3>
                <p className="text-[#B8860B] font-semibold text-sm tracking-wide mb-6">Senior Pastor · Founder · Sure Word Glorious Gospel Assemly</p>
                <p className="text-[#374151] text-base leading-relaxed mb-8">Rev. Chijioke Igbani is the founder and Senior Pastor of Sure Word Glorious Gospel Assembly. A man of deep faith, prayer, and unwavering commitment to the Word, he has dedicated his life to building a community where the gospel transforms lives. Under his visionary leadership, the church has become a vibrant family of believers impacting Warri, Delta State, and beyond - through Spirit-filled worship, practical discipleship, and compassionate outreach through ministries like Healing Streams and Catch Them Young. His vision to raise a nation of discipled men who are grounded, rooted, and living in the Word drives everything Sure Word does.</p>
                <div>
                  <Link href="/ministries/pastor-chii-daily" className="inline-flex items-center gap-2 bg-[#B8860B] hover:bg-[#92650A] text-white text-sm font-bold px-6 py-3 rounded-full transition-colors duration-200">Join Pastor Chii Daily</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">What We Believe</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">Our Statement of Faith</h2>
            <p className="text-gray-400 text-base">Rooted in Scripture, led by the Holy Spirit, and grounded in the apostolic faith</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {beliefs.map((belief) => (
              <div key={belief.title} className="bg-white rounded-2xl p-6 border-l-4 border-[#1E3A8A] shadow-sm hover:shadow-md transition-shadow duration-200">
                <h4 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#1E3A8A] mb-2">{belief.title}</h4>
                <p className="text-[#374151] text-sm leading-relaxed">{belief.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">Location</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">Find Us</h2>
            <p className="text-gray-400 text-base">We would love to welcome you this Sunday</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sm:p-8 flex items-start gap-5 mb-6">
            <div className="w-12 h-12 bg-[#1E3A8A] rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={22} className="text-white" />
            </div>
            <div>
              <h4 className="font-bold text-[#1A1A1A] text-base mb-2">Sure Word Glorious Gospel Assembly</h4>
              <p className="text-[#374151] text-sm leading-relaxed mb-4">
                Warri / Effurun, Delta State, Nigeria<br />
                Sunday Service · Wednesday Bible Study · Friday Prayer Night<br />
                <span className="text-gray-400">Contact us or visit surewordgga.org for current service times</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <div key={s} className="bg-[#EBF0FA] text-[#1E3A8A] text-xs font-bold px-3 py-1 rounded-full">{s}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-100 h-48 bg-gradient-to-br from-[#EBF0FA] to-[#DBEAFE] flex flex-col items-center justify-center gap-3">
            <MapPin size={40} className="text-[#1E3A8A]" />
            <p className="text-[#374151] font-bold text-sm">Google Maps - Warri / Effurun, Delta State</p>
            <Link href="https://maps.google.com/?q=Warri,Delta+State,Nigeria" target="_blank" className="bg-[#1E3A8A] hover:bg-[#0F2460] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">Get Directions</Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
