'use client'
// src/app/portal/register/page.tsx
// SWGGA Member Self-Registration Page
// Supports international phone numbers + email verification flow

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, EyeOff, Loader2, User, ShieldCheck,
  Mail, CheckCircle2,
} from 'lucide-react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { persistAccessToken } from '@/lib/auth/client'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    first_name:       '',
    last_name:        '',
    email:            '',
    phone:            '',
    password:         '',
    confirm_password: '',
  })
  const [showPass,     setShowPass]     = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [registered,   setRegistered]   = useState(false)
  const [regEmail,     setRegEmail]     = useState('')

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First and last name are required.')
      return
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setError('Email or phone number is required.')
      return
    }
    if (!form.password) {
      setError('Password is required.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/v1/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Please try again.')
        return
      }

      persistAccessToken(data.accessToken)

      if (data.requiresVerification) {
        // Show verification pending screen
        setRegEmail(form.email)
        setRegistered(true)
      } else {
        // Phone-only registration — go straight to portal
        router.push('/portal/dashboard')
      }

    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── Post-registration: check your email screen ────────────────────────────

  if (registered) {
    return (
      <div className="min-h-screen bg-[#060E1A] flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                          bg-[#1E3A8A]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative w-full max-w-md text-center">
          <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-8
                          shadow-2xl shadow-black/40 space-y-5">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#1E3A8A]/20 border
                              border-[#1E3A8A]/30 flex items-center justify-center">
                <Mail size={32} className="text-[#93C5FD]" />
              </div>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold mb-2"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                Check Your Email
              </h2>
              <p className="text-[#64748B] text-sm leading-relaxed">
                We sent a verification link to:
              </p>
              <p className="text-white font-medium mt-1">{regEmail}</p>
            </div>
            <div className="bg-[#060E1A] border border-white/5 rounded-xl p-4 text-left space-y-2">
              {[
                'Open your email inbox',
                'Click the verification link',
                'You\'ll be automatically signed in',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1E3A8A]/20 border
                                  border-[#1E3A8A]/30 flex items-center justify-center
                                  flex-shrink-0">
                    <span className="text-[#93C5FD] text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-[#64748B] text-sm">{step}</p>
                </div>
              ))}
            </div>
            <p className="text-[#334155] text-xs">
              Link expires in 24 hours. Check your spam folder if you don't see it.
            </p>
            <div className="pt-2 space-y-2">
              <Link
                href="/portal/pending-verification"
                className="block w-full py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af]
                           text-white font-semibold text-sm transition-colors text-center"
              >
                Continue to Portal
              </Link>
              <Link
                href="/portal/login"
                className="block text-xs text-[#64748B] hover:text-white
                           transition-colors text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
          <p className="text-center text-[#334155] text-xs mt-6">
            Sure Word Glorious Gospel Assembly · Warri, Delta State
          </p>
        </div>
      </div>
    )
  }

  // ── Registration form ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#060E1A] flex items-center justify-center p-4">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                        bg-[#1E3A8A]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]
                        bg-[#B8860B]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          rounded-2xl bg-[#1E3A8A] border border-[#1E3A8A]/50
                          mb-4 shadow-lg shadow-[#1E3A8A]/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            Create Account
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Join the Sure Word GGA member portal
          </p>
        </div>

        <div className="bg-[#0A1628] border border-white/5 rounded-2xl
                        shadow-2xl shadow-black/40">
          <div className="p-6">

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl
                              px-4 py-3 text-red-400 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#64748B] mb-1.5">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={e => update('first_name', e.target.value)}
                    placeholder="Chijioke"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-4 py-3 text-white text-sm placeholder:text-[#334155]
                               focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#64748B] mb-1.5">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={e => update('last_name', e.target.value)}
                    placeholder="Igbani"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-4 py-3 text-white text-sm placeholder:text-[#334155]
                               focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs text-[#64748B] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                             px-4 py-3 text-white text-sm placeholder:text-[#334155]
                             focus:outline-none focus:border-[#1E3A8A] transition-colors"
                />
              </div>

              {/* Phone — international with country dropdown */}
              <div>
                <label className="block text-xs text-[#64748B] mb-1.5">
                  Phone Number
                </label>
                <div className="phone-input-wrapper">
                  <PhoneInput
                    international
                    defaultCountry="NG"
                    value={form.phone}
                    onChange={(val) => update('phone', val ?? '')}
                    placeholder="Enter phone number"
                  />
                </div>
                <p className="text-[#334155] text-xs mt-1">
                  At least one of email or phone is required.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs text-[#64748B] mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="Min. 8 characters with letters and numbers"
                    autoComplete="new-password"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-4 py-3 pr-12 text-white text-sm placeholder:text-[#334155]
                               focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-[#334155] hover:text-[#64748B] transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs text-[#64748B] mb-1.5">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm_password}
                    onChange={e => update('confirm_password', e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-4 py-3 pr-12 text-white text-sm placeholder:text-[#334155]
                               focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-[#334155] hover:text-[#64748B] transition-colors">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <p className="text-[#334155] text-xs leading-relaxed">
                By registering you agree to abide by the Sure Word GGA community
                guidelines and platform terms of use.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af]
                           text-white font-semibold text-sm transition-colors
                           disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Creating Account…</>
                  : <><User size={16} /> Create Account</>
                }
              </button>
            </form>
          </div>

          <div className="px-6 pb-6 text-center">
            <p className="text-[#334155] text-xs">
              Already have an account?{' '}
              <Link href="/portal/login"
                    className="text-[#93C5FD] hover:text-white transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[#334155] text-xs mt-6">
          Sure Word Glorious Gospel Assembly · Warri, Delta State
        </p>
      </div>
    </div>
  )
}
