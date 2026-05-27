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

// Mock ExportModal to avoid canvas/theme dependencies
jest.mock('@/components/ExportModal', () => {
  return function MockExportModal({ onClose }) {
    return (
      <div data-testid="export-modal">
        <button onClick={onClose} aria-label="Close export modal">Close</button>
      </div>
    )
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

  it('renders share dropdown with options when share button is clicked', async () => {
    const { act } = require('react')
    await act(async () => {
      render(<PoemPageClient {...defaultProps} />)
    })
    
    // Find the main Share button
    const shareButton = screen.getByRole('button', { name: /Share/i })
    expect(shareButton).toBeInTheDocument()
    
    // Click it to open the dropdown
    await act(async () => {
      fireEvent.click(shareButton)
    })
    
    // Now the dropdown options should be visible
    expect(screen.getByText('Share to X')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('Copy link')).toBeInTheDocument()
    expect(screen.getByText('Others')).toBeInTheDocument()
  })

  it('clicking "Download" in the share dropdown opens the ExportModal', async () => {
    const { act } = require('react')
    await act(async () => {
      render(<PoemPageClient {...defaultProps} />)
    })

    const shareButton = screen.getByRole('button', { name: /Share/i })
    await act(async () => { fireEvent.click(shareButton) })

    const downloadBtn = screen.getByRole('menuitem', { name: /Download/i })
    await act(async () => { fireEvent.click(downloadBtn) })

    // Share dropdown should close
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    // ExportModal should be visible
    expect(screen.getByTestId('export-modal')).toBeInTheDocument()
  })

  it('ExportModal can be closed from PoemPageClient', async () => {
    const { act } = require('react')
    await act(async () => {
      render(<PoemPageClient {...defaultProps} />)
    })

    const shareButton = screen.getByRole('button', { name: /Share/i })
    await act(async () => { fireEvent.click(shareButton) })
    await act(async () => { fireEvent.click(screen.getByRole('menuitem', { name: /Download/i })) })
    await act(async () => { fireEvent.click(screen.getByLabelText('Close export modal')) })

    expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument()
  })
})
