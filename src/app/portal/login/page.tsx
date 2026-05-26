'use client'
// src/app/portal/login/page.tsx
// SWGGA Member & Admin Login Page
// Supports: Email/Password + Phone OTP

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Mail, ArrowRight, ShieldCheck, Phone } from 'lucide-react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { persistAccessToken, getPostLoginRedirect } from '@/lib/auth/client'

type Tab = 'email' | 'phone'
type PhoneStep = 'number' | 'otp'

export default function LoginPage() {
  const router = useRouter()

  // Tab state
  const [tab, setTab] = useState<Tab>('email')

  // Email/password form
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)

  // Phone OTP form
  const [phone,       setPhone]       = useState('')
  const [otp,         setOtp]         = useState('')
  const [phoneStep,   setPhoneStep]   = useState<PhoneStep>('number')
  const [otpSending,  setOtpSending]  = useState(false)
  const [countdown,   setCountdown]   = useState(0)

  // Shared
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  // ── Email login ────────────────────────────────────────────────────────────

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Email and password are required.'); return }

    setLoading(true)
    try {
      const res  = await fetch('/api/v1/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed. Please try again.')
        return
      }

      persistAccessToken(data.accessToken)
      router.push(getPostLoginRedirect(data.user.role))

    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── Phone OTP ──────────────────────────────────────────────────────────────

  async function handleSendOTP() {
    setError('')
    if (!phone.trim()) { setError('Phone number is required.'); return }

    setOtpSending(true)
    try {
      const normalised = phone.startsWith('+') ? phone : `+234${phone.replace(/^0/, '')}`
      const res  = await fetch('/api/v1/auth/otp/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: normalised }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to send OTP.')
        return
      }

      setPhoneStep('otp')
      // Countdown for resend
      setCountdown(60)
      const interval = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(interval); return 0 }
          return c - 1
        })
      }, 1000)

    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setOtpSending(false)
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!otp.trim() || otp.length !== 6) { setError('Enter the 6-digit OTP.'); return }

    setLoading(true)
    try {
      const normalised = phone.startsWith('+') ? phone : `+234${phone.replace(/^0/, '')}`
      const res  = await fetch('/api/v1/auth/otp/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: normalised, otp }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Invalid OTP. Please try again.')
        return
      }

      persistAccessToken(data.accessToken)
      router.push(getPostLoginRedirect(data.user.role))

    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#060E1A] flex items-center justify-center p-4">

      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                        bg-[#1E3A8A]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]
                        bg-[#B8860B]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo + Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          rounded-2xl bg-[#1E3A8A] border border-[#1E3A8A]/50
                          mb-4 shadow-lg shadow-[#1E3A8A]/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            Sure Word GGA
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Member & Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden
                        shadow-2xl shadow-black/40">

          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {[
              { key: 'email', label: 'Email',        icon: Mail  },
              { key: 'phone', label: 'Phone OTP',    icon: Phone },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setTab(key as Tab); setError(''); setPhoneStep('number') }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm
                            font-medium transition-colors border-b-2
                            ${tab === key
                              ? 'text-white border-[#B8860B]'
                              : 'text-[#64748B] border-transparent hover:text-white'
                            }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl
                              px-4 py-3 text-red-400 text-sm mb-5">
                {error}
              </div>
            )}

            {/* ── Email Tab ── */}
            {tab === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#64748B] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-4 py-3 text-white text-sm placeholder:text-[#334155]
                               focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-[#64748B]">Password</label>
                    <Link href="/portal/forgot-password"
                          className="text-xs text-[#64748B] hover:text-[#93C5FD]
                                     transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                                 px-4 py-3 pr-12 text-white text-sm placeholder:text-[#334155]
                                 focus:outline-none focus:border-[#1E3A8A] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-[#334155] hover:text-[#64748B] transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af]
                             text-white font-semibold text-sm transition-colors
                             disabled:opacity-50 flex items-center justify-center gap-2
                             mt-2"
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                    : <><ArrowRight size={16} /> Sign In</>
                  }
                </button>
              </form>
            )}

            {/* ── Phone Tab ── */}
            {tab === 'phone' && (
              <div className="space-y-4">
                {phoneStep === 'number' ? (
                  <>
                    <div>
                      <label className="block text-xs text-[#64748B] mb-1.5">
                        Phone Number
                      </label>
                      <div className="phone-input-wrapper">
                        <PhoneInput
                          international
                          defaultCountry="NG"
                          value={phone}
                          onChange={(val) => setPhone(val ?? '')}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <p className="text-[#334155] text-xs mt-1.5">
                        Enter your registered phone number
                      </p>
                    </div>

                    <button
                      onClick={handleSendOTP}
                      disabled={otpSending}
                      className="w-full py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af]
                                 text-white font-semibold text-sm transition-colors
                                 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {otpSending
                        ? <><Loader2 size={16} className="animate-spin" /> Sending OTP…</>
                        : <><Phone size={16} /> Send OTP</>
                      }
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="text-center py-2">
                      <p className="text-white text-sm font-medium">OTP Sent</p>
                      <p className="text-[#64748B] text-xs mt-1">
                        Enter the 6-digit code sent to {phone}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs text-[#64748B] mb-1.5">
                        6-Digit OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                                   px-4 py-3 text-white text-sm text-center tracking-[0.5em]
                                   placeholder:text-[#334155] placeholder:tracking-normal
                                   focus:outline-none focus:border-[#1E3A8A] transition-colors
                                   font-mono text-lg"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af]
                                 text-white font-semibold text-sm transition-colors
                                 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading
                        ? <><Loader2 size={16} className="animate-spin" /> Verifying…</>
                        : <><ArrowRight size={16} /> Verify & Sign In</>
                      }
                    </button>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => { setPhoneStep('number'); setOtp(''); setError('') }}
                        className="text-xs text-[#64748B] hover:text-white transition-colors"
                      >
                        ← Change number
                      </button>
                      {countdown > 0 ? (
                        <span className="text-xs text-[#334155]">
                          Resend in {countdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={otpSending}
                          className="text-xs text-[#93C5FD] hover:text-white transition-colors"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-[#334155] text-xs">
              New member?{' '}
              <Link href="/portal/register"
                    className="text-[#93C5FD] hover:text-white transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-[#334155] text-xs mt-6">
          Sure Word Glorious Gospel Assembly · Warri, Delta State
        </p>
      </div>
    </div>
  )
}
