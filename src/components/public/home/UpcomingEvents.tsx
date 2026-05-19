// src/components/public/home/UpcomingEvents.tsx
// Upcoming events section — 2-column grid of event cards
// Each card has a date bubble, title, description, and ministry tag

import Link from 'next/link'

const events = [
  {
    day: '12',
    month: 'June',
    title: 'Youth Sunday Service',
    description: 'Our young adults lead the entire Sunday service ...; worship, prayer and the Word.',
    tag: 'CTY Royal Force',
    tagColor: 'bg-[#EBF0FA] text-[#1E3A8A]',
  },
  {
    day: '19',
    month: 'June',
    title: 'Building Strong Family',
    description: 'Healing marriages and strenghtening relationships.',
    tag: 'Healing Streams',
    tagColor: 'bg-[#FDF6E3] text-[#92650A]',
  },
  {
    day: '26',
    month: 'June',
    title: 'CTY Community Outreach',
    description: 'Catch Them Young takes the gospel to the streets of Warri — all welcome.',
    tag: 'CTY',
    tagColor: 'bg-[#DCFCE7] text-[#166534]',
  },
  {
    day: '20',
    month: 'June',
    title: "Crusade",
    description: "...In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not.",
    tag: "The light of Men",
    tagColor: 'bg-[#FDF6E3] text-[#92650A]',
  },
]

export default function UpcomingEvents() {
  return (
    // Light grey background — alternates with the white Featured Sermon section
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-10">
          <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">
            This Week
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl
                         font-bold text-[#1A1A1A] mb-3">
            Upcoming Events
          </h2>
          <p className="text-gray-400 text-base">
            Stay connected with what&apos;s happening at Sure Word
          </p>
        </div>

        {/* Events grid — 1 column mobile, 2 columns desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.title}
              className="bg-white border border-gray-100 rounded-2xl p-5
                         flex items-start gap-4 hover:shadow-md hover:border-[#1E3A8A]
                         transition-all duration-200 group cursor-pointer"
            >
              {/* Date bubble */}
              {/* flex-shrink-0 prevents the bubble from shrinking on small screens */}
              <div className="flex-shrink-0 w-14 h-14 bg-[#1E3A8A] rounded-xl
                              flex flex-col items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">
                  {event.day}
                </span>
                <span className="text-blue-300 text-xs font-semibold uppercase">
                  {event.month}
                </span>
              </div>

              {/* Event details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[#1A1A1A] text-sm sm:text-base
                               mb-1 group-hover:text-[#1E3A8A] transition-colors">
                  {event.title}
                </h4>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3">
                  {event.description}
                </p>
                {/* Ministry tag pill */}
                <span className={`inline-block text-xs font-bold px-3 py-1
                                  rounded-full ${event.tagColor}`}>
                  {event.tag}
                </span>
              </div>

            </div>
          ))}
        </div>

        {/* View all events link */}
        <div className="mt-8 text-center">
          <Link href="/events"
            className="text-[#1E3A8A] hover:text-[#B8860B] text-sm font-bold
                       transition-colors inline-flex items-center gap-1">
            View All Events →
          </Link>
        </div>

      </div>
    </section>
  )
}