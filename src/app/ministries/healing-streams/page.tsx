'use client'

import ServicesStrip from '@/components/layout/ServicesStrip'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { HeartHandshake, Lock, ShieldCheck, Heart, Play, Headphones, Calendar } from 'lucide-react'
import { useState } from 'react'

const messages = [
  { type: 'video', title: 'When Love Grows Cold - Rekindling Your Marriage', date: '16 Feb 2026', duration: '48 min', gradient: 'from-[#0D1B2A] to-[#1E3A8A]' },
  { type: 'audio', title: 'Forgiveness as a Foundation', date: '19 Jan 2026', duration: '35 min', gradient: 'from-[#92650A] to-[#B8860B]' },
  { type: 'video', title: 'Raising Godly Children in a Broken World', date: '15 Dec 2025', duration: '52 min', gradient: 'from-[#166534] to-[#0D3320]' },
  { type: 'audio', title: 'The Power of Covenant in Marriage', date: '17 Nov 2025', duration: '41 min', gradient: 'from-[#0D1B2A] to-[#152D6E]' },
]

export default function HealingStreamsPage() {
  const [submitted, setSubmitted] = useState(false)
  const [concern, setConcern] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [keepPrivate, setKeepPrivate] = useState(true)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main>
      <ServicesStrip />
      <Navbar />

      {/* PAGE HERO */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-block bg-[rgba(184,134,11,0.15)] border border-[rgba(184,134,11,0.3)] text-[#F5C518] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-5">
              A Ministry of Sure Word Glorious Gospel Assembly
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-4">
              Healing Streams
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed mb-6">
              A safe, confidential space for healing marriages and strengthening relationships, family healing, and emotional wholeness; through Spirit-led care and the Word of God.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Lock size={12} className="text-green-400" /> Strictly Confidential
              </div>
              <div className="flex items-center gap-2 bg-white/10 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full">
                <ShieldCheck size={12} className="text-green-400" /> Goes Only to Senior Pastor
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MONTHLY PROGRAMME BANNER */}
      <section className="bg-gradient-to-r from-[#B8860B] to-[#92650A] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-base">Healing Streams Monthly Programme</p>
                <p className="text-yellow-100 text-sm">Every Third Sunday of the Month · Sure Word Glorious Gospel Assembly, Warri</p>
              </div>
            </div>
            <button className="bg-white text-[#92650A] hover:bg-yellow-50 font-bold text-sm px-5 py-2.5 rounded-full transition-colors duration-200 flex-shrink-0">
              Register for Next Programme
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* LEFT - About the ministry */}
          <div>
            <div className="w-14 h-14 bg-[#EBF0FA] rounded-2xl flex items-center justify-center mb-6">
              <HeartHandshake size={28} className="text-[#1E3A8A]" />
            </div>
            <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">Who We Help</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#1A1A1A] mb-5">
              Healing Marriages and Strengthening Relationships
            </h2>
            <div className="space-y-4 text-[#374151] text-base leading-relaxed mb-8">
              <p>
                Healing Streams is the confidential pastoral care and family restoration ministry of Sure Word Glorious Gospel Assembly. We believe that no marriage is beyond God&apos;s redemption and no family is too broken to be restored.
              </p>
              <p>
                Every concern shared through Healing Streams goes directly and exclusively to Rev. Chijioke Igbani. Your privacy is protected absolutely, nothing is shared without your explicit consent.
              </p>
              <p>
                Every third Sunday, we host a special programme open to all, a time of teaching, prayer, and ministry focused on marriage, family, and wholeness.
              </p>
            </div>

            {/* What we address */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-[#1A1A1A] text-sm font-bold mb-4">Areas We Minister To</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Marriage Challenges',
                  'Family Conflict',
                  'Grief & Loss',
                  'Emotional Distress',
                  'Pre-marital Concerns',
                  'Parenting Struggles',
                  'Spiritual Crises',
                  'Personal Challenges',
                ].map((area) => (
                  <div key={area} className="flex items-center gap-2 text-[#374151] text-sm">
                    <Heart size={12} className="text-[#B8860B] flex-shrink-0" />
                    {area}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT - Confidential contact form */}
          <div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <Lock size={18} className="text-[#1E3A8A]" />
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#1A1A1A]">
                  Reach Out Confidentially
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Your message goes directly and exclusively to Rev. Chijioke Igbani
              </p>
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeartHandshake size={28} className="text-[#166534]" />
                  </div>
                  <h4 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#166534] mb-2">
                    Message Received
                  </h4>
                  <p className="text-[#374151] text-sm leading-relaxed">
                    Thank you for reaching out. Rev. Chijioke Igbani will respond to you personally and in strict confidence. You are not alone.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">Your First Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">Phone or Email (for response)</label>
                    <input type="text" required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+234... or email@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">Share Your Concern</label>
                    <textarea required value={concern} onChange={(e) => setConcern(e.target.value)} rows={5} placeholder="You can share as much or as little as you are comfortable with. Everything is confidential." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A] transition-colors resize-none" />
                  </div>
                  <div className="flex items-start gap-3 bg-[#EBF0FA] rounded-xl p-3 cursor-pointer" onClick={() => setKeepPrivate(!keepPrivate)}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-colors ${keepPrivate ? 'bg-[#1E3A8A] border-[#1E3A8A]' : 'border-gray-300'}`}>
                      {keepPrivate && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div>
                      <p className="text-[#1E3A8A] text-xs font-bold">Keep this strictly private</p>
                      <p className="text-[#374151] text-xs mt-0.5">Only Rev. Chijioke Igbani will have access to this message</p>
                    </div>
                  </div>
                  <button type="submit" className="bg-[#1E3A8A] hover:bg-[#0F2460] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors duration-200">
                    <Lock size={16} /> Send Confidentially
                  </button>
                </form>
              )}
            </div>
            <div className="mt-4 bg-[#FDF6E3] border border-[rgba(184,134,11,0.2)] rounded-2xl p-4 text-center">
              <p className="text-[#92650A] text-xs leading-relaxed">
                <strong>Your privacy is sacred to us.</strong> No information shared through Healing Streams is ever disclosed to anyone other than Rev. Chijioke Igbani without your explicit permission.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* HEALING STREAMS MESSAGES */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">Programme Messages</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#1A1A1A] mb-2">
              Healing Streams Media
            </h2>
            <p className="text-gray-400 text-base">Messages from our monthly programmes - watch or listen at your own pace</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {messages.map((msg) => (
              <div key={msg.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                <div className={`bg-gradient-to-br ${msg.gradient} aspect-video flex items-center justify-center`}>
                  {msg.type === 'video' ? (
                    <div className="w-12 h-12 bg-[#B8860B] rounded-full flex items-center justify-center shadow-lg">
                      <Play size={20} className="text-white ml-0.5" />
                    </div>
                  ) : (
                    <Headphones size={28} className="text-white/40" />
                  )}
                </div>
                <div className="p-4">
                  <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${msg.type === 'video' ? 'bg-[#EBF0FA] text-[#1E3A8A]' : 'bg-[#FDF6E3] text-[#92650A]'}`}>
                    {msg.type === 'video' ? 'Video' : 'Audio'}
                  </div>
                  <h4 className="font-[family-name:var(--font-heading)] text-sm font-bold text-[#1A1A1A] leading-snug mb-1 group-hover:text-[#1E3A8A] transition-colors">
                    {msg.title}
                  </h4>
                  <p className="text-gray-400 text-xs">{msg.date} · {msg.duration}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button className="border-2 border-gray-200 hover:border-[#1E3A8A] text-gray-500 hover:text-[#1E3A8A] font-bold px-8 py-3 rounded-full transition-colors duration-200 text-sm">
              View All Healing Streams Messages
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
