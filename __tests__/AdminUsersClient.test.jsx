import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import AdminUsersClient from "../components/AdminUsersClient"
import {
  updateUserStatus,
  updateUserRole,
  deleteUser,
  deleteUsersBulk,
  deleteUserNuclear,
  deleteUsersNuclearBulk
} from "@/app/actions/admin"

jest.mock("next/link", () => ({ children, href, ...rest }) => <a href={href} {...rest}>{children}</a>)

jest.mock("@/app/actions/admin", () => ({
  updateUserStatus: jest.fn(),
  updateUserRole: jest.fn(),
  deleteUser: jest.fn(),
  deleteUsersBulk: jest.fn(),
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
  },
  {
    id: "u4",
    name: "Dave",
    email: "dave@test.com",
    status: "ARCHIVED",
    role: "USER",
    createdAt: "2024-04-10T00:00:00.000Z",
    image: null,
    deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    _count: { poems: 0, reportsReceived: 0 }
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
    expect(screen.getAllByText("Dave").length).toBeGreaterThan(0)
  })

  it("renders 'To be deleted' status with countdown for ARCHIVED users", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    expect(screen.getByText("To be deleted (25d left)")).toBeInTheDocument()
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
    expect(screen.getByText(/4 users/i)).toBeInTheDocument()
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
    expect(rowsDesc[0]).toBe("Dave")
  })

  it("sorts by joined date by default (desc)", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    const rows = screen.getAllByTestId("avatar").map(el => el.textContent)
    // Dave joined latest (2024-04-10)
    expect(rows[0]).toBe("Dave")
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

  it("calls deleteUser when single Delete confirmed", async () => {
    deleteUser.mockResolvedValue({ success: true })
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)

    const deleteBtns = screen.getAllByRole("button", { name: /^delete$/i })
    await act(async () => fireEvent.click(deleteBtns[0]))

    expect(window.confirm).toHaveBeenCalled()
    expect(deleteUser).toHaveBeenCalled()
  })

  it("calls deleteUserNuclear when Nuclear confirmed", async () => {
    deleteUserNuclear.mockResolvedValue({ success: true })
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)

    const nuclearBtns = screen.getAllByRole("button", { name: /^nuclear$/i })
    await act(async () => fireEvent.click(nuclearBtns[0]))

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
    expect(screen.getByRole("status").textContent).toMatch(/4/)
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

  it("calls deleteUsersBulk with correct IDs on confirm", async () => {
    deleteUsersBulk.mockResolvedValue({ success: true, deletedCount: 1 })
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)

    fireEvent.click(screen.getByLabelText(/select alice/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ user/i }))
    fireEvent.change(screen.getByPlaceholderText(/type delete here/i), {
      target: { value: "DELETE" }
    })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }))
    })

    expect(deleteUsersBulk).toHaveBeenCalledWith(["u1"])
  })

  it("updates deleted users in table on success", async () => {
    deleteUsersBulk.mockResolvedValue({ success: true, deletedCount: 1 })
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
      expect(screen.getAllByText("[deleted]").length).toBeGreaterThan(0)
    })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("shows error message when bulk delete fails", async () => {
    deleteUsersBulk.mockResolvedValue({ error: "Failed to delete users" })
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

describe("AdminUsersClient — Add User Modal", () => {
  it("opens the Add User modal", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByRole("button", { name: /create new member/i }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("User Permissions")).toBeInTheDocument()
  })

  it("closes the Add User modal on Discard", () => {
    render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByRole("button", { name: /create new member/i }))
    fireEvent.click(screen.getByRole("button", { name: /discard/i }))
    expect(screen.queryByText("User Permissions")).not.toBeInTheDocument()
  })
})

describe("AdminUsersClient — Row Dropdowns Click-Away", () => {
  it("dismisses role dropdown on click-away", () => {
    const { container } = render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    expect(container.querySelector('.custom-row-dropdown')).not.toBeInTheDocument()

    const roleButtons = container.querySelectorAll('.role-badge-btn')
    fireEvent.click(roleButtons[0])

    expect(container.querySelector('.custom-row-dropdown')).toBeInTheDocument()

    // Click inside the dropdown (should not dismiss)
    fireEvent.click(container.querySelector('.custom-row-dropdown'))
    expect(container.querySelector('.custom-row-dropdown')).toBeInTheDocument()

    // Click outside on the body (should dismiss)
    fireEvent.click(document.body)
    expect(container.querySelector('.custom-row-dropdown')).not.toBeInTheDocument()
  })

  it("dismisses status dropdown on click-away", () => {
    const { container } = render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    expect(container.querySelector('.custom-row-dropdown')).not.toBeInTheDocument()

    const statusButtons = container.querySelectorAll('.status-pill-btn')
    fireEvent.click(statusButtons[0])

    expect(container.querySelector('.custom-row-dropdown')).toBeInTheDocument()

    // Click inside the dropdown (should not dismiss)
    fireEvent.click(container.querySelector('.custom-row-dropdown'))
    expect(container.querySelector('.custom-row-dropdown')).toBeInTheDocument()

    // Click outside on the body (should dismiss)
    fireEvent.click(document.body)
    expect(container.querySelector('.custom-row-dropdown')).not.toBeInTheDocument()
  })
})

