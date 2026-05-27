import { render, screen, fireEvent, act } from '@testing-library/react'
import FeaturedPoemCard from '../components/FeaturedPoemCard'
import '@testing-library/jest-dom'

jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))

jest.mock('@/app/actions/interactions', () => ({
  toggleLike: jest.fn()
}))

// Mock ExportModal to avoid canvas/theme dependencies
jest.mock('../components/ExportModal', () => {
  return function MockExportModal({ onClose }) {
    return (
      <div data-testid="export-modal">
        <button onClick={onClose} aria-label="Close export modal">Close</button>
      </div>
    )
  }
})

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
})

describe('FeaturedPoemCard', () => {
  const mockPoem = {
    id: 'featpoem1',
    title: 'The Road Not Taken',
    excerpt: 'Two roads diverged in a yellow wood',
    fullText: 'Two roads diverged in a yellow wood,\nAnd sorry I could not travel both',
    tags: [{ name: 'classic' }],
    featured: true,
    authorId: 'author2',
    createdAt: new Date('1916-01-01T00:00:00.000Z').toISOString(),
    author: {
      name: 'Robert Frost',
      image: null,
    },
    _count: { likes: 88 },
  }

  const manyTagsPoem = {
    ...mockPoem,
    id: 'featpoem-many-tags',
    tags: [
      { name: 'classic' },
      { name: 'nature' },
      { name: 'journey' },
      { name: 'philosophy' },
      { name: 'americana' },
    ],
  }

  const longTagPoem = {
    ...mockPoem,
    id: 'featpoem-long-tag',
    tags: [{ name: 'averylongtagthatexceedseighteencharacters' }],
  }

  it('renders the poem title and excerpt', () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    expect(screen.getByText('The Road Not Taken')).toBeInTheDocument()
    expect(screen.getByText(/Two roads diverged/)).toBeInTheDocument()
  })

  it('renders the Featured badge', () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    expect(screen.getByText(/Featured/)).toBeInTheDocument()
  })

  it('displays read time using "m" abbreviation (not "min")', () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    const readTimeEl = screen.getByText(/m read/)
    expect(readTimeEl.textContent).not.toMatch(/min read/)
  })

  it('renders the share options and repost buttons', () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    expect(screen.getByLabelText('Repost')).toBeInTheDocument()
    expect(screen.getByLabelText('Share options')).toBeInTheDocument()
  })

  it('clicking "Download" in the share dropdown opens the ExportModal instead of navigating', async () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    const menuBtn = screen.getByLabelText('Share options')

    await act(async () => { fireEvent.click(menuBtn) })

    const downloadBtn = screen.getByRole('menuitem', { name: /Download/i })
    await act(async () => { fireEvent.click(downloadBtn) })

    // Dropdown should close and modal should open
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByTestId('export-modal')).toBeInTheDocument()
  })

  it('ExportModal can be closed from FeaturedPoemCard', async () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    const menuBtn = screen.getByLabelText('Share options')

    await act(async () => { fireEvent.click(menuBtn) })
    await act(async () => { fireEvent.click(screen.getByRole('menuitem', { name: /Download/i })) })
    await act(async () => { fireEvent.click(screen.getByLabelText('Close export modal')) })

    expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument()
  })

  it('copies the link and closes dropdown after "Copy link" is clicked', async () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    const menuBtn = screen.getByLabelText('Share options')

    await act(async () => { fireEvent.click(menuBtn) })

    const shareLinkBtn = screen.getByRole('menuitem', { name: /Copy link/ })
    await act(async () => { fireEvent.click(shareLinkBtn) })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining(`/poem/${mockPoem.id}`)
    )
  })

  it('renders author name in the footer', () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    expect(screen.getByText('Robert Frost')).toBeInTheDocument()
  })

  it('shows at most 3 tags and a +N badge for extra tags', () => {
    render(<FeaturedPoemCard poem={manyTagsPoem} />)
    expect(screen.getByText(/#classic/)).toBeInTheDocument()
    expect(screen.getByText(/#nature/)).toBeInTheDocument()
    expect(screen.getByText(/#journey/)).toBeInTheDocument()
    expect(screen.queryByText(/#philosophy/)).not.toBeInTheDocument()
    expect(screen.queryByText(/#americana/)).not.toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('truncates a long tag name at 18 chars with ellipsis', () => {
    render(<FeaturedPoemCard poem={longTagPoem} />)
    expect(screen.getByText('#averylongtagthatex…')).toBeInTheDocument()
  })

  it('applies poem-card__title--clamp-2 class to the title heading', () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    const heading = screen.getByRole('heading', { name: /The Road Not Taken/ })
    expect(heading).toHaveClass('poem-card__title--clamp-2')
  })

  it('renders divider when in immersive mode', () => {
    const { container } = render(<FeaturedPoemCard poem={mockPoem} isImmersive={true} />)
    const divider = container.querySelector('hr.divider')
    expect(divider).toBeInTheDocument()
  })
})
