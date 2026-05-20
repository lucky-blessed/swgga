'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, ChevronDown, Users, Heart, Shield, Star, Music, Globe, Home, HeartHandshake, Zap } from 'lucide-react'

const ministryLinks = [
  { label: 'CTY Royal Force',     href: '/ministries/youth',             icon: Zap,           desc: 'Youth Ministry' },
  { label: 'Daughter of Esther',  href: '/ministries/womens-fellowship', icon: Heart,         desc: "Women's Fellowship" },
  { label: 'Mighty Men of David', href: '/ministries/mens-fellowship',   icon: Shield,        desc: "Men's Fellowship" },
  { label: "Children's Church",   href: '/ministries/childrens-church',  icon: Star,          desc: 'Ages 3 to 12' },
  { label: 'Choir & Worship',     href: '/ministries/choir',             icon: Music,         desc: 'Lifting His Name' },
  { label: 'Healing Streams',     href: '/ministries/healing-streams',   icon: HeartHandshake,desc: 'Marriage & Family' },
  { label: 'Impact Fellowship',   href: '/ministries/impact-fellowship', icon: Home,          desc: 'Cell Groups' },
  { label: 'CTY Outreach',        href: '/cty',                          icon: Globe,         desc: 'Catch Them Young' },
]

const navLinks = [
  { label: 'Home',    href: '/' },
  { label: 'About',   href: '/about' },
  { label: 'Sermons', href: '/sermons' },
  { label: 'Events',  href: '/events' },
  { label: 'Give',    href: '/give' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [ministryOpen, setMinistryOpen] = useState(false)
  const [mobileMinistryOpen, setMobileMinistryOpen] = useState(false)

  return (
    <nav className="bg-[#1E3A8A] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#0F2460] flex items-center justify-center">
              <span className="text-white font-bold text-sm">SW</span>
            </div>
            <div className="hidden md:block">
              <p className="text-white font-bold text-sm leading-tight">Sure Word GGA</p>
              <p className="text-blue-300 text-xs">Warri · Delta State</p>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
                {link.label}
              </Link>
            ))}

            {/* Ministries dropdown */}
            <div className="relative" onMouseEnter={() => setMinistryOpen(true)} onMouseLeave={() => setMinistryOpen(false)}>
              <button className="flex items-center gap-1 text-blue-100 hover:text-white text-sm font-medium transition-colors py-5">
                Ministries <ChevronDown size={14} className={`transition-transform duration-200 ${ministryOpen ? 'rotate-180' : ''}`} />
              </button>
              {ministryOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-[#0F2460] to-[#1E3A8A] px-5 py-4">
                    <p className="text-white font-bold text-sm">Our Ministries</p>
                    <p className="text-blue-200 text-xs mt-0.5">Ten vibrant departments serving Warri and beyond</p>
                  </div>
                  <div className="grid grid-cols-2 gap-0 p-2">
                    {ministryLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link key={link.label} href={link.href} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
                          <div className="w-8 h-8 bg-[#EBF0FA] group-hover:bg-[#1E3A8A] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                            <Icon size={15} className="text-[#1E3A8A] group-hover:text-white transition-colors duration-200" />
                          </div>
                          <div>
                            <p className="text-[#1A1A1A] text-xs font-bold leading-tight group-hover:text-[#1E3A8A] transition-colors">{link.label}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{link.desc}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    <Link href="/ministries" className="flex items-center justify-between text-[#1E3A8A] font-bold text-xs hover:text-[#B8860B] transition-colors">
                      <span>View All Ministries</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Pastor Chii Daily — standalone */}
            <Link href="/ministries/pastor-chii-daily" className="flex items-center gap-1.5 bg-[rgba(184,134,11,0.15)] hover:bg-[#B8860B] border border-[#B8860B] text-[#F5C518] hover:text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200">
              <Flame size={12} /> Pastor Chii Daily
            </Link>
          </div>

          {/* RIGHT — Give + hamburger */}
          <div className="flex items-center gap-2">
            <Link href="/give" className="bg-[#B8860B] hover:bg-[#92650A] text-white text-sm font-bold px-4 py-2 rounded-full transition-colors">
              Give
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white p-1" aria-label="Toggle menu">
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0F2460] px-4 pb-4 pt-2 max-h-screen overflow-y-auto">
          <div className="flex flex-col gap-1">
            <Link href="/ministries/pastor-chii-daily" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 bg-[rgba(184,134,11,0.15)] border border-[#B8860B] text-[#F5C518] font-bold py-2.5 px-3 rounded-xl text-sm mb-1">
              <Flame size={14} className="text-[#B8860B]" /> Pastor Chii Daily
            </Link>
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="text-blue-100 hover:text-white text-sm font-medium py-2.5 border-b border-blue-800/30 transition-colors">
                {link.label}
              </Link>
            ))}
            <div className="border-b border-blue-800/30">
              <button onClick={() => setMobileMinistryOpen(!mobileMinistryOpen)} className="w-full flex items-center justify-between text-blue-100 text-sm font-medium py-2.5 transition-colors">
                <span>Ministries</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${mobileMinistryOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileMinistryOpen && (
                <div className="pb-3 flex flex-col gap-1 pl-2">
                  {ministryLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-blue-200 hover:text-white text-sm py-1.5 transition-colors">
                        <Icon size={13} className="text-blue-400 flex-shrink-0" />
                        {link.label}
                      </Link>
                    )
                  })}
                  <Link href="/ministries" onClick={() => setMenuOpen(false)} className="text-[#1E3A8A] bg-white text-xs font-bold px-3 py-1.5 rounded-full mt-1 text-center hover:bg-blue-50 transition-colors">
                    View All Ministries →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
