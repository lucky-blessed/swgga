// src/components/layout/ServicesStrip.tsx
// Thin announcement bar above the navbar
// Shows service types and church location
// No hardcoded times - managed via CMS

import { Calendar, MapPin } from 'lucide-react'

export default function ServicesStrip() {
  return (
    // Dark background strip - py-2 = 8px padding top and bottom
    <div className="bg-[#0D1B2A] py-2 px-4">

      {/* Flex row - wraps on mobile, scrollable horizontally */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center
                      gap-4 sm:gap-8 text-xs text-blue-300">

        {/* Sunday Service */}
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-[#B8860B]" />
          <span>Sunday Service</span>
        </div>

        {/* Wednesday Bible Study */}
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-[#B8860B]" />
          <span>Wednesday Word Feast</span>
        </div>

        {/* Friday Prayer Night */}
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-[#B8860B]" />
          <span>Friday Evangelism and Outreach</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-[#B8860B]" />
          <span>Warri &amp; Effurun, Delta State</span>
        </div>

      </div>
    </div>
  )
}