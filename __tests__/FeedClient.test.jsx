import { render, screen, fireEvent } from '@testing-library/react'
import FeedClient from '../components/FeedClient'
import '@testing-library/jest-dom'

jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/app/actions/interactions', () => ({
  toggleLike: jest.fn(),
  toggleFollow: jest.fn(),
}))

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
})

const makePoem = (id, tags = []) => ({
  id,
  title: `Poem ${id}`,
  excerpt: 'An excerpt of the poem',
  fullText: 'The full text of the poem for read time estimation',
  tags: tags.map(name => ({ name })),
  featured: false,
  authorId: 'author1',
  createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  author: { name: 'Test Author', image: null },
  _count: { likes: 5 },
})

const mockTrendingAuthors = [
  { id: 'a1', name: 'Alice Poet', bio: 'Writes about nature', image: null },
  { id: 'a2', name: 'Bob Verse', bio: 'Haiku master', image: null },
]

const mockTags = ['nature', 'love', 'classic', 'haiku']

describe('FeedClient', () => {
  const defaultProps = {
    initialPoems: [makePoem('p1', ['nature']), makePoem('p2', ['love'])],
    featuredPoems: [],
    tags: mockTags,
    trendingAuthors: mockTrendingAuthors,
    initialLikedPoemIds: [],
    initialFollowedAuthorIds: [],
    currentUserId: null,
  }

  it('renders the tag filter strip', () => {
    render(<FeedClient {...defaultProps} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getAllByText('nature').length).toBeGreaterThan(0)
    expect(screen.getAllByText('love').length).toBeGreaterThan(0)
  })

  it('renders poem cards in the feed', () => {
    render(<FeedClient {...defaultProps} />)
    expect(screen.getByText('Poem p1')).toBeInTheDocument()
    expect(screen.getByText('Poem p2')).toBeInTheDocument()
  })

  it('shows an empty state when no poems match the active tag', () => {
    render(<FeedClient {...defaultProps} initialPoems={[]} />)
    expect(screen.getByText(/No poems found for this tag/)).toBeInTheDocument()
  })

  it('filters poems when a tag is clicked', () => {
    render(<FeedClient {...defaultProps} />)
    // Click "nature" tag in the top strip
    const natureTags = screen.getAllByText('nature')
    fireEvent.click(natureTags[0])
    // p1 has "nature" tag, p2 has "love"
    expect(screen.getByText('Poem p1')).toBeInTheDocument()
    expect(screen.queryByText('Poem p2')).not.toBeInTheDocument()
  })

  it('renders the mobile-feed-interrupt trending authors section', () => {
    render(<FeedClient {...defaultProps} />)
    // Both mobile strip and sidebar may render "Trending authors" — getAllByText is safe
    const headings = screen.getAllByText('Trending authors')
    expect(headings.length).toBeGreaterThan(0)
    // Author names inside the mobile carousel
    expect(screen.getAllByText('Alice Poet').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob Verse').length).toBeGreaterThan(0)
  })

  it('renders the mobile-feed-interrupt popular tags section', () => {
    render(<FeedClient {...defaultProps} />)
    // Both mobile strip and sidebar render "Popular tags"
    const headings = screen.getAllByText('Popular tags')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('does NOT render mobile interrupt sections when there are no authors or tags', () => {
    const { container } = render(<FeedClient {...defaultProps} trendingAuthors={[]} tags={[]} />)
    // The mobile-specific sections should not be rendered when lists are empty
    expect(container.querySelector('.mobile-authors-strip')).not.toBeInTheDocument()
    expect(container.querySelector('.mobile-tags-strip')).not.toBeInTheDocument()
  })

  it('renders Follow buttons for trending authors in the mobile strip', () => {
    render(<FeedClient {...defaultProps} />)
    const followBtns = screen.getAllByText('Follow')
    // Mobile strip has one Follow per author; sidebar also has Follow buttons
    expect(followBtns.length).toBeGreaterThanOrEqual(mockTrendingAuthors.length)
  })

  it('renders Following button for already-followed authors', () => {
    render(<FeedClient {...defaultProps} initialFollowedAuthorIds={['a1']} />
    )
    // Multiple "Following" may appear (mobile + sidebar); at least one should exist
    const followingBtns = screen.getAllByText('Following')
    expect(followingBtns.length).toBeGreaterThan(0)
  })
})
