import { render, screen, fireEvent } from "@testing-library/react"
import Nav from "../components/Nav"
import "@testing-library/jest-dom"
import { useSession } from "next-auth/react"

// Mock dependencies
jest.mock("next/link", () => {
  return ({ children, href, onClick }) => {
    return <a href={href} onClick={onClick}>{children}</a>
  }
})

jest.mock("next/navigation", () => ({
  usePathname: () => "/"
}))

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
  signOut: jest.fn()
}))

jest.mock("@/app/actions/notifications", () => ({
  getNotifications: jest.fn().mockResolvedValue({ success: false }),
  markNotificationsAsRead: jest.fn()
}))

jest.mock("@/app/actions/poems", () => ({
  searchPoems: jest.fn()
}))

describe("Nav Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders standard navigation links", () => {
    render(<Nav />)
    expect(screen.getAllByText("Discover").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Collections").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Authors").length).toBeGreaterThan(0)
  })

  it("renders Log in and Sign up buttons when unauthenticated", () => {
    useSession.mockReturnValue({ data: null, status: "unauthenticated" })
    render(<Nav />)
    expect(screen.getAllByText("Log in").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Sign up").length).toBeGreaterThan(0)
  })

  it("renders user session specific controls when authenticated", () => {
    useSession.mockReturnValue({
      data: { user: { name: "Stephen", image: null } },
      status: "authenticated"
    })
    render(<Nav />)
    expect(screen.getAllByText("Write").length).toBeGreaterThan(0)
    expect(screen.getByLabelText("User menu")).toBeInTheDocument()
  })
})
