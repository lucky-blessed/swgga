'use client'

import ServicesStrip from '@/components/layout/ServicesStrip'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Mail, Phone, Send } from 'lucide-react'
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa'
import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '', heard_from: '', message: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/first-timers', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or call us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <ServicesStrip />
      <Navbar />

      {/* PAGE HERO */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">
            We would love to hear from you - whether you are visiting for the first time or have been with us for years
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* LEFT - First timer form */}
          <div>
            <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">
              First Time Here?
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#1A1A1A] mb-3">
              We Would Love to Meet You
            </h2>
            <p className="text-gray-400 text-base mb-8">
              Fill in your details below and our welcome team will reach out to you personally
            </p>

            {submitted ? (
              <div className="bg-[#DCFCE7] border border-[#166534]/20 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 bg-[#166534] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={22} className="text-white" />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#166534] mb-2">
                  Welcome to Sure Word Glorious Gospel Assembly!
                </h3>
                <p className="text-[#374151] text-sm leading-relaxed">
                  Thank you for reaching out. Our welcome team will contact you within 24 hours.
                  We look forward to meeting you!
                </p>
              </div>
            ) : (
              <>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your first name"
                      value={form.first_name}
                      onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your last name"
                      value={form.last_name}
                      onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">
                    How Did You Hear About Us?
                  </label>
                  <select value={form.heard_from} onChange={e => setForm(p => ({ ...p, heard_from: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A] transition-colors bg-white text-gray-600">
                    <option value="">Select an option</option>
                    <option>Friend or Family</option>
                    <option>Social Media</option>
                    <option>YouTube</option>
                    <option>Pastor Chii Daily</option>
                    <option>CTY Outreach</option>
                    <option>Walked Past the Church</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">
                    Message (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Any questions or anything you would like us to know..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1E3A8A] disabled:opacity-60 hover:bg-[#0F2460] text-white font-bold px-6 py-4 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
              </>
            )}
          </div>

          {/* RIGHT - Contact details */}
          <div className="flex flex-col gap-6">

            <div>
              <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">
                Contact Details
              </p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#1A1A1A] mb-6">
                Find Us
              </h2>
            </div>

            {/* Contact cards */}
            {[
              { icon: MapPin, label: 'Location', lines: ['Warri / Effurun', 'Delta State, Nigeria'] },
              { icon: Mail,   label: 'Email',    lines: ['info@surewordgga.org'] },
              { icon: Phone,  label: 'Phone',    lines: ['+234 800 000 0000'] },
            ].map(({ icon: Icon, label, lines }) => (
              <div key={label} className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="w-11 h-11 bg-[#1E3A8A] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[#B8860B] text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                  {lines.map((line) => (
                    <p key={line} className="text-[#374151] text-sm font-medium">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Social media */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <p className="text-[#B8860B] text-xs font-bold uppercase tracking-wider mb-4">Follow Us</p>
              <div className="flex items-center gap-3">
                {[
                  { Icon: FaFacebook,  label: 'Facebook',  color: 'hover:bg-[#1877F2]' },
                  { Icon: FaInstagram, label: 'Instagram', color: 'hover:bg-[#E1306C]' },
                  { Icon: FaYoutube,   label: 'YouTube',   color: 'hover:bg-[#FF0000]' },
                  { Icon: FaTiktok,    label: 'TikTok',    color: 'hover:bg-[#000000]' },
                ].map(({ Icon, label, color }) => (
                  <div
                    key={label}
                    className={`w-11 h-11 rounded-xl bg-[#1E3A8A] ${color} flex items-center justify-center cursor-pointer transition-colors duration-200`}
                    aria-label={label}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                ))}
              </div>
            </div>

            {/* Prayer request CTA */}
            <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1E3A8A] rounded-2xl p-6 text-center">
              <h4 className="font-[family-name:var(--font-heading)] text-white text-lg font-bold mb-2">
                Need Prayer or Counselling?
              </h4>
              <p className="text-blue-200 text-sm mb-4">
                Send a prayer request directly to Pastor Chii or book a counselling session.
              </p>
              <Link
                href="/ministries/pastor-chii-daily"
                className="inline-flex items-center gap-2 bg-[#B8860B] hover:bg-[#92650A] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors duration-200"
              >
                Send Prayer Request
              </Link>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
