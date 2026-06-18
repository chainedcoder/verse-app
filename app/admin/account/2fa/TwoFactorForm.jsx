"use client"

import { useState } from "react"
import { setupTOTP, verifyTOTP, disable2FA, setupEmailOTP } from "@/app/actions/2fa"
import { getRegistrationOptions, verifyRegistration } from "@/app/actions/webauthn"
import { startRegistration } from "@simplewebauthn/browser"
import Image from "next/image"
import { useConfirm } from "@/components/ConfirmProvider"
import { useToast } from "@/components/ToastProvider"

export default function TwoFactorForm({ user }) {
  const { confirm } = useConfirm()
  const { showToast } = useToast()
  
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const [showTotpModal, setShowTotpModal] = useState(false)
  const [totpData, setTotpData] = useState(null)
  const [totpCode, setTotpCode] = useState("")
  const [mfaEnabledState, setMfaEnabledState] = useState(user.mfaEnabled)
  const [mfaMethod, setMfaMethod] = useState(user.twoFactorMethod)

  const handleSetupTOTP = async () => {
    setError(null)
    const res = await setupTOTP()
    if (res.success) {
      setTotpData(res)
      setShowTotpModal(true)
    } else {
      showToast(res.error || "Failed to setup TOTP", "error")
    }
  }

  const handleVerifyTOTP = async (e) => {
    e.preventDefault()
    setError(null)
    const res = await verifyTOTP(totpCode)
    if (res.success) {
      setMfaEnabledState(true)
      setMfaMethod("TOTP")
      setShowTotpModal(false)
      setTotpCode("")
      showToast("2FA successfully enabled!", "success")
    } else {
      showToast(res.error || "Invalid verification code", "error")
    }
  }

  const handleSetupPasskey = async () => {
    setError(null)
    try {
      const { success, options, error } = await getRegistrationOptions()
      if (!success) {
        showToast(error || "Failed to generate passkey options", "error")
        return
      }
      
      const attResp = await startRegistration(options)
      
      const verification = await verifyRegistration(attResp)
      if (verification.success) {
        setMfaEnabledState(true)
        setMfaMethod("PASSKEY")
        showToast("Passkey successfully registered!", "success")
      } else {
        showToast(verification.error || "Passkey registration failed", "error")
      }
    } catch (err) {
      console.error(err)
      if (err.name === 'NotAllowedError') {
        showToast("Passkey registration was cancelled.", "error")
      } else {
        showToast("Error setting up Passkey. Browser might not support it.", "error")
      }
    }
  }

  const handleSetupEmailOTP = async () => {
    setError(null)
    const res = await setupEmailOTP()
    if (res.success) {
      setMfaEnabledState(true)
      setMfaMethod("EMAIL")
      showToast("Email 2FA successfully configured!", "success")
    } else {
      showToast(res.error || "Failed to setup Email 2FA", "error")
    }
  }

  const handleDisable2FA = async () => {
    const isConfirmed = await confirm("Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.")
    if (isConfirmed) {
      const res = await disable2FA("")
      setMfaEnabledState(false)
      setMfaMethod(null)
      showToast("Two-Factor Authentication disabled.", "success")
    }
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-lg" style={{ marginBottom: '8px' }}>Two-Step Verification</h3>
      <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Add an extra layer of security to your account.</p>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm" style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm" style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>2FA status updated successfully.</div>}

      {mfaEnabledState ? (
        <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-tertiary)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)' }}>
          <div>
            <strong className="text-purple-600" style={{ color: 'var(--text-primary)', display: 'block', fontSize: '16px' }}>2FA is Enabled</strong>
            <span className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px', display: 'block' }}>Method: {mfaMethod}</span>
          </div>
          <button type="button" onClick={handleDisable2FA} className="custom-btn btn-danger">
            Disable
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button type="button" onClick={handleSetupTOTP} className="btn btn-primary">
            Setup Authenticator App
          </button>
          <button type="button" onClick={handleSetupPasskey} className="btn btn-ghost">
            Setup Passkey
          </button>
          <button type="button" onClick={handleSetupEmailOTP} className="btn btn-ghost">
            Setup Email OTP
          </button>
        </div>
      )}

      {showTotpModal && (
        <div className="adt-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setShowTotpModal(false) }}>
          <div className="adt-modal" style={{ maxWidth: '440px', width: '95vw', padding: '32px' }}>
            <div className="adt-modal-head" style={{ padding: 0, borderBottom: '1px solid var(--border-tertiary)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h4 className="font-semibold text-lg" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Setup Authenticator</h4>
              <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Scan the QR code below with Google Authenticator, Authy, or another TOTP app.</p>
            </div>
            
            <div className="adt-modal-body" style={{ padding: 0 }}>
              <div className="flex justify-center" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--border-tertiary)' }}>
                {totpData?.qrCodeDataUrl && <Image src={totpData.qrCodeDataUrl} alt="QR Code" width={200} height={200} />}
              </div>
              
              <p className="text-xs text-center text-gray-500" style={{ fontSize: '12px', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Manual code: <code style={{ backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }}>{totpData?.secret}</code>
              </p>

              <form onSubmit={handleVerifyTOTP} className="flex gap-2" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <input 
                  type="text" 
                  placeholder="6-digit code" 
                  className="input" 
                  style={{ flex: 1 }}
                  value={totpCode} 
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  required 
                  pattern="\d{6}"
                />
                <button type="submit" className="btn btn-primary">
                  Verify
                </button>
              </form>
            </div>

            <div className="adt-modal-foot" style={{ padding: '16px 0 0 0', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-tertiary)' }}>
              <button type="button" onClick={() => setShowTotpModal(false)} className="btn btn-ghost" style={{ width: '100%' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
