// src/components/layout/Navbar.tsx
// Top navigation bar — appears on every public page
// Mobile-first: collapses to hamburger menu on small screens

'use client' // This component uses React state so it needs to run in the browser

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  // Controls whether the mobile menu is open or closed
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    // Main nav container
    // bg-[#1E3A8A] = Royal Blue background (our brand color)
    // sticky top-0 = stays at top of screen when scrolling
    // z-50 = sits above all other content
    <nav className="bg-[#1E3A8A] sticky top-0 z-50 shadow-lg">

      {/* Inner container — max width 1280px, centered, with horizontal padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Flex row: logo on left, links in middle, Give button on right */}
        {/* h-16 = 64px height */}
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            {/* Logo badge — circular blue-dark background with initials */}
            <div className="w-10 h-10 rounded-full bg-[#0F2460] flex items-center justify-center">
              <span className="text-white font-bold text-sm">SW</span>
            </div>
            {/* Church name — hidden on mobile (hidden), shown on medium screens (md:block) */}
            <div className="hidden md:block">
              <p className="text-white font-bold text-sm leading-tight">
                Sure Word Glorious Gospel Assembly
              </p>
              <p className="text-blue-300 text-xs">Warri · Delta State</p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION LINKS */}
          {/* hidden = hidden on mobile, md:flex = shown as flex row on medium+ screens */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/"
              className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/about"
              className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
              About
            </Link>
            <Link href="/sermons"
              className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
              Sermons
            </Link>
            <Link href="/ministries"
              className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
              Ministries
            </Link>
            <Link href="/events"
              className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
              Events
            </Link>
          </div>

          {/* RIGHT SIDE — Give button + mobile hamburger */}
          <div className="flex items-center gap-3">

            {/* GIVE BUTTON — always visible */}
            {/* bg-[#B8860B] = Gold background */}
            {/* hover:bg-[#92650A] = darker gold on hover */}
            <Link href="/give"
              className="bg-[#B8860B] hover:bg-[#92650A] text-white text-sm font-bold
                         px-4 py-2 rounded-full transition-colors">
              Give
            </Link>

            {/* HAMBURGER BUTTON — only visible on mobile (md:hidden) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-1"
              aria-label="Toggle menu"
            >
              {/* Show X when menu is open, hamburger lines when closed */}
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU — only shown when menuOpen is true */}
      {/* This slides in below the navbar on small screens */}
      {menuOpen && (
        <div className="md:hidden bg-[#0F2460] px-4 pb-4 pt-2">
          <div className="flex flex-col gap-3">
            <Link href="/" onClick={() => setMenuOpen(false)}
              className="text-blue-100 hover:text-white text-sm font-medium py-2
                         border-b border-blue-800">
              Home
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}
              className="text-blue-100 hover:text-white text-sm font-medium py-2
                         border-b border-blue-800">
              About
            </Link>
            <Link href="/sermons" onClick={() => setMenuOpen(false)}
              className="text-blue-100 hover:text-white text-sm font-medium py-2
                         border-b border-blue-800">
              Sermons
            </Link>
            <Link href="/ministries" onClick={() => setMenuOpen(false)}
              className="text-blue-100 hover:text-white text-sm font-medium py-2
                         border-b border-blue-800">
              Ministries
            </Link>
            <Link href="/events" onClick={() => setMenuOpen(false)}
              className="text-blue-100 hover:text-white text-sm font-medium py-2">
              Events
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}