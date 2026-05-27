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
jest.mock("@/app/actions/profile", () => ({
  updateAccountSettings: (...args) => mockUpdateAccountSettings(...args)
}))

jest.mock("next-auth/react", () => ({
  signIn: jest.fn()
}))

describe("AccountSettingsClient", () => {
  const mockUser = {
    isPrivateAccount: false,
    mfaEnabled: false,
    emailNotifications: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders with initial values", () => {
    render(<AccountSettingsClient user={mockUser} />)
    expect(screen.getByLabelText(/Private Account/i)).not.toBeChecked()
    expect(screen.getByLabelText(/Email Notifications/i)).toBeChecked()
    expect(screen.getByLabelText(/Two-Factor Authentication/i)).not.toBeChecked()
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
    expect(screen.getByText(/Settings updated successfully/i)).toBeInTheDocument()
  })

  it("displays error message if update fails", async () => {
    mockUpdateAccountSettings.mockResolvedValue({ success: false, error: "Update failed" })
    render(<AccountSettingsClient user={mockUser} />)
    
    fireEvent.click(screen.getByRole("button", { name: /Save Settings/i }))

    await waitFor(() => {
      expect(screen.getByText("Update failed")).toBeInTheDocument()
    })
  })
})
