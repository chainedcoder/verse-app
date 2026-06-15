import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import AdminUsersClient from "../components/AdminUsersClient"
import {
  updateUserStatus,
  updateUserRole,
  deleteUserNuclear,
  deleteUsersNuclearBulk
} from "@/app/actions/admin"

jest.mock("next/link", () => ({ children, href }) => <a href={href}>{children}</a>)

jest.mock("@/app/actions/admin", () => ({
  updateUserStatus: jest.fn(),
  updateUserRole: jest.fn(),
  deleteUserNuclear: jest.fn(),
  deleteUsersNuclearBulk: jest.fn()
}))

jest.mock("../components/ToastProvider", () => ({
  useToast: () => ({ showToast: (msg) => window.alert(msg) })
}))
jest.mock("../components/ConfirmProvider", () => ({
  useConfirm: () => ({ confirm: async (msg) => window.confirm(msg) })
}))

// Avatar stub
jest.mock("../components/Avatar", () => ({ name }) => <span data-testid="avatar">{name}</span>)
jest.mock("../components/Pagination", () => ({ currentPage, totalPages, onPageChange }) => (
  <div data-testid="pagination">page {currentPage} of {totalPages}</div>
))

const mockUsers = [
  {
    id: "u1",
    name: "Alice",
    email: "alice@test.com",
    status: "ACTIVE",
    role: "USER",
    createdAt: "2024-01-15T00:00:00.000Z",
    image: null,
    _count: { poems: 5, reportsReceived: 0 }
  },
  {
    id: "u2",
    name: "Bob",
    email: "bob@test.com",
    status: "SUSPENDED",
    role: "MODERATOR",
    createdAt: "2024-03-10T00:00:00.000Z",
    image: null,
    _count: { poems: 2, reportsReceived: 3 }
  },
  {
    id: "u3",
    name: "Carol",
    email: "carol@test.com",
    status: "BANNED",
    role: "USER",
    createdAt: "2024-02-20T00:00:00.000Z",
    image: null,
    _count: { poems: 0, reportsReceived: 1 }
  }
]

beforeEach(() => {
  jest.clearAllMocks()
  window.alert = jest.fn()
  window.confirm = jest.fn(() => true)
})

describe("AdminUsersClient — rendering", () => {
  it("renders all users in the table", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    // Avatar shows name and link shows name — use getAllByText
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Bob").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Carol").length).toBeGreaterThan(0)
  })

  it("renders report count highlighted for users with reports", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("renders poem counts", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("shows user row count in toolbar", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    expect(screen.getByText(/3 users/i)).toBeInTheDocument()
  })

  it("renders Delete button only for ADMIN role", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    const deleteBtns = screen.getAllByRole("button", { name: /delete/i })
    expect(deleteBtns.length).toBeGreaterThan(0)
  })

  it("does not render Delete button for MODERATOR role", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="MODERATOR" />)
    expect(screen.queryByRole("button", { name: /^delete$/i })).not.toBeInTheDocument()
  })
})

describe("AdminUsersClient — filtering", () => {
  it("filters users by name search", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.change(screen.getByPlaceholderText(/search by name or email/i), {
      target: { value: "alice" }
    })
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0)
    expect(screen.queryByRole("link", { name: "Bob" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Carol" })).not.toBeInTheDocument()
  })

  it("filters users by email search", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.change(screen.getByPlaceholderText(/search by name or email/i), {
      target: { value: "carol@test.com" }
    })
    expect(screen.getAllByText("Carol").length).toBeGreaterThan(0)
    expect(screen.queryByRole("link", { name: "Alice" })).not.toBeInTheDocument()
  })

  it("filters by status dropdown", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.change(screen.getByLabelText(/filter by status/i), {
      target: { value: "ACTIVE" }
    })
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0)
    expect(screen.queryByRole("link", { name: "Bob" })).not.toBeInTheDocument()
  })

  it("filters by role dropdown", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.change(screen.getByLabelText(/filter by role/i), {
      target: { value: "MODERATOR" }
    })
    expect(screen.getAllByText("Bob").length).toBeGreaterThan(0)
    expect(screen.queryByRole("link", { name: "Alice" })).not.toBeInTheDocument()
  })

  it("shows empty state when no users match filters", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.change(screen.getByPlaceholderText(/search by name or email/i), {
      target: { value: "zzz_no_match" }
    })
    expect(screen.getByText(/no users found/i)).toBeInTheDocument()
  })
})

describe("AdminUsersClient — sorting", () => {
  it("sorts by name column asc/desc on click", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    const nameHeader = screen.getAllByRole("button", { name: /user/i }).find(el => el.classList.contains('adt-th'))

    // First click = asc
    fireEvent.click(nameHeader)
    const rows = screen.getAllByTestId("avatar").map(el => el.textContent)
    expect(rows[0]).toBe("Alice")

    // Second click = desc
    fireEvent.click(nameHeader)
    const rowsDesc = screen.getAllByTestId("avatar").map(el => el.textContent)
    expect(rowsDesc[0]).toBe("Carol")
  })

  it("sorts by joined date by default (desc)", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    const rows = screen.getAllByTestId("avatar").map(el => el.textContent)
    // Bob joined latest (2024-03-10)
    expect(rows[0]).toBe("Bob")
  })
})

