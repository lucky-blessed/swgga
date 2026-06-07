import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

export default function MinistryPage() {
  return (
    <div className="min-h-screen bg-[#060E1A] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-[#B8860B]/10 border border-[#B8860B]/20 flex items-center justify-center mx-auto mb-6">
          <Clock size={28} className="text-[#F5C518]" />
        </div>
        <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-3">Ministry</p>
        <h1 className="text-3xl font-bold text-white mb-3">Children of Destiny</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          This ministry page is currently being built. Check back soon for updates, events, and resources.
        </p>
        <Link href="/ministries"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white font-semibold text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Ministries
        </Link>
      </div>
    </div>
  )
}
