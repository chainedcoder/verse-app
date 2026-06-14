import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import AdminContentClient from "../components/AdminContentClient"
import {
  togglePoemFeatured,
  deletePoemAdmin,
  deletePoemsAdminBulk
} from "@/app/actions/admin"

jest.mock("next/link", () => ({ children, href }) => <a href={href}>{children}</a>)

jest.mock("@/app/actions/admin", () => ({
  togglePoemFeatured: jest.fn(),
  deletePoemAdmin: jest.fn(),
  deletePoemsAdminBulk: jest.fn()
}))

jest.mock("../components/Avatar", () => ({ name }) => <span data-testid="avatar">{name}</span>)
jest.mock("../components/Pagination", () => ({ currentPage, totalPages }) => (
  <div data-testid="pagination">page {currentPage} of {totalPages}</div>
))

const mockPoems = [
  {
    id: "p1",
    title: "Roses at Dawn",
    excerpt: "A poem about flowers",
    status: "PUBLISHED",
    featured: false,
    createdAt: "2024-01-15T00:00:00.000Z",
    author: { id: "a1", name: "Alice", image: null }
  },
  {
    id: "p2",
    title: "Ocean's Whisper",
    excerpt: "A poem about the sea",
    status: "PUBLISHED",
    featured: true,
    createdAt: "2024-03-10T00:00:00.000Z",
    author: { id: "a2", name: "Bob", image: null }
  },
  {
    id: "p3",
    title: "Winter Silence",
    excerpt: "A cold poem",
    status: "DELETED",
    featured: false,
    createdAt: "2024-02-20T00:00:00.000Z",
    author: { id: "a1", name: "Alice", image: null }
  }
]

beforeEach(() => {
  jest.clearAllMocks()
  window.alert = jest.fn()
  window.confirm = jest.fn(() => true)
})

describe("AdminContentClient — rendering", () => {
  it("renders all poems", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    expect(screen.getByText("Roses at Dawn")).toBeInTheDocument()
    expect(screen.getByText("Ocean's Whisper")).toBeInTheDocument()
    expect(screen.getByText("Winter Silence")).toBeInTheDocument()
  })

  it("shows FEATURED badge for featured poem", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    expect(screen.getByText("FEATURED")).toBeInTheDocument()
  })

  it("shows DELETED status badge", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    expect(screen.getByText("DELETED")).toBeInTheDocument()
  })

  it("shows poem count in toolbar", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    expect(screen.getByText(/3 poems/i)).toBeInTheDocument()
  })
})

describe("AdminContentClient — filtering", () => {
  it("filters by title search", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.change(screen.getByLabelText(/search poems/i), {
      target: { value: "roses" }
    })
    expect(screen.getByText("Roses at Dawn")).toBeInTheDocument()
    expect(screen.queryByText("Ocean's Whisper")).not.toBeInTheDocument()
  })

  it("filters by author name search", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.change(screen.getByLabelText(/search poems/i), {
      target: { value: "bob" }
    })
    expect(screen.getByText("Ocean's Whisper")).toBeInTheDocument()
    expect(screen.queryByText("Roses at Dawn")).not.toBeInTheDocument()
  })

  it("filters by status DELETED", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.change(screen.getByLabelText(/filter by status/i), {
      target: { value: "DELETED" }
    })
    expect(screen.getByText("Winter Silence")).toBeInTheDocument()
    expect(screen.queryByText("Roses at Dawn")).not.toBeInTheDocument()
  })

  it("filters by FEATURED", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.change(screen.getByLabelText(/filter by featured/i), {
      target: { value: "FEATURED" }
    })
    expect(screen.getByText("Ocean's Whisper")).toBeInTheDocument()
    expect(screen.queryByText("Roses at Dawn")).not.toBeInTheDocument()
  })

  it("shows empty state when no poems match", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.change(screen.getByLabelText(/search poems/i), {
      target: { value: "zzz_no_match" }
    })
    expect(screen.getByText(/no poems found/i)).toBeInTheDocument()
  })
})

describe("AdminContentClient — sorting", () => {
  it("sorts by title ascending on first click", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    const titleHeader = screen.getByRole("button", { name: /poem/i })
    fireEvent.click(titleHeader)
    const links = screen.getAllByRole("link").filter(a => a.href.includes("/poem/"))
    expect(links[0].textContent).toBe("Ocean's Whisper") // O < R < W
  })

  it("sorts by author ascending", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    const authorHeader = screen.getByRole("button", { name: /author/i })
    fireEvent.click(authorHeader)
    const avatars = screen.getAllByTestId("avatar").map(el => el.textContent)
    expect(avatars[0]).toBe("Alice")
  })

  it("sorts by date desc by default (latest first)", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    const links = screen.getAllByRole("link").filter(a => a.href.includes("/poem/"))
    // Bob's poem (2024-03-10) is the newest
    expect(links[0].textContent).toBe("Ocean's Whisper")
  })

  it("toggles sort direction on second click", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    const titleHeader = screen.getByRole("button", { name: /poem/i })
    fireEvent.click(titleHeader) // asc
    fireEvent.click(titleHeader) // desc
    const links = screen.getAllByRole("link").filter(a => a.href.includes("/poem/"))
    expect(links[0].textContent).toBe("Winter Silence") // W first in desc
  })
})

