'use client'

import ServicesStrip from '@/components/layout/ServicesStrip'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useState } from 'react'

const filterChips = ['All Events', 'Services', 'Ministries', 'CTY', 'Special Events']

const events = [
  {
    day: '09', month: 'Jun',
    title: 'Sunday Morning Service',
    description: 'Spirit-filled worship and the Word. Join us for Sunday Service at SWGGA, Warri.',
    tag: 'Service', tagColor: 'bg-[#EBF0FA] text-[#1E3A8A]',
    btnLabel: 'Remind Me', btnStyle: 'border border-gray-200 text-gray-500 hover:border-[#1E3A8A] hover:text-[#1E3A8A]',
    featured: false,
  },
  {
    day: '12', month: 'Jun',
    title: 'Wednesday Word Feast',
    description: 'Deep dive into the book of Word. Bring your Bible and a note-taking spirit.',
    tag: 'Service', tagColor: 'bg-[#EBF0FA] text-[#1E3A8A]',
    btnLabel: 'Remind Me', btnStyle: 'border border-gray-200 text-gray-500 hover:border-[#1E3A8A] hover:text-[#1E3A8A]',
    featured: false,
  },
  {
    day: '16', month: 'Jun',
    title: 'Youth Sunday Service - CTY Royal Force',
    description: 'Young adults lead the entire service - vibrant worship, powerful message, and an altar call.',
    tag: 'Youth Ministry', tagColor: 'bg-[#EBF0FA] text-[#1E3A8A]',
    btnLabel: 'Register Free', btnStyle: 'bg-[#1E3A8A] text-white hover:bg-[#0F2460]',
    featured: true,
  },
  {
    day: '19', month: 'Jun',
    title: 'Building Strong Family',
    description: 'A full-day Healing Streams seminar for couples. Registration required. Limited spaces.',
    tag: 'Healing Streams', tagColor: 'bg-[#FDF6E3] text-[#92650A]',
    btnLabel: 'Register', btnStyle: 'bg-[#B8860B] text-white hover:bg-[#92650A]',
    featured: false,
  },
  {
    day: '26', month: 'Jun',
    title: 'CTY Community Outreach ',
    description: 'Catch Them Young takes the gospel to three communities in Warri. All volunteers welcome.',
    tag: 'CTY', tagColor: 'bg-[#DCFCE7] text-[#166534]',
    btnLabel: 'Volunteer', btnStyle: 'border border-gray-200 text-gray-500 hover:border-[#166534] hover:text-[#166534]',
    featured: false,
  },
  {
    day: '20', month: 'Jun',
    title: 'Crusade',
    description: 'In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not.',
    tag: 'The Light of Men', tagColor: 'bg-[#FDF6E3] text-[#92650A]',
    btnLabel: 'Register', btnStyle: 'bg-[#1E3A8A] text-white hover:bg-[#0F2460]',
    featured: false,
  },
]

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState('All Events')

  return (
    <main>
      <ServicesStrip />
      <Navbar />

      {/* PAGE HERO */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-4">
            Events Calendar
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Services, programmes, and special events — stay connected with what is happening at Sure Word
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* FILTER CHIPS */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200 ${
                activeFilter === chip
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-[#EBF0FA] hover:text-[#1E3A8A]'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* EVENTS LIST */}
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <div
              key={event.title}
              className={`bg-white border rounded-2xl p-5 flex items-start gap-5 hover:shadow-md transition-all duration-200 ${
                event.featured ? 'border-[#B8860B]' : 'border-gray-100'
              }`}
            >
              {/* Date bubble */}
              <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                event.featured
                  ? 'bg-gradient-to-br from-[#B8860B] to-[#92650A]'
                  : 'bg-[#1E3A8A]'
              }`}>
                <span className="text-white font-bold text-xl leading-none">{event.day}</span>
                <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">{event.month}</span>
              </div>

              {/* Event details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#1A1A1A] mb-1">
                  {event.title}
                </h4>
                <p className="text-[#374151] text-sm leading-relaxed mb-3">
                  {event.description}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${event.tagColor}`}>
                    {event.tag}
                  </span>
                  <button className={`ml-auto text-xs font-bold px-4 py-2 rounded-full transition-colors duration-200 ${event.btnStyle}`}>
                    {event.btnLabel}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      <Footer />
    </main>
  )
}
