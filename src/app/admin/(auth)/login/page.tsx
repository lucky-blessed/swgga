'use client'
// src/app/admin/login/page.tsx
// Dedicated admin login page - separate from member portal login

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }

      // Check role - must be admin (R01-R09)
      const adminRoles = ['R01','R02','R03','R04','R05','R06','R07','R08','R09']
      if (!adminRoles.includes(data.user.role)) {
        setError('This account does not have admin access. Use the Member Portal to sign in.')
        return
      }

      // Persist token
      if (data.accessToken) {
        localStorage.setItem('swgga_token', data.accessToken)
        document.cookie = `swgga_access=${data.accessToken}; path=/; max-age=${8 * 60 * 60}`
      }

      router.push('/admin')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060E1A] flex items-center justify-center px-4">

      {/* Background grid */}
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
              <p className="text-white font-bold text-sm">Sure Word Glorious Gospel Assembly</p>
              <p className="text-gray-500 text-xs">Admin Platform</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#0A1628] border border-white/8 rounded-2xl p-8 shadow-2xl">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                            flex items-center justify-center">
              <Shield size={16} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Admin Sign In</h1>
              <p className="text-gray-500 text-xs">Authorised personnel only</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@surewordgga.org"
                required
                autoFocus
                className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3
                           text-sm text-white placeholder:text-gray-600
                           focus:outline-none focus:border-[#1E3A8A] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3 pr-11
                             text-sm text-white placeholder:text-gray-600
                             focus:outline-none focus:border-[#1E3A8A] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <Link href="/admin/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all
                         bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80
                         hover:from-[#1E3A8A]/90 hover:to-[#1E3A8A]/70
                         text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In to Admin Platform'}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-white/5 mt-6 pt-5">
            <p className="text-xs text-gray-600 text-center">
              Not an admin?{' '}
              <Link href="/portal/login" className="text-[#B8860B] hover:underline">
                Go to Member Portal
              </Link>
            </p>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-gray-700 mt-4">
          This platform is restricted to authorised church personnel only.
          Unauthorised access attempts are logged.
        </p>
      </div>
    </div>
  )
}
