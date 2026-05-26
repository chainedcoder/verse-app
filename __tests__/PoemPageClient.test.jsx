import { render, screen, fireEvent } from '@testing-library/react'
import PoemPageClient from '../components/PoemPageClient'
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}))

jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

jest.mock('@/app/actions/interactions', () => ({
  toggleLike: jest.fn(),
  getLikers: jest.fn().mockResolvedValue({ success: true, likers: [] }),
}))

jest.mock('@/app/actions/collections', () => ({
  togglePoemInCollection: jest.fn(),
}))

jest.mock('@/app/actions/comments', () => ({
  createComment: jest.fn(),
  getCommentsForPoem: jest.fn().mockResolvedValue({ success: true, comments: [] }),
  deleteComment: jest.fn(),
}))

jest.mock('@/app/actions/poems', () => ({
  toggleFeatured: jest.fn(),
}))

jest.mock('@/components/ReportButton', () => {
  return function MockReportButton() {
    return <div data-testid="mock-report-button" />
  }
})

const mockPoem = {
  id: 'p1',
  title: 'Test Poem Title',
  excerpt: 'Excerpt text',
  fullText: 'Full poem body content',
  createdAt: '2026-05-26T22:00:00.000Z',
  tags: [{ name: 'nature' }],
  author: {
    id: 'a1',
    name: 'Author Name',
    image: null,
    bio: 'Author bio text',
    _count: { poems: 5, followers: 10 }
  },
  _count: { likes: 4 }
}

describe('PoemPageClient', () => {
  const defaultProps = {
    poem: mockPoem,
    initialLiked: false,
    initialFollowingAuthor: false,
    userCollections: [],
    userId: 'user123',
  }

  it('renders the poem details, title, and body', async () => {
    const { act } = require('react')
    await act(async () => {
      render(<PoemPageClient {...defaultProps} />)
    })
    expect(screen.getByText('Test Poem Title')).toBeInTheDocument()
    expect(screen.getByText('Author Name')).toBeInTheDocument()
    expect(screen.getByText('Full poem body content')).toBeInTheDocument()
  })

  it('renders standard social share intent buttons with correct urls', async () => {
    const { act } = require('react')
    await act(async () => {
      render(<PoemPageClient {...defaultProps} />)
    })
    
    const twitterLink = screen.getByLabelText('Share on Twitter/X')
    expect(twitterLink).toBeInTheDocument()
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/intent/tweet?text=%22Test%20Poem%20Title%22%20by%20Author%20Name%20on%20Verse&url=http%3A%2F%2Flocalhost%2Fpoem%2Fp1')
    
    const facebookLink = screen.getByLabelText('Share on Facebook')
    expect(facebookLink).toBeInTheDocument()
    expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Flocalhost%2Fpoem%2Fp1')
  })
})
