'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Bell, Mail, MessageSquare, Lock, Check, ChevronRight } from 'lucide-react'

// --- Types ---

interface NotificationPreferences {
  email_event_reminders:    boolean
  email_prayer_updates:     boolean
  email_sermon_alerts:      boolean
  email_announcements:      boolean
  email_giving_receipts:    boolean
  sms_event_reminders:      boolean
  sms_prayer_updates:       boolean
  sms_otp:                  boolean
  sms_announcements:        boolean
}

const DEFAULT_PREFS: NotificationPreferences = {
  email_event_reminders:    true,
  email_prayer_updates:     true,
  email_sermon_alerts:      true,
  email_announcements:      true,
  email_giving_receipts:    true,
  sms_event_reminders:      true,
  sms_prayer_updates:       true,
  sms_otp:                  true,
  sms_announcements:        true,
}

// --- Sub-components ---

function SectionCard({ title, icon: Icon, children }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                        flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-blue-400" />
        </div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

function Toggle({ enabled, onChange, disabled = false }: {
  enabled: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed
        ${enabled ? 'bg-[#1E3A8A]' : 'bg-white/10'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow
        transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function NotifRow({ label, desc, enabled, onChange, disabled = false }: {
  label: string; desc: string
  enabled: boolean; onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
          {label}
          {disabled && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-500/10
                             text-gray-500 border border-gray-500/20">
              Coming soon
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  )
}

// --- Page ---

export default function PortalSettingsPage() {

  // Password state
  const [currentPw,  setCurrentPw]  = useState('')
  const [newPw,      setNewPw]      = useState('')
  const [confirmPw,  setConfirmPw]  = useState('')
  const [showCur,    setShowCur]    = useState(false)
  const [showNew,    setShowNew]    = useState(false)
  const [showConf,   setShowConf]   = useState(false)
  const [pwSaving,   setPwSaving]   = useState(false)
  const [pwError,    setPwError]    = useState('')
  const [pwOk,       setPwOk]       = useState(false)

  // Notification prefs state
  const [prefs,      setPrefs]      = useState<NotificationPreferences>(DEFAULT_PREFS)
  const [prefsSaved, setPrefsSaved] = useState(false)
  const [prefsSaving,setPrefsSaving]= useState(false)
  const [prefsLoading, setPrefsLoading] = useState(true)

  // Load preferences
  useEffect(() => {
    fetch('/api/v1/notifications/preferences', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.preferences) setPrefs({ ...DEFAULT_PREFS, ...data.preferences })
        setPrefsLoading(false)
      })
      .catch(() => setPrefsLoading(false))
  }, [])

  // Password strength
  const pwLongEnough  = newPw.length >= 8
  const pwHasLetter   = /[a-zA-Z]/.test(newPw)
  const pwHasNumber   = /[0-9]/.test(newPw)
  const pwMatch       = newPw === confirmPw && confirmPw.length > 0
  const pwStrong      = pwLongEnough && pwHasLetter && pwHasNumber

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwOk(false)

    if (!pwStrong) {
      setPwError('Password must be at least 8 characters with a letter and a number.')
      return
    }
    if (!pwMatch) {
      setPwError('Passwords do not match.')
      return
    }

    setPwSaving(true)
    try {
      const res = await fetch('/api/v1/auth/change-password', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ current_password: currentPw, new_password: newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to change password')
      setPwOk(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwOk(false), 4000)
    } catch (e: unknown) {
      setPwError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setPwSaving(false)
    }
  }

  async function handleSavePrefs() {
    setPrefsSaving(true)
    try {
      await fetch('/api/v1/notifications/preferences', {
        method:      'PATCH',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ preferences: prefs }),
      })
      setPrefsSaved(true)
      setTimeout(() => setPrefsSaved(false), 3000)
    } catch {}
    finally { setPrefsSaving(false) }
  }

  function setPref(key: keyof NotificationPreferences, value: boolean) {
    setPrefs(p => ({ ...p, [key]: value }))
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-playfair">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account security and notification preferences</p>
      </div>

      {/* Password Change */}
      <SectionCard title="Change Password" icon={Lock}>
        <form onSubmit={handlePasswordChange} className="space-y-4">

          {/* Current password */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Current Password</label>
            <div className="relative">
              <input
                type={showCur ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3 pr-11
                           text-sm text-white placeholder:text-gray-600
                           focus:outline-none focus:border-[#1E3A8A] transition-colors"
              />
              <button type="button" onClick={() => setShowCur(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showCur ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3 pr-11
                           text-sm text-white placeholder:text-gray-600
                           focus:outline-none focus:border-[#1E3A8A] transition-colors"
              />
              <button type="button" onClick={() => setShowNew(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConf ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
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

          {/* Strength indicators */}
          {newPw.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {[
                [pwLongEnough, 'At least 8 characters'],
                [pwHasLetter && pwHasNumber, 'Letter and number'],
                [pwMatch, 'Passwords match'],
              ].map(([ok, label]) => (
                <span key={label as string}
                  className={`text-xs flex items-center gap-1
                    ${ok ? 'text-green-400' : 'text-gray-600'}`}>
                  <Check size={11} className={ok ? 'opacity-100' : 'opacity-0'} />
                  {label as string}
                </span>
              ))}
            </div>
          )}

          {pwError && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{pwError}</p>
          )}
          {pwOk && (
            <p className="text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg">
              Password changed successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={pwSaving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors
                       bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pwSaving ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </SectionCard>

      {/* Email Notifications */}
      <SectionCard title="Email Notifications" icon={Mail}>
        {prefsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <NotifRow
              label="Event Reminders"
              desc="Get notified about upcoming events you've registered for"
              enabled={prefs.email_event_reminders}
              onChange={v => setPref('email_event_reminders', v)}
            />
            <NotifRow
              label="Prayer Updates"
              desc="Updates when your prayer requests are attended to"
              enabled={prefs.email_prayer_updates}
              onChange={v => setPref('email_prayer_updates', v)}
            />
            <NotifRow
              label="New Sermon Alerts"
              desc="Notified when a new sermon is published"
              enabled={prefs.email_sermon_alerts}
              onChange={v => setPref('email_sermon_alerts', v)}
            />
            <NotifRow
              label="Announcements"
              desc="Church-wide announcements and important notices"
              enabled={prefs.email_announcements}
              onChange={v => setPref('email_announcements', v)}
            />
            <NotifRow
              label="Giving Receipts"
              desc="Receive email receipts for your contributions"
              enabled={prefs.email_giving_receipts}
              onChange={v => setPref('email_giving_receipts', v)}
            />
          </div>
        )}
      </SectionCard>

      {/* SMS Notifications */}
      <SectionCard title="SMS Notifications" icon={MessageSquare}>
        {prefsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <NotifRow
              label="Event Reminders"
              desc="SMS reminders for registered events"
              enabled={prefs.sms_event_reminders}
              onChange={v => setPref('sms_event_reminders', v)}
            />
            <NotifRow
              label="Prayer Updates"
              desc="SMS update when your prayer is prayed for"
              enabled={prefs.sms_prayer_updates}
              onChange={v => setPref('sms_prayer_updates', v)}
            />
            <NotifRow
              label="Announcements"
              desc="Urgent church-wide SMS announcements"
              enabled={prefs.sms_announcements}
              onChange={v => setPref('sms_announcements', v)}
            />
            <NotifRow
              label="Login OTP"
              desc="One-time codes for phone number login — cannot be disabled"
              enabled={prefs.sms_otp}
              onChange={v => setPref('sms_otp', v)}
              disabled={true}
            />
          </div>
        )}
      </SectionCard>

      {/* WhatsApp — Coming Soon */}
      <SectionCard title="WhatsApp Notifications" icon={Bell}>
        <div className="flex items-start gap-4 py-2">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20
                          flex items-center justify-center flex-shrink-0 mt-0.5">
            <MessageSquare size={16} className="text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">WhatsApp notifications</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              WhatsApp Business API integration is planned for a future update.
              You'll be able to receive event reminders, prayer updates, and
              announcements directly on WhatsApp. Stay tuned.
            </p>
            <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full
                             bg-[#B8860B]/10 text-[#F5C518] border border-[#B8860B]/20">
              Coming in Phase 2
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Save preferences */}
      <div className="flex items-center justify-between bg-[#0A1628] border border-white/5
                      rounded-2xl px-6 py-4">
        <p className="text-sm text-gray-400">
          {prefsSaved ? (
            <span className="text-green-400">Preferences saved successfully.</span>
          ) : (
            'Save your notification preferences'
          )}
        </p>
        <button
          onClick={handleSavePrefs}
          disabled={prefsSaving || prefsLoading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors
                     bg-[#B8860B] hover:bg-[#B8860B]/80 text-white
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {prefsSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

    </div>
  )
}