describe("AdminUsersClient — Style Modularity & Design System Consistency", () => {
  it("enforces strict styling layout classes on the main containers", () => {
    const { container } = render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    
    // Check main layout container
    const main = screen.getByRole("main")
    expect(main).toHaveClass("admin-main")
    expect(main).toHaveClass("custom-admin-layout-main")

    // Check user management header classes
    const header = container.querySelector(".user-management-header")
    expect(header).toBeInTheDocument()
    expect(container.querySelector(".user-management-breadcrumb")).toBeInTheDocument()
    expect(container.querySelector(".breadcrumb-muted")).toBeInTheDocument()
    expect(container.querySelector(".breadcrumb-active")).toBeInTheDocument()
    expect(container.querySelector(".user-management-title")).toBeInTheDocument()
    expect(container.querySelector(".user-management-badge")).toBeInTheDocument()
    expect(container.querySelector(".user-management-subtitle")).toBeInTheDocument()

    // Check toolbar styling classes
    const toolbar = container.querySelector(".user-management-toolbar")
    expect(toolbar).toBeInTheDocument()
    expect(container.querySelector(".toolbar-views-group")).toBeInTheDocument()
    expect(container.querySelector(".toolbar-options-group")).toBeInTheDocument()
    expect(container.querySelector(".action-search-container")).toBeInTheDocument()
    expect(container.querySelector(".action-search-icon")).toBeInTheDocument()
    expect(container.querySelector(".action-search-input")).toBeInTheDocument()
    
    // Verify view toggle buttons have correct base classes
    const viewButtons = container.querySelectorAll(".view-toggle-btn")
    expect(viewButtons.length).toBe(3)
    expect(viewButtons[0]).toHaveClass("active") // Table is default view
  })

  it("enforces strict table layout styling and custom rows", () => {
    const { container } = render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)

    expect(container.querySelector(".adt-container")).toBeInTheDocument()
    expect(container.querySelector(".adt-scroll")).toBeInTheDocument()
    expect(container.querySelector(".adt-table")).toBeInTheDocument()
    expect(container.querySelector(".adt-table thead")).toBeInTheDocument()
    expect(container.querySelector(".adt-table tbody")).toBeInTheDocument()

    // Verify row styling
    const tableRows = container.querySelectorAll(".adt-row")
    expect(tableRows.length).toBe(mockUsers.length)
    tableRows.forEach(row => {
      expect(row).toHaveClass("custom-premium-row")
    })
  })

  it("enforces badge and status pill styling in the table", () => {
    const { container } = render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)

    // Check role badge buttons
    const roleBadges = container.querySelectorAll(".role-badge-btn")
    expect(roleBadges.length).toBeGreaterThan(0)
    roleBadges.forEach(badge => {
      expect(badge).toHaveClass("role-badge-btn")
    })

    // Check status pill buttons
    const statusPills = container.querySelectorAll(".status-pill-btn")
    expect(statusPills.length).toBeGreaterThan(0)
    statusPills.forEach(pill => {
      expect(pill).toHaveClass("status-pill-btn")
    })
  })

  it("enforces modal overlay and design layout structure when bulk delete modal is opened", () => {
    const { container } = render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    
    // Select Alice and open modal
    fireEvent.click(screen.getByLabelText(/select alice/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ user/i }))
    
    // Verify modal overlay and modal container structure
    const modalOverlay = container.querySelector(".adt-modal-overlay")
    expect(modalOverlay).toBeInTheDocument()
    
    const modal = container.querySelector(".adt-modal")
    expect(modal).toBeInTheDocument()
    
    expect(container.querySelector(".adt-modal-head")).toBeInTheDocument()
    expect(container.querySelector(".adt-modal-alert-icon")).toBeInTheDocument()
    expect(container.querySelector(".adt-modal-title-text")).toBeInTheDocument()
    expect(container.querySelector(".adt-modal-sub-text")).toBeInTheDocument()
    expect(container.querySelector(".adt-modal-body")).toBeInTheDocument()
    expect(container.querySelector(".adt-modal-label")).toBeInTheDocument()
    expect(container.querySelector(".adt-modal-textarea")).toBeInTheDocument()
    expect(container.querySelector(".adt-modal-input")).toBeInTheDocument()
    expect(container.querySelector(".adt-modal-foot")).toBeInTheDocument()
  })

  it("matches full component rendering snapshot to lock the complete styling contract", () => {
    const { asFragment } = render(<AdminUsersClient initialUsers={mockUsers} currentUserRole="ADMIN" />)
    expect(asFragment()).toMatchSnapshot()
  })
})
