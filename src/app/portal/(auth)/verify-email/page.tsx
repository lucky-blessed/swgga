'use client'
// src/app/portal/verify-email/page.tsx
// Landing page for email verification links

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle, ShieldCheck, Mail } from 'lucide-react'
import { persistAccessToken } from '@/lib/auth/client'

type State = 'verifying' | 'success' | 'error'

import { Suspense } from "react"
function VerifyEmailContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')

  const [state,   setState]   = useState<State>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setState('error')
      setMessage('No verification token found. Please check your email link.')
      return
    }

    async function verify() {
      try {
        const res  = await fetch('/api/v1/auth/verify-email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ token }),
        })
        const data = await res.json()

        if (!res.ok) {
          setState('error')
          setMessage(data.error ?? 'Verification failed. Please try again.')
          return
        }

        persistAccessToken(data.accessToken)
        setState('success')
        setMessage(data.message ?? 'Email verified successfully!')

        // Redirect to portal after 3 seconds
        setTimeout(() => router.push('/portal/dashboard'), 3000)

      } catch {
        setState('error')
        setMessage('Network error. Please check your connection and try again.')
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-[#060E1A] flex items-center justify-center p-4">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                        bg-[#1E3A8A]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md text-center">

        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16
                        rounded-2xl bg-[#1E3A8A] border border-[#1E3A8A]/50
                        mb-6 shadow-lg shadow-[#1E3A8A]/20">
          <ShieldCheck size={28} className="text-white" />
        </div>

        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-8
                        shadow-2xl shadow-black/40">

          {state === 'verifying' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-[#1E3A8A]" />
              </div>
              <h2 className="text-white text-xl font-semibold"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                Verifying your email…
              </h2>
              <p className="text-[#64748B] text-sm">
                Please wait while we confirm your email address.
              </p>
            </div>
          )}

          {state === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-400/10 border
                                border-green-400/20 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-400" />
                </div>
              </div>
              <h2 className="text-white text-xl font-semibold"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                Email Verified! ✅
              </h2>
              <p className="text-[#64748B] text-sm">{message}</p>
              <p className="text-[#334155] text-xs">
                Redirecting to your dashboard in 3 seconds…
              </p>
              <Link
                href="/portal/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                           bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-semibold
                           text-sm transition-colors"
              >
                Go to Dashboard Now
              </Link>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-400/10 border
                                border-red-400/20 flex items-center justify-center">
                  <XCircle size={32} className="text-red-400" />
                </div>
              </div>
              <h2 className="text-white text-xl font-semibold"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                Verification Failed
              </h2>
              <p className="text-[#64748B] text-sm">{message}</p>
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/portal/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3
                             rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] text-white
                             font-semibold text-sm transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[#334155] text-xs mt-6">
          Sure Word Glorious Gospel Assembly · Warri, Delta State
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060E1A] flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
