import Link from 'next/link'
import { MapPin, Mail, Phone } from 'lucide-react'
import { FaFacebook, FaYoutube, FaWhatsapp } from 'react-icons/fa'

const SOCIAL_LINKS = [
  {
    Icon:  FaFacebook,
    label: 'Facebook',
    href:  'https://www.facebook.com/share/1BFsiTkb6V/',
    color: 'hover:bg-[#1877F2]',
  },
  {
    Icon:  FaYoutube,
    label: 'YouTube',
    href:  'https://www.youtube.com/@SureWordGospel',
    color: 'hover:bg-[#FF0000]',
  },
  {
    Icon:  FaWhatsapp,
    label: 'WhatsApp',
    href:  'https://wa.me/channel/0029VbB8W8k2f3ELvngFmd3W',
    color: 'hover:bg-[#25D366]',
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#0D1B2A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center sm:text-left">

          {/* Column 1 - Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">SW</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">Sure Word Glorious Gospel Assembly</p>
                  <p className="text-white/40 text-xs">Warri · Delta State</p>
                </div>
              </Link>
            </div>
            <p className="text-white/40 text-sm leading-relaxed italic mb-5">
              &ldquo;Making a difference by the Word.&rdquo;
            </p>
            {/* Social icons */}
            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              {SOCIAL_LINKS.map(({ Icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 ${color} transition-colors duration-200`}
                >
                  <Icon size={14} className="text-white" />
                  <span className="text-white text-xs font-medium">{label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-widest uppercase mb-5 border-b border-white/10 pb-3">
              Quick Links
            </h5>
            <div className="flex flex-col gap-2.5 items-center sm:items-start">
              {[
                { label: 'About Us',       href: '/about' },
                { label: 'Sermons',        href: '/sermons' },
                { label: 'Events',         href: '/events' },
                { label: 'Give Online',    href: '/give' },
                { label: 'Contact',        href: '/contact' },
                { label: 'Member Portal',  href: '/portal/login' },
                { label: 'Join Us',        href: '/portal/register' },
              ].map((link) => (
                <Link key={link.label} href={link.href}
                  className="text-white/50 hover:text-[#B8860B] text-sm transition-colors duration-200">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3 - Ministries */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-widest uppercase mb-5 border-b border-white/10 pb-3">
              Ministries
            </h5>
            <div className="flex flex-col gap-2.5 items-center sm:items-start">
              {[
                { label: 'CTY Outreach',       href: '/cty' },
                { label: 'Pastor Chii Daily',  href: '/ministries/pastor-chii-daily' },
                { label: 'Daughter of Esther', href: '/ministries/womens-fellowship' },


                { label: 'CTY Royal Force',    href: '/ministries/youth' },
                { label: 'Healing Streams',    href: '/ministries/healing-streams' },
                { label: 'Impact Fellowship',  href: '/ministries/impact-fellowship' },
              ].map((link) => (
                <Link key={link.label} href={link.href}
                  className="text-white/50 hover:text-[#B8860B] text-sm transition-colors duration-200">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-widest uppercase mb-5 border-b border-white/10 pb-3">
              Connect With Us
            </h5>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-start gap-3 text-white/50 text-sm justify-center sm:justify-start">
                <MapPin size={14} className="text-[#B8860B] mt-0.5 flex-shrink-0" />
                <span>Warri / Effurun, Delta State, Nigeria</span>
              </div>
              <div className="flex items-center gap-3 text-white/50 text-sm justify-center sm:justify-start">
                <Mail size={14} className="text-[#B8860B] flex-shrink-0" />
                <span>info@surewordgga.org</span>
              </div>
              <div className="flex items-center gap-3 text-white/50 text-sm justify-center sm:justify-start">
                <Phone size={14} className="text-[#B8860B] flex-shrink-0" />
                <span>+234 800 000 0000</span>
              </div>
            </div>

            {/* Social links with labels */}
            <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start">
              {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-white/40 hover:text-[#B8860B] text-sm transition-colors duration-200"
                >
                  <Icon size={14} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs text-center sm:text-left">
            © 2026 Sure Word Glorious Gospel Assembly · Warri, Nigeria
          </p>
          <div className="text-white/20 text-xs text-center sm:text-right">
            <span>Built by </span>
            <a href="https://blessedtechnologies.com" target="_blank" rel="noopener noreferrer"
              className="text-[#B8860B] hover:text-white transition-colors font-semibold">
              Blessed Technologies
            </a>
            <span> · A Subsidiary of The Blessed Group</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
