import ServicesStrip from '@/components/layout/ServicesStrip'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Users, Heart, Shield, Star, Music, Globe, Home, HeartHandshake, Flame, Zap } from 'lucide-react'
import Link from 'next/link'

const ministries = [
  {
    icon: Flame,
    name: 'Pastor Chii Daily',
    tagline: 'Prayer Connect with Pastor Chii & Daily Devotional',
    description: 'Daily prayer connect and devotional ministry with Rev. Chijioke Igbani. Facebook Live prayer every evening, daily written and audio devotionals, and a dedicated WhatsApp prayer channel.',
    href: '/ministries/pastor-chii-daily',
    featured: true,
  },
  {
    icon: Zap,
    name: 'CTY Royal Force',
    tagline: 'Youth Ministry',
    description: 'Raising Spirit-filled young people between the ages of 13 and 25 who are grounded in the Word, led by the Spirit, and committed to a life of purpose.',
    href: '/ministries/youth',
    featured: false,
  },
  {
    icon: Heart,
    name: 'Daughter of Esther',
    tagline: "Women's Fellowship",
    description: 'Empowering women through the Word of God - building strength, sisterhood, and Spirit-led purpose in every season of life.',
    href: '/ministries/womens-fellowship',
    featured: false,
  },
  {
    icon: Shield,
    name: 'Mighty Men of David',
    tagline: "Men's Fellowship",
    description: 'Building purpose-driven men of faith who lead their homes, communities, and workplaces with integrity, courage, and the Word of God.',
    href: '/ministries/mens-fellowship',
    featured: false,
  },
  {
    icon: Star,
    name: "Children of Destiny",
    tagline: 'Ages 3 to 12',
    description: 'Age-appropriate spiritual education for children - teaching the Word of God through stories, songs, activities, and Spirit-filled worship.',
    href: '/ministries/childrens-church',
    featured: false,
  },
  {
    icon: Music,
    name: 'Choir & Worship Team',
    tagline: 'Lifting His Name',
    description: 'Leading the Sure Word congregation in Spirit-filled worship every service. Dedicated to excellence in music, sound, and the presence of God.',
    href: '/ministries/choir',
    featured: false,
  },
  {
    icon: Globe,
    name: 'Evangelism & Outreach',
    tagline: 'Taking the Gospel Out to Reach The Unreached',
    description: 'Taking the gospel of Jesus Christ beyond the walls of Sure Word - through street evangelism, community outreach, and missions across Delta State.',
    href: '/ministries/evangelism',
    featured: false,
  },
  {
    icon: Home,
    name: 'Impact Fellowship',
    tagline: 'Community Cell Groups',
    description: 'Small weekly community groups across Warri and Effurun where members grow together in the Word, pray for one another, and build lasting relationships.',
    href: '/ministries/impact-fellowship',
    featured: false,
  },
  {
    icon: HeartHandshake,
    name: 'Healing Streams',
    tagline: 'Healing Marriages & Strenghtening Relationships',
    description: 'A confidential ministry dedicated to marriage restoration, family healing, and emotional wholeness - through Spirit-led counselling and the Word of God.',
    href: '/ministries/healing-streams',
    featured: false,
  },
  {
    icon: Users,
    name: 'CTY',
    tagline: 'Catch Them Young Outreach Ministry',
    description: 'A semi-independent outreach arm of Sure Word reaching at-risk and unchurched young people across Warri through education, skill development, and the gospel.',
    href: '/cty',
    featured: false,
  },
]

export default function MinistriesPage() {
  return (
    <main>
      <ServicesStrip />
      <Navbar />

      {/* PAGE HERO */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-4">
            Our Ministries
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Ten vibrant ministries - from daily devotional to marriage restoration, from children to outreach
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map((ministry) => {
            const Icon = ministry.icon
            return (
              <Link
                key={ministry.name}
                href={ministry.href}
                className={`group flex flex-col p-6 rounded-2xl border-2 bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                  ministry.featured
                    ? 'border-[#B8860B] bg-gradient-to-br from-white to-[#FDF6E3]'
                    : 'border-gray-100 hover:border-[#1E3A8A]'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 ${
                  ministry.featured
                    ? 'bg-[#FDF6E3] text-[#B8860B]'
                    : 'bg-[#EBF0FA] text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white'
                }`}>
                  <Icon size={22} />
                </div>
                <div className="mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${ministry.featured ? 'text-[#B8860B]' : 'text-[#B8860B]'}`}>
                    {ministry.tagline}
                  </span>
                </div>
                <h3 className={`font-[family-name:var(--font-heading)] text-xl font-bold mb-3 transition-colors duration-200 ${
                  ministry.featured ? 'text-[#92650A]' : 'text-[#1A1A1A] group-hover:text-[#1E3A8A]'
                }`}>
                  {ministry.name}
                </h3>
                <p className="text-[#374151] text-sm leading-relaxed flex-1">
                  {ministry.description}
                </p>
                <div className={`mt-4 text-xs font-bold flex items-center gap-1 transition-colors duration-200 ${
                  ministry.featured ? 'text-[#B8860B]' : 'text-[#1E3A8A]'
                }`}>
                  Learn more →
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <Footer />
    </main>
  )
}