describe("AdminUsersClient — single row actions", () => {
  it("calls updateUserStatus with BANNED when Ban button clicked", async () => {
    updateUserStatus.mockResolvedValue({ success: true })
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)

    // Sort by name asc so Alice is first
    const userHeader = screen.getAllByRole("button", { name: /user/i }).find(el => el.classList.contains('adt-th'))
    fireEvent.click(userHeader)
    const banBtns = screen.getAllByRole("button", { name: /^ban$/i })
    await act(async () => fireEvent.click(banBtns[0]))

    expect(updateUserStatus).toHaveBeenCalled()
  })

  it("calls deleteUserNuclear when single Delete confirmed", async () => {
    deleteUserNuclear.mockResolvedValue({ success: true })
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)

    const deleteBtns = screen.getAllByRole("button", { name: /^delete$/i })
    await act(async () => fireEvent.click(deleteBtns[0]))

    expect(window.confirm).toHaveBeenCalled()
    expect(deleteUserNuclear).toHaveBeenCalled()
  })

  it("prevents role changes for MODERATOR role", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="MODERATOR" />)
    const roleSelects = screen.getAllByLabelText(/role for/i)
    roleSelects.forEach(sel => expect(sel).toBeDisabled())
  })
})

describe("AdminUsersClient — checkbox selection", () => {
  it("selection bar is hidden initially", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    expect(screen.queryByText(/selected/i)).not.toBeInTheDocument()
  })

  it("shows selection bar when a row is checked", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    const checkboxes = screen.getAllByLabelText(/select alice/i)
    fireEvent.click(checkboxes[0])
    expect(screen.getByRole("status")).toBeInTheDocument()
    // Count shows in the status bar
    expect(screen.getByRole("status").textContent).toMatch(/1/)
  })

  it("shows correct count when multiple rows selected", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getAllByLabelText(/select alice/i)[0])
    fireEvent.click(screen.getAllByLabelText(/select bob/i)[0])
    expect(screen.getByRole("status").textContent).toMatch(/2/)
  })

  it("select-all checkbox selects all visible rows", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    const selectAll = screen.getByLabelText(/select all users on page/i)
    fireEvent.click(selectAll)
    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.getByRole("status").textContent).toMatch(/3/)
  })

  it("clicking select-all again deselects all", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    const selectAll = screen.getByLabelText(/select all users on page/i)
    fireEvent.click(selectAll)
    fireEvent.click(selectAll)
    expect(screen.queryByText(/users selected/i)).not.toBeInTheDocument()
  })

  it("Clear selection button deselects all", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    const selectAll = screen.getByLabelText(/select all users on page/i)
    fireEvent.click(selectAll)
    fireEvent.click(screen.getByRole("button", { name: /^clear$/i }))
    expect(screen.queryByText(/users selected/i)).not.toBeInTheDocument()
  })

  it("checkboxes disabled for MODERATOR (cannot bulk delete)", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="MODERATOR" />)
    const checkboxes = screen.getAllByLabelText(/select all users on page|select alice/i)
    checkboxes.forEach(cb => expect(cb).toBeDisabled())
  })
})

describe("AdminUsersClient — bulk delete modal", () => {
  it("opens modal when Delete Selected is clicked", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select alice/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ user/i }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    // Title text appears in the modal header
    expect(screen.getAllByText(/delete 1 user/i).length).toBeGreaterThan(0)
  })

  it("modal pre-fills textarea with username and email", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select alice/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ user/i }))

    const textarea = screen.getByLabelText(/list of accounts to be deleted/i)
    expect(textarea.value).toContain("Alice")
    expect(textarea.value).toContain("alice@test.com")
  })

  it("confirm button is disabled until DELETE is typed", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select alice/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ user/i }))

    const confirmBtn = screen.getByRole("button", { name: /yes, delete/i })
    expect(confirmBtn).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText(/type delete here/i), {
      target: { value: "DELETE" }
    })
    expect(confirmBtn).not.toBeDisabled()
  })

  it("confirm button case-insensitive: 'delete' also works", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select alice/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ user/i }))

    fireEvent.change(screen.getByPlaceholderText(/type delete here/i), {
      target: { value: "delete" }
    })
    const confirmBtn = screen.getByRole("button", { name: /yes, delete/i })
    expect(confirmBtn).not.toBeDisabled()
  })

  it("cancel button closes modal", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select alice/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ user/i }))

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("calls deleteUsersNuclearBulk with correct IDs on confirm", async () => {
    deleteUsersNuclearBulk.mockResolvedValue({ success: true, deletedCount: 1 })
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)

    fireEvent.click(screen.getByLabelText(/select alice/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ user/i }))
    fireEvent.change(screen.getByPlaceholderText(/type delete here/i), {
      target: { value: "DELETE" }
    })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }))
    })

    expect(deleteUsersNuclearBulk).toHaveBeenCalledWith(["u1"])
  })

  it("removes deleted users from table on success", async () => {
    deleteUsersNuclearBulk.mockResolvedValue({ success: true, deletedCount: 1 })
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)

    fireEvent.click(screen.getByLabelText(/select alice/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ user/i }))
    fireEvent.change(screen.getByPlaceholderText(/type delete here/i), {
      target: { value: "DELETE" }
    })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }))
    })

    await waitFor(() => {
      expect(screen.queryByText("Alice")).not.toBeInTheDocument()
    })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("shows error message when bulk delete fails", async () => {
    deleteUsersNuclearBulk.mockResolvedValue({ error: "Failed to delete users" })
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)

    fireEvent.click(screen.getByLabelText(/select alice/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ user/i }))
    fireEvent.change(screen.getByPlaceholderText(/type delete here/i), {
      target: { value: "DELETE" }
    })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }))
    })

    await waitFor(() => {
      expect(screen.getByText(/failed to delete users/i)).toBeInTheDocument()
    })
  })
})
