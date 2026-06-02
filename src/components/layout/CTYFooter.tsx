import Link from 'next/link'
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa'
import { MapPin, Mail } from 'lucide-react'

export default function CTYFooter() {
  return (
    <footer className="bg-[#051A0D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center sm:text-left">

          {/* Column 1 - CTY Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-[#4ADE80] flex items-center justify-center flex-shrink-0">
                <span className="text-[#166534] font-black text-xs">CTY</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Catch Them Young</p>
                <p className="text-green-400/50 text-xs">Outreach Ministry</p>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed italic">
              &ldquo;Catching the next generation for God and for good.&rdquo;
            </p>
            <div className="mt-4 inline-block bg-white/10 text-green-400/70 text-xs px-3 py-1 rounded-full">
              A Ministry of Sure Word Glorious Gospel Assembly
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-widest uppercase mb-5 border-b border-white/10 pb-3">
              Quick Links
            </h5>
            <div className="flex flex-col gap-2.5 items-center sm:items-start">
              {[
                { label: 'About CTY',          href: '/cty#about' },
                { label: 'Our Programmes',     href: '/cty#programmes' },
                { label: 'Get Involved',       href: '/cty#get-involved' },
                { label: 'Give to CTY',        href: '/give' },
                { label: 'Contact CTY',        href: '/contact' },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="text-white/50 hover:text-[#4ADE80] text-sm transition-colors duration-200">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3 - Programmes */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-widest uppercase mb-5 border-b border-white/10 pb-3">
              Programmes
            </h5>
            <div className="flex flex-col gap-2.5 items-center sm:items-start">
              {[
                'Gospel Clubs',
                'Skills Training',
                'Community Outreaches',
                'School Partnerships',
                'Prayer Support',
              ].map((item) => (
                <span key={item} className="text-white/50 text-sm">{item}</span>
              ))}
            </div>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-widest uppercase mb-5 border-b border-white/10 pb-3">
              Contact CTY
            </h5>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-start gap-3 text-white/50 text-sm justify-center sm:justify-start">
                <MapPin size={14} className="text-[#4ADE80] mt-0.5 flex-shrink-0" />
                <span>Warri / Effurun, Delta State, Nigeria</span>
              </div>
              <div className="flex items-center gap-3 text-white/50 text-sm justify-center sm:justify-start">
                <Mail size={14} className="text-[#4ADE80] flex-shrink-0" />
                <span>cty@surewordgga.org</span>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              {[
                { Icon: FaFacebook,  label: 'Facebook' },
                { Icon: FaInstagram, label: 'Instagram' },
                { Icon: FaYoutube,   label: 'YouTube' },
                { Icon: FaTiktok,    label: 'TikTok' },
              ].map(({ Icon, label }) => (
                <div key={label} className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#4ADE80] flex items-center justify-center cursor-pointer transition-colors duration-200 group" aria-label={label}>
                  <Icon size={15} className="text-white group-hover:text-[#166534]" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs text-center sm:text-left">
            © 2026 Catch Them Young · A Ministry of Sure Word Glorious Gospel Assembly · Warri, Nigeria
          </p>
          <div className="text-white/20 text-xs text-center sm:text-right">
            <span>Built by </span>
            <a href="https://blessedtechnologies.com" target="_blank" rel="noopener noreferrer" className="text-[#4ADE80] hover:text-white transition-colors font-semibold">Blessed Technologies</a>
            <span> · A Subsidiary of The Blessed Group</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
