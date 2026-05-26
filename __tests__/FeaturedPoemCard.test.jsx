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

  it('renders individual share and download buttons (visible on larger screens)', () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    // Download is a Link - mock strips aria-label, check by href
    expect(screen.getAllByRole('link', { name: '' }).some(el => el.href?.includes('/export/'))).toBe(true)
    // Share button has aria-label
    expect(screen.getByLabelText('Share')).toBeInTheDocument()
    expect(screen.getByLabelText('Share options')).toBeInTheDocument()
  })

  it('renders the combined share menu trigger for small screens', () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    expect(screen.getByLabelText('Share options')).toBeInTheDocument()
  })

  it('opens the share dropdown when the combined trigger is clicked', async () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    const menuBtn = screen.getByLabelText('Share options')

    await act(async () => {
      fireEvent.click(menuBtn)
    })

    expect(screen.getByRole('menu')).toBeInTheDocument()
    // Items are queried by text since Link mock strips role prop
    const dropdown = screen.getByRole('menu')
    expect(dropdown).toHaveTextContent('Download')
    expect(dropdown).toHaveTextContent('Share link')
  })

  it('copies the link and closes dropdown after "Share link" is clicked', async () => {
    render(<FeaturedPoemCard poem={mockPoem} />)
    const menuBtn = screen.getByLabelText('Share options')

    await act(async () => { fireEvent.click(menuBtn) })

    const shareLinkBtn = screen.getByRole('menuitem', { name: /Share link/ })
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
})
