'use client'
// src/app/portal/(auth)/forgot-password/page.tsx

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await fetch('/api/v1/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      })
      // Always show success — prevents email enumeration
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060E1A] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,58,138,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#0F2460]
                            flex items-center justify-center shadow-xl border border-white/10">
              <span className="text-white font-bold text-lg">SW</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Sure Word GGA</p>
              <p className="text-gray-500 text-xs">Member Portal</p>
            </div>
          </Link>
        </div>

        <div className="bg-[#0A1628] border border-white/8 rounded-2xl p-8 shadow-2xl">

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20
                              flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-white font-bold text-lg font-playfair">Check your email</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                If an account exists for <span className="text-white">{email}</span>,
                we've sent a password reset link. Check your inbox and spam folder.
                The link expires in 1 hour.
              </p>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border border-white/10
                             text-gray-400 hover:bg-white/5 transition-colors"
                >
                  Try a different email
                </button>
                <Link href="/portal/login"
                  className="block w-full py-2.5 rounded-xl text-sm font-semibold text-center
                             bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                                flex items-center justify-center">
                  <ShieldCheck size={16} className="text-blue-400" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Forgot Password</h1>
                  <p className="text-gray-500 text-xs">We'll send a reset link to your email</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      autoFocus
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3 pl-11
                                 text-sm text-white placeholder:text-gray-600
                                 focus:outline-none focus:border-[#1E3A8A] transition-colors"
                    />
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all
                             bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80
                             hover:from-[#1E3A8A]/90 hover:to-[#1E3A8A]/70
                             text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="border-t border-white/5 mt-6 pt-5">
                <Link href="/portal/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-500
                             hover:text-white transition-colors">
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
