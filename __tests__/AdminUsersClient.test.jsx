import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import AdminUsersClient from "../components/AdminUsersClient"
import { updateUserStatus, updateUserRole } from "@/app/actions/admin"

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

// Mock Server Actions
jest.mock("@/app/actions/admin", () => ({
  updateUserStatus: jest.fn(),
  updateUserRole: jest.fn()
}))

describe("AdminUsersClient", () => {
  const mockUsers = [
    {
      id: "u1",
      name: "John Doe",
      email: "john@test.com",
      status: "ACTIVE",
      role: "USER",
      _count: { poems: 5, reportsReceived: 0 }
    },
    {
      id: "u2",
      name: "Bad User",
      email: "bad@test.com",
      status: "SUSPENDED",
      role: "USER",
      _count: { poems: 1, reportsReceived: 3 }
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    window.alert = jest.fn()
  })

  it("renders the user list", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("Bad User")).toBeInTheDocument()
    // Should show reports count for Bad User
    expect(screen.getByText(/Reports: 3/i)).toBeInTheDocument()
  })

  it("filters users by search term", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    const searchInput = screen.getByPlaceholderText(/Search by name/i)
    
    fireEvent.change(searchInput, { target: { value: "john" } })
    
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.queryByText("Bad User")).not.toBeInTheDocument()
  })

  it("allows admin to change user status", async () => {
    updateUserStatus.mockResolvedValue({ success: true })
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    
    // Quick Ban button for John Doe
    const banButtons = screen.getAllByRole("button", { name: /Quick Ban/i })
    fireEvent.click(banButtons[0]) // John Doe's ban button
    
    await waitFor(() => {
      expect(updateUserStatus).toHaveBeenCalledWith("u1", "BANNED")
    })
  })

  it("prevents moderators from changing roles", async () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="MODERATOR" />)
    
    // Find Role select for first user
    const roleSelects = screen.getAllByRole("combobox").filter(el => 
      el.querySelector("option[value='USER']") && el.querySelector("option[value='ADMIN']")
    )
    
    expect(roleSelects[0]).toBeDisabled()
  })
})
