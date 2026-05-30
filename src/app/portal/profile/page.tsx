'use client'

import { useState, useEffect, useRef } from 'react'
import { usePortalUser } from '@/app/portal/layout'
import { X } from 'lucide-react'

// --- Types ---

interface ProfileData {
  id:                string
  email:             string | null
  phone:             string | null
  first_name:        string | null
  last_name:         string | null
  photo:             string | null
  role:              string
  word_streak:       number
  membership_status: string | null
  ministry:          { id: string; name: string; slug: string } | null
  created_at:        string
}

interface MemberDetails {
  date_of_birth:     string | null
  address:           string | null
  marital_status:    string | null
  occupation:        string | null
  baptism_date:      string | null
  joined_date:       string | null
  membership_status: string | null
}

// --- Helpers ---

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Not set'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.charAt(0) ?? ''
  const l = lastName?.charAt(0)  ?? ''
  return (f + l).toUpperCase() || 'U'
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    R01: 'Super Admin', R02: 'Senior Pastor', R03: 'Admin',
    R04: 'Treasurer',   R05: 'Department Head', R06: 'CTY Admin',
    R07: 'Media Lead',  R08: 'Prayer Coordinator', R09: 'Cell Leader',
    R10: 'Member',      R11: 'Guest',
  }
  return map[role] ?? role
}

// --- Sub-components ---

