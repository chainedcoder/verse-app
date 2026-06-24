"use client"

import { useTransition, useRef, useState } from "react"
import { updateProfile } from "@/app/actions/profile"
import { Camera, MapPin, Building, Calendar, Check, X } from "lucide-react"
import { useToast } from "@/components/ToastProvider"

export default function BasicInfoForm({ user }) {
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  const coverRef = useRef(null)
  const avatarRef = useRef(null)

  // Local state for the upload preview modal
  const [pendingUpload, setPendingFile] = useState(null) // holds { file, url, type: 'avatar' | 'cover' }

  async function handleConfirmUpload() {
    if (!pendingUpload) return

    const formData = new FormData()
    formData.append(pendingUpload.type, pendingUpload.file)

    // Close modal first and reset state
    setPendingFile(null)

    startTransition(async () => {
      const res = await updateProfile(formData)
      if (res?.error) {
        showToast(res.error, "error")
      } else {
        showToast(`${pendingUpload.type === 'avatar' ? 'Profile picture' : 'Cover image'} updated successfully!`, "success")
      }
    })
  }

  const handleDiscardUpload = () => {
    // Clear inputs
    if (coverRef.current) coverRef.current.value = ""
    if (avatarRef.current) avatarRef.current.value = ""
    setPendingFile(null)
    showToast("Upload discarded", "info")
  }

  const handleAvatarClick = () => avatarRef.current?.click()
  const handleCoverClick = () => coverRef.current?.click()

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      setPendingFile({ file, url, type })
    }
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown'

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input type="file" name="avatar" ref={avatarRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} style={{ display: 'none' }} />
      <input type="file" name="cover" ref={coverRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} style={{ display: 'none' }} />

      {/* My Profile Header Card (Clean Design with Cover) */}
      <h2 className="font-semibold text-lg" style={{ marginBottom: '16px' }}>My Profile</h2>
      <div className="card" style={{ padding: 0, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-tertiary)', borderRadius: '12px', overflow: 'hidden' }}>

        {/* Restored Cover Image Section */}
        <div style={{ height: '140px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
          {user.coverImage ? (
            <img src={user.coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} alt="Default Cover" />
          )}
          <button type="button" onClick={handleCoverClick} className="btn btn-ghost" style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-secondary)', padding: '6px 12px', fontSize: '13px' }}>
            <Camera size={14} className="inline mr-2" />
            Edit Cover
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: '-48px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
            {/* Avatar */}
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', border: '4px solid var(--bg-card)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
              {user.image ? (
                <img src={user.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '32px', fontWeight: 600 }}>
                  {user.name?.[0] || user.username?.[0] || "U"}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {user.firstName || user.name || user.username || 'Anonymous'} {user.lastName || ''}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
                {user.jobTitle || 'No Title'} • {user.location || 'No Location'}
              </p>
            </div>
          </div>

          {/* Edit Avatar Button */}
          <div style={{ paddingTop: '48px' }}>
            <button type="button" onClick={handleAvatarClick} className="btn btn-ghost" style={{ backgroundColor: '#eef2ff', color: '#3b82f6', border: 'none', fontWeight: 500 }}>
              <Camera size={16} className="mr-2 inline" /> Edit Avatar
            </button>
          </div>
        </div>

        <div style={{ padding: '0 24px 24px 24px' }}>
          <div style={{ borderTop: '1px solid var(--border-tertiary)', paddingTop: '20px' }}>
            <div className="flex justify-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Profile Completion </span>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>50%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--border-tertiary)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: '#3b82f6', width: '50%', borderRadius: '9999px' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Form Card */}
      <h2 className="font-semibold text-lg" style={{ marginTop: '32px', marginBottom: '16px' }}>Personal Information</h2>
      <form action={async (formData) => {
        startTransition(async () => {
          const res = await updateProfile(formData)
          if (res?.error) {
            showToast(res.error, "error")
          } else {
            showToast("Profile information updated successfully", "success")
          }
        })
      }}>
        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-tertiary)', borderRadius: '12px' }}>

          <div className="grid md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
              <input type="text" name="name" defaultValue={user.name || ''} placeholder="Display Name" required className="input bg-transparent border-none p-0 text-base font-medium shadow-none focus:ring-0 focus:border-none" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Username</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', paddingRight: '4px', fontSize: '15px', fontWeight: 600 }}>@</span>
                <input type="text" name="username" defaultValue={user.username || ''} placeholder="username" className="input bg-transparent border-none p-0 text-base font-medium shadow-none focus:ring-0 focus:border-none" style={{ color: 'var(--text-primary)', width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>First Name</label>
              <input type="text" name="firstName" defaultValue={user.firstName || ''} placeholder="First Name" className="input bg-transparent border-none p-0 text-base font-medium shadow-none focus:ring-0 focus:border-none" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Last Name</label>
              <input type="text" name="lastName" defaultValue={user.lastName || ''} placeholder="Last Name" className="input bg-transparent border-none p-0 text-base font-medium shadow-none focus:ring-0 focus:border-none" style={{ color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Website</label>
              <input type="url" name="website" defaultValue={user.website || ''} placeholder="https://yourwebsite.com" className="input bg-transparent border-none p-0 text-base font-medium shadow-none focus:ring-0 focus:border-none" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Location</label>
              <input type="text" name="location" defaultValue={user.location || ''} placeholder="Location" className="input bg-transparent border-none p-0 text-base font-medium shadow-none focus:ring-0 focus:border-none" style={{ color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Job Title</label>
              <input type="text" name="jobTitle" defaultValue={user.jobTitle || ''} placeholder="Job Title" className="input bg-transparent border-none p-0 text-base font-medium shadow-none focus:ring-0 focus:border-none" style={{ color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Bio</label>
            <textarea name="bio" defaultValue={user.bio || ''} placeholder="Bio" rows={3} className="input bg-transparent border-none p-0 text-base font-medium shadow-none focus:ring-0 focus:border-none" style={{ resize: 'vertical', color: 'var(--text-primary)' }}></textarea>
          </div>

          <div className="flex justify-end pt-4" style={{ borderTop: '1px solid var(--border-tertiary)' }}>
            <button type="submit" disabled={isPending} className="btn btn-ghost" style={{ backgroundColor: '#eef2ff', color: '#3b82f6', border: 'none', fontWeight: 500 }}>
              {isPending ? "Saving..." : "Edit & Save"}
            </button>
          </div>
        </div>
      </form>

      {/* Confirm File Upload Local Modal Overlay */}
      {pendingUpload && (
        <div className="adt-modal-overlay" role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="adt-modal" style={{ maxWidth: '440px', width: '95vw', padding: '32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-tertiary)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
            <div className="adt-modal-head" style={{ borderBottom: '1px solid var(--border-tertiary)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Confirm Image Upload</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Review your chosen image crop and position below.</p>
            </div>

            <div className="adt-modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              {pendingUpload.type === 'avatar' ? (
                /* Avatar Preview: Circular Clip */
                <div style={{ width: '128px', height: '128px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--accent)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <img src={pendingUpload.url} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                /* Cover Preview: Wide Horizontal Box */
                <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--accent)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <img src={pendingUpload.url} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div className="adt-modal-foot" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-tertiary)', paddingTop: '16px' }}>
              <button type="button" onClick={handleDiscardUpload} className="btn btn-ghost" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <X size={16} /> Discard
              </button>
              <button type="button" onClick={handleConfirmUpload} className="btn btn-primary" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Check size={16} /> Confirm & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
