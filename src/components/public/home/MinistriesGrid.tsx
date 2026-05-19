// src/components/public/home/MinistriesGrid.tsx
// Ministry cards grid — matches v3 design exactly
// Uses Lucide icons, horizontal layout, Pastor Chii Daily has gold highlight

import Link from 'next/link'
import {
  Users, Heart, Shield, Star, Music,
  Globe, Home, HeartHandshake, Flame
} from 'lucide-react'

const ministries = [
  { icon: Users,         name: 'CTY Royal Force',       desc: 'Ages 13–25',               href: '/ministries/youth',              featured: false },
  { icon: Heart,         name: "...Women's Fellowship",   desc: 'Strength in sisterhood',    href: '/ministries/womens-fellowship',  featured: false },
  { icon: Shield,        name: "Mighty Men of David",     desc: 'Purpose-driven men',        href: '/ministries/mens-fellowship',    featured: false },
  { icon: Star,          name: "Children's Church",    desc: 'Ages 3–12',                 href: '/ministries/childrens-church',   featured: false },
  { icon: Music,         name: 'Choir & Worship',      desc: 'Lifting His name',          href: '/ministries/choir',              featured: false },
  { icon: Globe,         name: 'Evangelism and Outreach', desc: 'Taking the gospel out',     href: '/ministries/evangelism',         featured: false },
  { icon: Home,          name: 'Impact Fellowship',    desc: 'Community up close',        href: '/ministries/impact-fellowship',  featured: false },
  { icon: HeartHandshake,name: 'Healing Streams',      desc: 'Restoring marriages',       href: '/ministries/healing-streams',    featured: false },
  { icon: Flame,         name: 'Pastor Chii Daily',    desc: 'Prayer & Devotional',       href: '/ministries/pastor-chii-daily',  featured: true  },
]

export default function MinistriesGrid() {
  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-10">
          <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">
            Find Your Place
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl
                         font-bold text-[#1A1A1A] mb-3">
            Our Ministries
          </h2>
          <p className="text-gray-400 text-base max-w-2xl">
            Vibrant departments ... from children&apos;s church to Santuary keepers.
          </p>
        </div>

        {/* Ministry cards */}
        {/* 2 cols mobile, 3 cols tablet, 5 cols desktop — matches v3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ministries.map((ministry) => {
            const Icon = ministry.icon
            return (
              <Link
                key={ministry.name}
                href={ministry.href}
                className={`
                  flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl
                  border-2 bg-white transition-all duration-200
                  hover:shadow-md hover:-translate-y-0.5 group
                  ${ministry.featured
                    ? 'border-[rgba(184,134,11,0.4)] bg-gradient-to-b from-white to-[#FDF6E3]'
                    : 'border-gray-100 hover:border-[#1E3A8A]'
                  }
                `}
              >
                {/* Icon container */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center mb-3
                  ${ministry.featured
                    ? 'bg-[#FDF6E3] text-[#B8860B]'
                    : 'bg-[#EBF0FA] text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white'
                  }
                  transition-colors duration-200
                `}>
                  <Icon size={20} />
                </div>

                {/* Ministry name */}
                <p className={`font-bold text-xs sm:text-sm leading-tight mb-1
                  ${ministry.featured ? 'text-[#92650A]' : 'text-[#1A1A1A]'}
                `}>
                  {ministry.name}
                </p>

                {/* Description */}
                <p className="text-gray-400 text-xs leading-tight">
                  {ministry.desc}
                </p>

              </Link>
            )
          })}
        </div>

        {/* View all link */}
        <div className="mt-8 text-center">
          <Link href="/ministries"
            className="text-[#1E3A8A] hover:text-[#B8860B] text-sm font-bold
                       transition-colors inline-flex items-center gap-1">
            View All Ministries →
          </Link>
        </div>

      </div>
    </section>
  )
}