function InfoField({
  label, value, capitalize = false, fullWidth = false,
}: {
  label: string; value: string | null | undefined
  capitalize?: boolean; fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm text-white ${capitalize ? 'capitalize' : ''}`}>
        {value || <span className="text-gray-600 italic">Not set</span>}
      </p>
    </div>
  )
}

function EditField({
  label, value, onChange, type = 'text', fullWidth = false,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; fullWidth?: boolean
}) {
  return (
    <div className={`space-y-1.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <label className="text-xs text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5
                   text-sm text-white placeholder:text-gray-600
                   focus:outline-none focus:border-[#B8860B] transition-colors"
      />
    </div>
  )
}

// --- Page ---

export default function PortalProfilePage() {
  const { updatePhoto } = usePortalUser()

  const [profile,       setProfile]       = useState<ProfileData | null>(null)
  const [details,       setDetails]       = useState<MemberDetails | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [lightboxOpen,  setLightboxOpen]  = useState(false)

  // Edit state
  const [editing,       setEditing]       = useState(false)
  const [firstName,     setFirstName]     = useState('')
  const [lastName,      setLastName]      = useState('')
  const [address,       setAddress]       = useState('')
  const [occupation,    setOccupation]    = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [joinedDate,    setJoinedDate]    = useState('')
  const [department,    setDepartment]    = useState('')
  const [saving,        setSaving]        = useState(false)
  const [saveError,     setSaveError]     = useState('')
  const [saveOk,        setSaveOk]        = useState(false)

  // Photo
  const fileInputRef                        = useRef<HTMLInputElement>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError,     setPhotoError]     = useState('')
  const [photoPreview,   setPhotoPreview]   = useState<string | null>(null)

  // --- Fetch ---

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/auth/me',    { credentials: 'include' }).then(r => r.json()),
      fetch('/api/v1/members/me', { credentials: 'include' }).then(r => r.json()).catch(() => null),
    ]).then(([me, memberData]) => {
      setProfile(me)
      setPhotoPreview(me.photo ?? null)
      setFirstName(me.first_name ?? '')
      setLastName(me.last_name   ?? '')
      if (memberData?.member) {
        const m = memberData.member
        setDetails(m)
        setAddress(m.address           ?? '')
        setOccupation(m.occupation     ?? '')
        setMaritalStatus(m.marital_status ?? '')
        setJoinedDate(m.joined_date    ?? '')
        setDepartment(m.occupation     ?? '')
      }
      setLoading(false)
    }).catch(() => {
      setError('Failed to load profile.')
      setLoading(false)
    })
  }, [])

  // --- Save ---

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    setSaveOk(false)
    try {
      const res = await fetch('/api/v1/members/me', {
        method:      'PATCH',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name:     firstName.trim(),
          last_name:      lastName.trim(),
          address:        address.trim(),
          occupation:     occupation.trim(),
          marital_status: maritalStatus || null,
          joined_date:    joinedDate    || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to save')
      setProfile(p => p ? { ...p, first_name: firstName.trim(), last_name: lastName.trim() } : p)
      setDetails(d => d ? {
        ...d,
        address:        address.trim(),
        occupation:     occupation.trim(),
        marital_status: maritalStatus || null,
        joined_date:    joinedDate    || null,
      } : d)
      setSaveOk(true)
      setEditing(false)
      setTimeout(() => setSaveOk(false), 4000)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // --- Photo ---

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setPhotoError('')

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Only JPEG, PNG, or WebP images are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be smaller than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setPhotoUploading(true)
    try {
      const formData = new FormData()
      formData.append('photo',    file)
      formData.append('memberId', profile.id)
      const res  = await fetch('/api/v1/members/photo', { method: 'POST', credentials: 'include', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      setPhotoPreview(json.url)
      setProfile(p => p ? { ...p, photo: json.url } : p)
      updatePhoto(json.url) // update sidebar + topbar globally
    } catch (e: unknown) {
      setPhotoError(e instanceof Error ? e.message : 'Upload failed')
      setPhotoPreview(profile.photo)
    } finally {
      setPhotoUploading(false)
    }
  }

  // --- Loading ---

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 bg-white/5 rounded w-1/4 animate-pulse" />
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-28 h-28 rounded-full bg-white/5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-white/5 rounded w-1/3" />
              <div className="h-4 bg-white/5 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error || 'Failed to load profile.'}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Lightbox */}
      {lightboxOpen && photoPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20
                       flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
          <img
            src={photoPreview}
            alt="Profile photo"
            className="max-w-sm w-full rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white font-playfair">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your personal information</p>
        </div>

        {/* Main card */}
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-6 space-y-6">

          {/* Photo + name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Photo */}
            <div className="relative flex-shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  onClick={() => setLightboxOpen(true)}
                  className="w-28 h-28 rounded-full object-cover border-2 border-[#B8860B]/40
                             cursor-pointer hover:border-[#B8860B] transition-all duration-200
                             hover:scale-105"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#1E3A8A]/30 border-2 border-[#1E3A8A]/40
                                flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#93C5FD]">
                    {getInitials(profile.first_name, profile.last_name)}
                  </span>
                </div>
              )}
              {photoUploading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#B8860B]
                           border-2 border-[#060E1A] flex items-center justify-center
                           text-white text-sm font-bold hover:bg-[#B8860B]/80
                           transition-colors disabled:opacity-50 shadow-lg"
                title="Change photo"
              >
                +
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white font-playfair">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{profile.email ?? profile.phone}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap justify-center sm:justify-start">
                <span className="text-xs px-2.5 py-1 rounded-full border bg-[#1E3A8A]/20 text-blue-300 border-[#1E3A8A]/30">
                  {roleLabel(profile.role)}
                </span>
                {profile.membership_status && (
                  <span className="text-xs px-2.5 py-1 rounded-full border bg-green-500/10 text-green-400 border-green-500/20 capitalize">
                    {profile.membership_status}
                  </span>
                )}
                {profile.word_streak > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full border bg-[#B8860B]/10 text-[#F5C518] border-[#B8860B]/20">
                    {profile.word_streak} day streak
                  </span>
                )}
              </div>
              {profile.ministry && (
                <p className="text-xs text-gray-500 mt-1.5">{profile.ministry.name}</p>
              )}

            </div>
          </div>

          {photoError && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{photoError}</p>
          )}

          {/* Gold divider */}
          <div className="w-10 h-0.5 bg-[#B8860B] rounded-full" />

          {/* Info / Edit */}
          {!editing ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <InfoField label="First Name"     value={profile.first_name} />
                <InfoField label="Last Name"      value={profile.last_name} />
                <InfoField label="Email"          value={profile.email} />
                <InfoField label="Phone"          value={profile.phone} />
                <InfoField label="Address"        value={details?.address}        fullWidth />
                <InfoField label="Department / Ministry Unit" value={details?.occupation} />
                <InfoField label="Marital Status" value={details?.marital_status} capitalize />
                <InfoField label="Joined SWGGA"   value={formatDate(details?.joined_date)} />
                {details?.baptism_date && (
                  <InfoField label="Baptism Date" value={formatDate(details.baptism_date)} />
                )}
              </div>

              {saveOk && (
                <p className="text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg">
                  Profile updated successfully.
                </p>
              )}

              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors
                           bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EditField label="First Name" value={firstName} onChange={setFirstName} />
                <EditField label="Last Name"  value={lastName}  onChange={setLastName} />
                <EditField label="Address"    value={address}   onChange={setAddress}  fullWidth />
                <EditField label="Occupation" value={occupation} onChange={setOccupation} />

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Department / Ministry Unit</label>
                  <select
                    value={department}
                    onChange={e => { setDepartment(e.target.value); setOccupation(e.target.value) }}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-[#B8860B] transition-colors"
                  >
                    <option value="">Not serving / None</option>
                    <option value="Choir / Worship Team">Choir / Worship Team</option>
                    <option value="Ushering">Ushering</option>
                    <option value="Media / Technical">Media / Technical</option>
                    <option value="CTY Youth Ministry">CTY Youth Ministry</option>
                    <option value="Prayer Team">Prayer Team</option>
                    <option value="Impact Fellowship Leader">Impact Fellowship Leader</option>
                    <option value="Children Ministry">Children Ministry</option>
                    <option value="Healing Streams Team">Healing Streams Team</option>
                    <option value="Evangelism / Outreach">Evangelism / Outreach</option>
                    <option value="Administration">Administration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={e => setMaritalStatus(e.target.value)}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-[#B8860B] transition-colors"
                  >
                    <option value="">Select...</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="widowed">Widowed</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">When did you join SWGGA?</label>
                  <input
                    type="date"
                    value={joinedDate}
                    onChange={e => setJoinedDate(e.target.value)}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-[#B8860B] transition-colors"
                  />
                </div>
              </div>

              {saveError && (
                <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{saveError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors
                             bg-[#B8860B] hover:bg-[#B8860B]/80 text-white
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setEditing(false); setSaveError('') }}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors
                             border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Account</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <InfoField label="Member Since" value={formatDate(profile.created_at)} />
            <InfoField label="Account Role"  value={roleLabel(profile.role)} />
          </div>
        </div>
      </div>
    </>
  )
}