describe("AdminContentClient — single row actions", () => {
  it("calls togglePoemFeatured when Feature is clicked", async () => {
    togglePoemFeatured.mockResolvedValue({ success: true })
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    
    // Get all enabled Feature buttons (not disabled ones for DELETED poems)
    const featureBtns = screen.getAllByRole("button", { name: /^feature$/i })
    const enabledBtn = featureBtns.find(b => !b.disabled)
    expect(enabledBtn).toBeTruthy()
    await act(async () => fireEvent.click(enabledBtn))

    expect(togglePoemFeatured).toHaveBeenCalled()
  })

  it("calls deletePoemAdmin when Delete clicked and confirmed", async () => {
    deletePoemAdmin.mockResolvedValue({ success: true })
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)

    // Only published poems have Delete enabled (p3 is already deleted & disabled)
    const deleteBtns = screen.getAllByRole("button", { name: /^delete$/i }).filter(b => !b.disabled)
    await act(async () => fireEvent.click(deleteBtns[0]))

    expect(window.confirm).toHaveBeenCalled()
    expect(deletePoemAdmin).toHaveBeenCalled()
  })

  it("Delete button is disabled for already-deleted poems", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    // Winter Silence is DELETED — its delete button should be disabled
    // Get all delete buttons: the one corresponding to p3 (DELETED) should be disabled
    const allDeleteBtns = screen.getAllByRole("button", { name: /^delete$/i })
    const disabledBtns = allDeleteBtns.filter(b => b.disabled)
    expect(disabledBtns.length).toBeGreaterThan(0)
  })
})

describe("AdminContentClient — checkbox selection", () => {
  it("selection bar hidden initially", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("shows selection bar when a poem is checked", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    const checkbox = screen.getByLabelText(/select poem: roses at dawn/i)
    fireEvent.click(checkbox)
    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.getByRole("status").textContent).toMatch(/1/)
  })

  it("select-all checks all visible poems", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select all poems on page/i))
    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.getByRole("status").textContent).toMatch(/3/)
  })

  it("clear selection deselects all", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select all poems on page/i))
    fireEvent.click(screen.getByRole("button", { name: /^clear$/i }))
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})

describe("AdminContentClient — bulk delete modal", () => {
  it("opens modal when Delete Selected clicked", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select poem: roses at dawn/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ poem/i }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getAllByText(/delete 1 poem/i).length).toBeGreaterThan(0)
  })

  it("modal shows poem titles in textarea", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select poem: roses at dawn/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ poem/i }))

    const textarea = screen.getByLabelText(/list of poems to be deleted/i)
    expect(textarea.value).toContain("Roses at Dawn")
  })

  it("confirm button disabled until DELETE typed", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select poem: roses at dawn/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ poem/i }))

    // The confirm button in the modal footer (not the selection bar trigger)
    const confirmBtns = screen.getAllByRole("button", { name: /delete 1 poem/i })
    const confirmBtn = confirmBtns[confirmBtns.length - 1]
    expect(confirmBtn).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText(/type delete here/i), {
      target: { value: "DELETE" }
    })
    expect(confirmBtn).not.toBeDisabled()
  })

  it("cancel closes the modal", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select poem: roses at dawn/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ poem/i }))
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("calls deletePoemsAdminBulk with correct IDs on confirm", async () => {
    deletePoemsAdminBulk.mockResolvedValue({ success: true, deletedCount: 1 })
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)

    fireEvent.click(screen.getByLabelText(/select poem: roses at dawn/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ poem/i }))
    fireEvent.change(screen.getByPlaceholderText(/type delete here/i), {
      target: { value: "DELETE" }
    })

    await act(async () => {
      const confirmBtns = screen.getAllByRole("button", { name: /delete 1 poem/i })
      fireEvent.click(confirmBtns[confirmBtns.length - 1])
    })

    expect(deletePoemsAdminBulk).toHaveBeenCalledWith(["p1"])
  })

  it("soft-deletes poems in table on success", async () => {
    deletePoemsAdminBulk.mockResolvedValue({ success: true, deletedCount: 1 })
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)

    fireEvent.click(screen.getByLabelText(/select poem: roses at dawn/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ poem/i }))
    fireEvent.change(screen.getByPlaceholderText(/type delete here/i), {
      target: { value: "DELETE" }
    })

    await act(async () => {
      const confirmBtns = screen.getAllByRole("button", { name: /delete 1 poem/i })
      fireEvent.click(confirmBtns[confirmBtns.length - 1])
    })

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
    // Poem should still be in the table but marked as DELETED
    const deletedBadges = screen.getAllByText("DELETED")
    expect(deletedBadges.length).toBeGreaterThan(1) // p3 was already deleted + p1 now
  })

  it("shows error on bulk delete failure", async () => {
    deletePoemsAdminBulk.mockResolvedValue({ error: "Failed to delete poems" })
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)

    fireEvent.click(screen.getByLabelText(/select poem: roses at dawn/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ poem/i }))
    fireEvent.change(screen.getByPlaceholderText(/type delete here/i), {
      target: { value: "DELETE" }
    })

    await act(async () => {
      const confirmBtns = screen.getAllByRole("button", { name: /delete 1 poem/i })
      fireEvent.click(confirmBtns[confirmBtns.length - 1])
    })

    await waitFor(() => {
      expect(screen.getByText(/failed to delete poems/i)).toBeInTheDocument()
    })
  })

  it("selecting multiple poems shows plural in modal title", () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    fireEvent.click(screen.getByLabelText(/select all poems on page/i))
    fireEvent.click(screen.getByRole("button", { name: /delete selected|delete \d+ poem/i }))
    expect(screen.getAllByText(/delete 3 poems/i).length).toBeGreaterThan(0)
  })
})
