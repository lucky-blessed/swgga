// src/components/layout/Footer.tsx
// Site-wide footer — four columns matching v3 design
// Dark blue background, vision quote, quick links, ministries, contact

import Link from 'next/link'
import { MapPin, Mail, Phone } from 'lucide-react'

import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-[#0D1B2A] text-white">

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand and vision */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">SW</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Sure Word GGA</p>
                <p className="text-white/40 text-xs">Warri · Delta State</p>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed italic">
              &ldquo;Raising a nation of discipled men who are grounded, rooted
              and are living in the Word of God.&rdquo;
            </p>
          </div>

          {/* Column 2 — Quick links */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-widest uppercase mb-5 border-b border-white/10 pb-3">
              Quick Links
            </h5>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'About Us',    href: '/about' },
                { label: 'Sermons',     href: '/sermons' },
                { label: 'Events',      href: '/events' },
                { label: 'Give Online', href: '/give' },
                { label: 'Contact',     href: '/contact' },
              ].map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/50 hover:text-[#B8860B] text-sm transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3 — Ministries */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-widest uppercase mb-5 border-b border-white/10 pb-3">
              Ministries
            </h5>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Youth Ministry',     href: '/ministries/youth' },
                { label: "Women's Fellowship", href: '/ministries/womens-fellowship' },
                { label: 'Healing Streams',    href: '/ministries/healing-streams' },
                { label: 'Pastor Chii Daily',  href: '/ministries/pastor-chii-daily' },
                { label: 'CTY Outreach',       href: '/cty' },
                { label: 'Impact Fellowship',  href: '/ministries/impact-fellowship' },
              ].map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/50 hover:text-[#B8860B] text-sm transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-widest uppercase mb-5 border-b border-white/10 pb-3">
              Contact
            </h5>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-start gap-3 text-white/50 text-sm">
                <MapPin size={14} className="text-[#B8860B] mt-0.5 flex-shrink-0" />
                <span>Warri / Effurun, Delta State, Nigeria</span>
              </div>
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <Mail size={14} className="text-[#B8860B] flex-shrink-0" />
                <span>info@surewordgga.org</span>
              </div>
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <Phone size={14} className="text-[#B8860B] flex-shrink-0" />
                <span>+234 800 000 0000</span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
            {[
                { Icon: FaFacebook,  label: 'Facebook' },
                { Icon: FaInstagram, label: 'Instagram' },
                { Icon: FaYoutube,   label: 'YouTube' },
                { Icon: FaTiktok,    label: 'TikTok' },
            ].map(({ Icon, label }) => (
                <div
                key={label}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B8860B]
                            flex items-center justify-center cursor-pointer
                            transition-colors duration-200"
                aria-label={label}
                >
                <Icon size={15} className="text-white" />
                </div>
            ))}
            </div>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Copyright */}
          <p className="text-white/30 text-xs text-center sm:text-left">
            © 2026 Sure Word Glorious Gospel Assembly · Warri, Nigeria
          </p>

           {/* Built by */}
           <div className="text-white/20 text-xs text-center sm:text-right">
            <span>Built by </span>
            <a href="https://blessedtechnologies.com" target="_blank" rel="noopener noreferrer" className="text-[#B8860B] hover:text-white transition-colors font-semibold">Blessed Technologies</a>
            <span> · A Subsidiary of Blessed Group</span>
          </div>
        </div>
      </div>

    </footer>
  )
}