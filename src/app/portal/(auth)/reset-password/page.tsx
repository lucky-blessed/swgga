'use client'
// src/app/portal/(auth)/reset-password/page.tsx

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ShieldCheck, CheckCircle, Check } from 'lucide-react'

function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)

  const pwLongEnough = password.length >= 8
  const pwHasLetter  = /[a-zA-Z]/.test(password)
  const pwHasNumber  = /[0-9]/.test(password)
  const pwMatch      = password === confirm && confirm.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid reset link. Please request a new one.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/v1/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to reset password')
      setSuccess(true)
      setTimeout(() => router.push(data.isAdmin ? '/admin/login' : '/portal/login'), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-400 text-sm">Invalid or missing reset token.</p>
        <Link href="/portal/forgot-password"
          className="text-[#B8860B] text-sm hover:underline">
          Request a new reset link
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20
                        flex items-center justify-center mx-auto">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h2 className="text-white font-bold text-lg font-playfair">Password Reset!</h2>
        <p className="text-gray-400 text-sm">
          Your password has been reset successfully. Redirecting to sign in...
        </p>
        <Link href="/portal/login"
          className="inline-block text-sm text-[#B8860B] hover:underline">
          Go to Sign In
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                        flex items-center justify-center">
          <ShieldCheck size={16} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">Set New Password</h1>
          <p className="text-gray-500 text-xs">Choose a strong password for your account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400">New Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoFocus
              className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3 pr-11
                         text-sm text-white placeholder:text-gray-600
                         focus:outline-none focus:border-[#1E3A8A] transition-colors"
            />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-gray-400">Confirm Password</label>
          <div className="relative">
            <input
              type={showConf ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              required
              className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3 pr-11
                         text-sm text-white placeholder:text-gray-600
                         focus:outline-none focus:border-[#1E3A8A] transition-colors"
            />
            <button type="button" onClick={() => setShowConf(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {password.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              [pwLongEnough, 'At least 8 characters'],
              [pwHasLetter && pwHasNumber, 'Letter and number'],
              [pwMatch, 'Passwords match'],
            ].map(([ok, label]) => (
              <span key={label as string}
                className={`text-xs flex items-center gap-1 ${ok ? 'text-green-400' : 'text-gray-600'}`}>
                <Check size={11} className={ok ? 'opacity-100' : 'opacity-0'} />
                {label as string}
              </span>
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all
                     bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80
                     hover:from-[#B8860B] hover:to-[#B8860B]/80
                     text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="border-t border-white/5 mt-6 pt-5">
        <Link href="/portal/forgot-password"
          className="block text-center text-xs text-gray-500 hover:text-white transition-colors">
          Request a new reset link
        </Link>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#060E1A] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,58,138,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#0F2460]
                            flex items-center justify-center shadow-xl border border-white/10">
              <span className="text-white font-bold text-lg">SW</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Sure Word Glorious Gospel Assembly</p>
              <p className="text-gray-500 text-xs">Member Portal</p>
            </div>
          </Link>
        </div>
        <div className="bg-[#0A1628] border border-white/8 rounded-2xl p-8 shadow-2xl">
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
