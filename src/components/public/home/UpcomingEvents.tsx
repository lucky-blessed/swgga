// src/components/public/home/UpcomingEvents.tsx
// Fetches upcoming events live from Sanity CMS

import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/client'
import { upcomingEventsQuery } from '@/sanity/lib/queries'

interface SanityEvent {
  _id:                 string
  title:               string
  slug:                { current: string }
  date:                string
  description:         string | null
  location:            string | null
  ministry:            string | null
  registrationEnabled: boolean
  imageUrl:            string | null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    day:   d.toLocaleDateString('en-GB', { day: '2-digit', timeZone: 'Africa/Lagos' }),
    month: d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'Africa/Lagos' }).toUpperCase(),
    full:  d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' }),
  }
}

const MINISTRY_COLORS: Record<string, string> = {
  'Service':          'bg-blue-100 text-blue-700',
  'Youth Ministry':   'bg-purple-100 text-purple-700',
  'Healing Streams':  'bg-yellow-100 text-yellow-700',
  'CTY':              'bg-green-100 text-green-700',
  'Special Events':   'bg-red-100 text-red-700',
  'Impact Fellowship':'bg-orange-100 text-orange-700',
}

export default async function UpcomingEvents() {
  const events = await sanityFetch<SanityEvent[]>(upcomingEventsQuery).catch(() => [])

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">
            This Week
          </p>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0D1B2A]"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                Upcoming Events
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Stay connected with what&apos;s happening at Sure Word
              </p>
            </div>
            <Link href="/events"
                  className="hidden sm:flex items-center gap-1 text-[#B8860B]
                             hover:text-[#92650A] text-sm font-semibold
                             transition-colors">
              View All Events →
            </Link>
          </div>
        </div>

        {/* Events grid */}
        {events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No upcoming events at the moment.</p>
            <p className="text-gray-300 text-xs mt-1">Check back soon or visit our events page.</p>
            <Link href="/events"
                  className="inline-block mt-4 text-[#B8860B] text-sm font-semibold hover:underline">
              View All Events →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.slice(0, 4).map((event, i) => {
                const date = formatDate(event.date)
                const isHighlighted = i === 1
                return (
                  <div
                    key={event._id}
                    className={`flex items-start gap-4 p-5 rounded-2xl border
                                transition-shadow hover:shadow-md
                                ${isHighlighted
                                  ? 'border-[#B8860B]/30 bg-[#FDF8EE]'
                                  : 'border-gray-100 bg-white'
                                }`}
                  >
                    {/* Date badge */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl
                                    bg-[#0D1B2A] flex flex-col items-center
                                    justify-center text-white">
                      <span className="text-xl font-bold leading-none">
                        {date.day}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wider
                                       text-[#F5C518] uppercase mt-0.5">
                        {date.month}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#0D1B2A] text-sm leading-snug mb-1 truncate">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {event.ministry && (
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5
                                           rounded-full ${MINISTRY_COLORS[event.ministry]
                                           ?? 'bg-gray-100 text-gray-600'}`}>
                            {event.ministry}
                          </span>
                        )}
                        {event.location && (
                          <span className="text-[10px] text-gray-400 truncate">
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile view all link */}
            <div className="mt-6 text-center sm:hidden">
              <Link href="/events"
                    className="text-[#B8860B] text-sm font-semibold hover:underline">
                View All Events →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}