'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CTYNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-[#0D3320] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* CTY Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4ADE80] flex items-center justify-center">
              <span className="text-[#166534] font-black text-xs">CTY</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Catch Them Young</p>
              <p className="text-green-400/60 text-xs">Outreach Ministry · Sure Word Glorious Gospel Assembly</p>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="#vision"       className="text-white/70 hover:text-white text-sm transition-colors">Vision</Link>
            <Link href="#programmes"   className="text-white/70 hover:text-white text-sm transition-colors">Programmes</Link>
            <Link href="#chapters"     className="text-white/70 hover:text-white text-sm transition-colors">Chapters</Link>
            <Link href="#get-involved" className="text-white/70 hover:text-white text-sm transition-colors">Get Involved</Link>
            <Link href="/" className="flex items-center gap-1.5 bg-white/15 hover:bg-white border border-white/40 hover:border-white text-white hover:text-[#0D3320] text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200">
              <ArrowLeft size={12} /> Sure Word Glorious Gospel Assembly
            </Link>
          </div>

          {/* Right - Get Involved + hamburger */}
          <div className="flex items-center gap-2">
            <Link href="#get-involved" className="hidden lg:block bg-[#4ADE80] hover:bg-[#22C55E] text-[#166534] text-sm font-bold px-4 py-2 rounded-full transition-colors">
              Get Involved
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white p-1" aria-label="Toggle menu">
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#051A0D] px-4 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            <Link href="#vision"       onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white text-sm font-medium py-2.5 border-b border-green-900/50">Vision</Link>
            <Link href="#programmes"   onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white text-sm font-medium py-2.5 border-b border-green-900/50">Programmes</Link>
            <Link href="#chapters"     onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white text-sm font-medium py-2.5 border-b border-green-900/50">Chapters</Link>
            <Link href="#get-involved" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white text-sm font-medium py-2.5 border-b border-green-900/50">Get Involved</Link>
            <Link href="/" className="flex items-center gap-2 mt-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
              <ArrowLeft size={14} /> Return to Sure Word Glorious Gospel Assembly
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
