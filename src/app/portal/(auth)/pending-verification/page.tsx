'use client'
// src/app/portal/pending-verification/page.tsx
// Shown to users who registered with email but haven't verified yet

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function PendingVerificationPage() {
  const [resending,  setResending]  = useState(false)
  const [resent,     setResent]     = useState(false)
  const [error,      setError]      = useState('')

  async function handleResend() {
    setError('')
    setResending(true)
    try {
      const res  = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to resend. Please try again.')
        return
      }
      setResent(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060E1A] flex items-center justify-center p-4">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                        bg-[#1E3A8A]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md text-center">

        <div className="inline-flex items-center justify-center w-16 h-16
                        rounded-2xl bg-[#1E3A8A] border border-[#1E3A8A]/50
                        mb-6 shadow-lg shadow-[#1E3A8A]/20">
          <ShieldCheck size={28} className="text-white" />
        </div>

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
              Verify Your Email
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed">
              Your account is pending email verification. Please check your
              inbox and click the verification link to activate your account.
            </p>
          </div>

          <div className="bg-[#060E1A] border border-white/5 rounded-xl p-4
                          text-left space-y-2">
            {[
              'Check your email inbox',
              'Click the verification link',
              'Return here to access the portal',
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

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl
                            px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {resent && (
            <div className="bg-green-400/10 border border-green-400/20 rounded-xl
                            px-4 py-3 text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 size={14} />
              Verification email resent successfully!
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              onClick={handleResend}
              disabled={resending || resent}
              className="w-full py-3 rounded-xl bg-[#0F1E35] border border-white/10
                         text-[#93C5FD] font-medium text-sm transition-colors
                         hover:border-white/20 disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {resending
                ? <><Loader2 size={14} className="animate-spin" /> Resending…</>
                : resent
                ? <><CheckCircle2 size={14} /> Email Resent</>
                : 'Resend Verification Email'
              }
            </button>

            <Link
              href="/portal/login"
              className="block text-xs text-[#64748B] hover:text-white
                         transition-colors text-center py-2"
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
