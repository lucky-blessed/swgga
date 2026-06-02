'use client'
// src/app/admin/set-password/page.tsx
// New admin sets their password from the welcome email link

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Shield, CheckCircle } from 'lucide-react'

function SetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')

  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [showConf,   setShowConf]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState(false)

  useEffect(() => {
    if (!token) setError('Invalid or missing token. Please use the link from your welcome email.')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least one letter and one number.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/admin/accounts/set-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to set password')
      setSuccess(true)
      setTimeout(() => router.push('/admin/login'), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20
                        flex items-center justify-center mx-auto">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h2 className="text-white font-bold text-lg font-playfair">Password Set Successfully</h2>
        <p className="text-gray-400 text-sm">
          Your password has been set. Redirecting you to the admin login...
        </p>
        <Link href="/admin/login"
          className="inline-block mt-2 text-sm text-[#B8860B] hover:underline">
          Go to Admin Login
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                        flex items-center justify-center">
          <Shield size={16} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">Set Your Password</h1>
          <p className="text-gray-500 text-xs">Create a secure password for your admin account</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 mb-4">
          {error}
        </div>
      )}

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

        <ul className="text-xs text-gray-600 space-y-1 pl-1">
          <li className={password.length >= 8 ? 'text-green-400' : ''}>
            {password.length >= 8 ? '✓' : '·'} At least 8 characters
          </li>
          <li className={/[a-zA-Z]/.test(password) && /[0-9]/.test(password) ? 'text-green-400' : ''}>
            {/[a-zA-Z]/.test(password) && /[0-9]/.test(password) ? '✓' : '·'} Contains a letter and a number
          </li>
          <li className={password === confirm && confirm.length > 0 ? 'text-green-400' : ''}>
            {password === confirm && confirm.length > 0 ? '✓' : '·'} Passwords match
          </li>
        </ul>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all
                     bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80
                     hover:from-[#B8860B] hover:to-[#B8860B]/80
                     text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting password...' : 'Set Password & Continue'}
        </button>
      </form>
    </>
  )
}

export default function AdminSetPasswordPage() {
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
              <p className="text-gray-500 text-xs">Admin Platform</p>
            </div>
          </Link>
        </div>
        <div className="bg-[#0A1628] border border-white/8 rounded-2xl p-8 shadow-2xl">
          <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
            <SetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
