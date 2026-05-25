import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import ProfileClient from "../components/ProfileClient"

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

// Mock PoemCard to isolate the test
jest.mock("@/components/PoemCard", () => {
  return function MockPoemCard({ poem }) {
    return <div data-testid="poem-card">{poem.title}</div>
  }
})

// Mock Server Actions to prevent loading next-auth which causes ESM errors in Jest
jest.mock("@/app/actions/interactions", () => ({
  toggleLike: jest.fn()
}))

describe("ProfileClient", () => {
  const mockUser = {
    id: "user1",
    name: "Jane Doe",
    bio: "Poetry lover",
    poemsCount: 1,
    readersCount: 2,
    followingCount: 0,
    followersList: [
      { id: "f1", name: "Follower One" },
      { id: "f2", name: "Follower Two" }
    ],
    followingList: []
  }

  const mockPoems = [{ id: "p1", title: "My First Poem" }]
  const mockLikedPoems = [{ id: "p2", title: "Liked Poem" }]
  const mockCollections = [{ id: "c1", name: "Favorites", isPublic: true }]

  it("renders user profile info", () => {
    render(<ProfileClient user={mockUser} poems={mockPoems} likedPoems={mockLikedPoems} collections={mockCollections} />)
    expect(screen.getByText("Jane Doe")).toBeInTheDocument()
    expect(screen.getByText("Poetry lover")).toBeInTheDocument()
  })

  it("renders poems tab by default", () => {
    render(<ProfileClient user={mockUser} poems={mockPoems} likedPoems={mockLikedPoems} collections={mockCollections} />)
    expect(screen.getByText("My First Poem")).toBeInTheDocument()
  })

  it("switches to liked tab", () => {
    render(<ProfileClient user={mockUser} poems={mockPoems} likedPoems={mockLikedPoems} collections={mockCollections} />)
    fireEvent.click(screen.getByRole("button", { name: "Liked" }))
    expect(screen.getByText("Liked Poem")).toBeInTheDocument()
    expect(screen.queryByText("My First Poem")).not.toBeInTheDocument()
  })

  it("switches to collections tab", () => {
    render(<ProfileClient user={mockUser} poems={mockPoems} likedPoems={mockLikedPoems} collections={mockCollections} />)
    fireEvent.click(screen.getByRole("button", { name: "Collections" }))
    expect(screen.getByText("Favorites")).toBeInTheDocument()
  })

  it("switches to followers tab and renders followers", () => {
    render(<ProfileClient user={mockUser} poems={mockPoems} likedPoems={mockLikedPoems} collections={mockCollections} />)
    fireEvent.click(screen.getByRole("button", { name: "Followers" }))
    expect(screen.getByText("Follower One")).toBeInTheDocument()
    expect(screen.getByText("Follower Two")).toBeInTheDocument()
  })

  it("switches to following tab and shows empty state", () => {
    render(<ProfileClient user={mockUser} poems={mockPoems} likedPoems={mockLikedPoems} collections={mockCollections} />)
    fireEvent.click(screen.getByRole("button", { name: "Following" }))
    expect(screen.getByText("You aren't following anyone yet.")).toBeInTheDocument()
  })
})
