'use client'

import ServicesStrip from '@/components/layout/ServicesStrip'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useState, useEffect } from 'react'
import { Play, Headphones, Share2, Link2, BookOpen, Mic } from 'lucide-react'
import { FaWhatsapp, FaFacebook } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { latestDevotionalQuery, latestPrayerConnectQuery, devotionalArchiveQuery } from '@/sanity/lib/queries'

const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VbB8W8k2f3ELvngFmd3W'

function Countdown({ facebookLiveUrl }: { facebookLiveUrl?: string }) {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' })

  useEffect(() => {
    function update() {
      const now = new Date()
      const watMs = now.getTime() + (now.getTimezoneOffset() * 60000) + (60 * 60000)
      const watNow = new Date(watMs)
      const target = new Date(watNow)
      target.setHours(21, 0, 0, 0)
      if (watNow >= target) target.setDate(target.getDate() + 1)
      const diff = Math.floor((target.getTime() - watNow.getTime()) / 1000)
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setTime({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1E3A8A] rounded-2xl p-8 text-center mb-4">
      <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-5">Next Prayer Session</p>
      <div className="flex justify-center items-start gap-3 mb-4">
        {[{ val: time.h, label: 'Hours' }, { val: time.m, label: 'Minutes' }, { val: time.s, label: 'Seconds' }].map((unit, i) => (
          <div key={unit.label} className="flex items-start gap-3">
            <div className="text-center">
              <div className="font-[family-name:var(--font-heading)] text-5xl font-bold text-[#F5C518] leading-none">{unit.val}</div>
              <div className="text-white/40 text-xs uppercase tracking-wider mt-2">{unit.label}</div>
            </div>
            {i < 2 && <div className="font-[family-name:var(--font-heading)] text-4xl text-white/20 mt-1">:</div>}
          </div>
        ))}
      </div>
      <p className="text-white/30 text-xs italic mb-4">Facebook Live every evening · 9:00 PM WAT</p>
      <button
        onClick={() => window.open(facebookLiveUrl || 'https://www.facebook.com', '_blank')}
        className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#1565D8] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors duration-200"
      >
        <FaFacebook size={14} /> Join Live on Facebook
      </button>
      <p className="text-white/20 text-xs mt-2 italic">Link updated daily before 9PM WAT</p>
    </div>
  )
}

export default function PastorChiiDailyPage() {
  const [prayerName, setPrayerName] = useState('')
  const [prayerRequest, setPrayerRequest] = useState('')
  const [prayerSent, setPrayerSent] = useState(false)
  const [devotional, setDevotional] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [archive, setArchive] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [dev, sess, arch] = await Promise.all([
          client.fetch(latestDevotionalQuery),
          client.fetch(latestPrayerConnectQuery),
          client.fetch(devotionalArchiveQuery),
        ])
        setDevotional(dev)
        setSession(sess)
        setArchive(arch || [])
      } catch (e) {
        console.error('Sanity fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function handlePrayerSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPrayerSent(true)
  }

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <main>
      <ServicesStrip />
      <Navbar />

      {/* PAGE HERO */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-16 relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B8860B] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[rgba(184,134,11,0.15)] border border-[rgba(184,134,11,0.3)] text-[#F5C518] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-4">
            A Ministry of Sure Word GGA
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-3">
            Pastor Chii Daily
          </h1>
          <p className="text-blue-200 text-lg max-w-xl leading-relaxed">
            Daily prayer and devotion with Rev. Chijioke Igbani — grounding you in the Word of God, every single day.
          </p>
        </div>
      </section>

      {/* PRAYER CONNECT */}
      <section className="bg-gradient-to-b from-[#FDF6E3] to-[#F9FAFB] py-16 border-b-2 border-[rgba(184,134,11,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-[#B8860B] rounded-full" />
            <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              Prayer Connect with Pastor Chii
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Countdown facebookLiveUrl={session?.facebookLiveUrl} />
              <Link
                href={session?.whatsappChannelUrl || WHATSAPP_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-sm transition-colors duration-200 mb-3"
              >
                <FaWhatsapp size={20} /> Join Prayer Connect WhatsApp Channel
              </Link>
              <p className="text-center text-gray-400 text-xs">
                Short recorded audio prayers posted daily by Pastor Chii
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#1A1A1A] mb-1">Send a Prayer Request</h3>
              <p className="text-gray-400 text-sm mb-5">Goes directly and exclusively to Pastor Chii</p>
              {prayerSent ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={24} className="text-[#166534]" />
                  </div>
                  <p className="font-bold text-[#166534] mb-1">Prayer Request Sent</p>
                  <p className="text-gray-400 text-sm">Pastor Chii will pray over your request personally.</p>
                </div>
              ) : (
                <form onSubmit={handlePrayerSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">Your First Name</label>
                    <input type="text" required value={prayerName} onChange={(e) => setPrayerName(e.target.value)} placeholder="Your first name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B8860B] transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">Your Prayer Request</label>
                    <textarea required value={prayerRequest} onChange={(e) => setPrayerRequest(e.target.value)} rows={5} placeholder="Share your prayer request with Pastor Chii..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B8860B] transition-colors resize-none" />
                  </div>
                  <button type="submit" className="bg-gradient-to-r from-[#B8860B] to-[#92650A] hover:from-[#92650A] hover:to-[#7A5408] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200">
                    <Share2 size={16} /> Send to Pastor Chii
                  </button>
                  <div className="flex items-center gap-2 bg-[#EBF0FA] rounded-xl p-3">
                    <BookOpen size={14} className="text-[#1E3A8A] flex-shrink-0" />
                    <p className="text-[#1E3A8A] text-xs">Received directly and exclusively by Rev. Chijioke Igbani</p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DAILY DEVOTIONAL */}
      <section className="bg-[#F9FAFB] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-[#1E3A8A] rounded-full" />
            <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-[#1A1A1A]">Daily Devotional</h2>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading today&apos;s devotional...</div>
          ) : devotional ? (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="bg-[#EBF0FA] text-[#1E3A8A] text-xs font-bold px-3 py-1 rounded-full">{today}</div>
                {devotional.episodeNumber && (
                  <div className="bg-[#FDF6E3] text-[#92650A] text-xs font-bold px-3 py-1 rounded-full">Episode {devotional.episodeNumber}</div>
                )}
              </div>

              {/* Scripture */}
              {devotional.scriptureText && (
                <div className="bg-[#EBF0FA] border-l-4 border-[#1E3A8A] rounded-r-2xl p-5 mb-8">
                  <p className="text-[#1E3A8A] text-xs font-bold uppercase tracking-widest mb-2">Today&apos;s Scripture — {devotional.scripture}</p>
                  <p className="font-[family-name:var(--font-heading)] text-base sm:text-lg text-[#1A1A1A] italic leading-relaxed">
                    &ldquo;{devotional.scriptureText}&rdquo;
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#1A1A1A] mb-4">{devotional.title}</h3>
                  {devotional.body && devotional.body.map((block: any, i: number) => (
                    block._type === 'block' && (
                      <p key={i} className="text-[#374151] text-base leading-relaxed mb-4">
                        {block.children?.map((child: any) => child.text).join('')}
                      </p>
                    )
                  ))}
                  {devotional.prayerPoint && (
                    <div className="bg-[#FDF6E3] border-l-4 border-[#B8860B] rounded-r-xl p-4 mb-4">
                      <p className="text-[#B8860B] text-xs font-bold uppercase tracking-wider mb-1">Prayer Point</p>
                      <p className="text-[#374151] text-sm leading-relaxed">{devotional.prayerPoint}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button className="flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-lg"><FaWhatsapp size={14} /> WhatsApp</button>
                    <button className="flex items-center gap-2 bg-[#1877F2] text-white text-xs font-bold px-4 py-2 rounded-lg"><FaFacebook size={14} /> Facebook</button>
                    <button className="flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2 rounded-lg"><FaXTwitter size={14} /> X</button>
                    <button className="flex items-center gap-2 border border-gray-200 text-gray-500 text-xs font-bold px-4 py-2 rounded-lg hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors"><Link2 size={14} /> Copy Link</button>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <p className="text-xs font-bold text-[#374151] uppercase tracking-wider mb-3">Subscribe to the Podcast</p>
                    <div className="flex flex-wrap gap-2">
                      {['Spotify', 'Apple Podcasts', 'Google Podcasts', 'RSS Feed'].map((p) => (
                        <div key={p} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-500 cursor-pointer hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors">{p}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {devotional.audioUrl && (
                    <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0D1B2A] rounded-2xl p-5">
                      <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Audio Devotional</p>
                      <p className="text-white font-bold text-sm mb-4">{devotional.title}</p>
                      <div className="flex items-center justify-between">
                        <button className="w-12 h-12 bg-[#B8860B] rounded-full flex items-center justify-center shadow-lg hover:bg-[#92650A] transition-colors">
                          <Play size={20} className="text-white ml-0.5" />
                        </button>
                        <Headphones size={18} className="text-white/40" />
                      </div>
                    </div>
                  )}
                  {devotional.youtubeUrl && (
                    <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1E3A8A] rounded-2xl aspect-video flex flex-col items-center justify-center gap-3 cursor-pointer"
                      onClick={() => window.open(devotional.youtubeUrl, '_blank')}>
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <Play size={20} className="text-white ml-0.5" />
                      </div>
                      <span className="text-white/40 text-xs">Watch on YouTube</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-base mb-2">No devotional published yet for today.</p>
              <p className="text-gray-300 text-sm">Check back at 9PM WAT or browse the archive below.</p>
            </div>
          )}

          {/* Archive */}
          {archive.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#1A1A1A]">Devotional Archive</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {archive.map((item: any) => (
                  <div key={item._id} className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-[#1E3A8A] hover:shadow-sm transition-all duration-200">
                    <p className="text-gray-400 text-xs mb-1">{new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="font-bold text-[#1A1A1A] text-sm leading-snug mb-2">{item.title}</p>
                    <div className="flex gap-1 flex-wrap">
                      {item.audioUrl && <span className="bg-[#FDF6E3] text-[#92650A] text-xs font-bold px-2 py-0.5 rounded-full">Audio</span>}
                      {item.youtubeUrl && <span className="bg-[#EBF0FA] text-[#1E3A8A] text-xs font-bold px-2 py-0.5 rounded-full">Video</span>}
                      {!item.audioUrl && !item.youtubeUrl && <span className="bg-gray-100 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">Written</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
