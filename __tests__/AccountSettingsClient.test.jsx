import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import AccountSettingsClient from "../components/AccountSettingsClient"

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  })
}))

// Mock the server action
const mockUpdateAccountSettings = jest.fn()
const mockDeleteAccount = jest.fn()
jest.mock("@/app/actions/profile", () => ({
  updateAccountSettings: (...args) => mockUpdateAccountSettings(...args),
  deleteAccount: (...args) => mockDeleteAccount(...args)
}))

jest.mock("@/app/actions/2fa", () => ({
  setupTOTP: jest.fn(),
  verifyTOTP: jest.fn(),
  disable2FA: jest.fn(),
  setupEmailOTP: jest.fn()
}))

jest.mock("@/app/actions/webauthn", () => ({
  getRegistrationOptions: jest.fn(),
  verifyRegistration: jest.fn()
}))

jest.mock("@simplewebauthn/browser", () => ({
  startRegistration: jest.fn()
}))

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  signOut: jest.fn()
}))

jest.mock("../components/ToastProvider", () => ({
  useToast: () => ({ showToast: (msg) => window.alert(msg) })
}))
jest.mock("../components/ConfirmProvider", () => ({
  useConfirm: () => ({ confirm: async (msg) => window.confirm(msg) })
}))

describe("AccountSettingsClient", () => {
  const mockUser = {
    isPrivateAccount: false,
    mfaEnabled: false,
    emailNotifications: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
    window.alert = jest.fn()
  })

  it("renders with initial values", () => {
    render(<AccountSettingsClient user={mockUser} />)
    expect(screen.getByLabelText(/Private Account/i)).not.toBeChecked()
    expect(screen.getByLabelText(/Email Notifications/i)).toBeChecked()
    // 2FA is not enabled initially in mockUser
    expect(screen.getByText(/Setup Authenticator App/i)).toBeInTheDocument()
    expect(screen.getByText(/Setup Passkey/i)).toBeInTheDocument()
    expect(screen.getByText(/Setup Email OTP/i)).toBeInTheDocument()
  })

  it("updates state when toggles are clicked", () => {
    render(<AccountSettingsClient user={mockUser} />)
    
    const privateToggle = screen.getByLabelText(/Private Account/i)
    fireEvent.click(privateToggle)
    expect(privateToggle).toBeChecked()

    const emailToggle = screen.getByLabelText(/Email Notifications/i)
    fireEvent.click(emailToggle)
    expect(emailToggle).not.toBeChecked()
  })

  it("calls updateAccountSettings on form submit", async () => {
    mockUpdateAccountSettings.mockResolvedValue({ success: true })
    render(<AccountSettingsClient user={mockUser} />)
    
    // Toggle private account
    fireEvent.click(screen.getByLabelText(/Private Account/i))
    
    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /Save Settings/i }))

    await waitFor(() => {
      expect(mockUpdateAccountSettings).toHaveBeenCalled()
    })

    // Expect success message
    expect(await screen.findByText(/Settings updated successfully/i)).toBeInTheDocument()
  })

  it("displays error message if update fails", async () => {
    mockUpdateAccountSettings.mockResolvedValue({ success: false, error: "Update failed" })
    render(<AccountSettingsClient user={mockUser} />)
    
    fireEvent.click(screen.getByRole("button", { name: /Save Settings/i }))

    await waitFor(() => {
      expect(screen.getByText("Update failed")).toBeInTheDocument()
    })
  })

  it("calls deleteAccount when Delete Account is clicked and confirmed", async () => {
    mockDeleteAccount.mockResolvedValue({ success: true })
    render(<AccountSettingsClient user={mockUser} />)
    
    // Click Delete Account button
    fireEvent.click(screen.getByRole("button", { name: /^Delete Account$/i }))

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled()
      expect(mockDeleteAccount).toHaveBeenCalled()
    })
  })

  it("shows error when deleteAccount fails", async () => {
    mockDeleteAccount.mockResolvedValue({ success: false, error: "Failed to delete account" })
    render(<AccountSettingsClient user={mockUser} />)
    
    fireEvent.click(screen.getByRole("button", { name: /^Delete Account$/i }))

    await waitFor(() => {
      expect(screen.getByText("Failed to delete account")).toBeInTheDocument()
    })
  })
})
