import { render, screen, fireEvent, act } from '@testing-library/react'
import PoemCard from '../components/PoemCard'
import '@testing-library/jest-dom'

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>;
  }
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

// Mock the interactions actions
jest.mock('@/app/actions/interactions', () => ({
  toggleLike: jest.fn()
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe('PoemCard', () => {
  const mockPoem = {
    id: 'poem1',
    title: 'Hope is the thing with feathers',
    excerpt: 'Hope is the thing with feathers\nThat perches in the soul',
    fullText: 'Hope is the thing with feathers\nThat perches in the soul,\nAnd sings the tune without the words,\nAnd never stops at all,',
    tags: [{name: 'classic'}, {name: 'nature'}],
    featured: true,
    authorId: 'author1',
    createdAt: new Date('1891-01-01T00:00:00.000Z').toISOString(),
    author: {
      name: 'Emily Dickinson',
      image: 'bg-emerald'
    },
    _count: {
      likes: 42
    }
  };

  const manyTagsPoem = {
    ...mockPoem,
    id: 'poem-many-tags',
    tags: [
      { name: 'classic' },
      { name: 'nature' },
      { name: 'love' },
      { name: 'philosophy' },
      { name: 'grief' },
    ],
  };

  const longTagPoem = {
    ...mockPoem,
    id: 'poem-long-tag',
    tags: [{ name: 'averylongtagthatexceedseighteencharacters' }],
  };

  it('renders the poem title and excerpt correctly', () => {
    render(<PoemCard poem={mockPoem} />)
    
    expect(screen.getByText('Hope is the thing with feathers')).toBeInTheDocument()
    expect(screen.getByText(/That perches in the soul/)).toBeInTheDocument()
  })

  it('renders the author name and metadata', () => {
    render(<PoemCard poem={mockPoem} />)
    expect(screen.getByText('Emily Dickinson')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument() // Like count
  })

  it('does not render the author name and avatar when hideAuthor is true', () => {
    render(<PoemCard poem={mockPoem} hideAuthor={true} />)
    expect(screen.queryByText('Emily Dickinson')).not.toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders featured badge if poem is featured', () => {
    render(<PoemCard poem={mockPoem} />)
    expect(screen.getByText('featured')).toBeInTheDocument()
  })

  it('displays read time using "m" abbreviation (not "min")', () => {
    render(<PoemCard poem={mockPoem} />)
    // Should contain "m read" but not "min read"
    const readTimeEls = screen.getAllByText(/m read/)
    expect(readTimeEls.length).toBeGreaterThan(0)
    readTimeEls.forEach(el => {
      expect(el.textContent).not.toMatch(/min read/)
    })
  })

  it('renders the share options and repost buttons', () => {
    render(<PoemCard poem={mockPoem} />)
    expect(screen.getByLabelText('Repost')).toBeInTheDocument()
    expect(screen.getByLabelText('Share options')).toBeInTheDocument()
  })

  it('opens the share dropdown when the combined share menu trigger is clicked', async () => {
    render(<PoemCard poem={mockPoem} />)
    const menuBtn = screen.getByLabelText('Share options')
    
    await act(async () => {
      fireEvent.click(menuBtn)
    })

    expect(screen.getByRole('menu')).toBeInTheDocument()
    const dropdown = screen.getByRole('menu')
    expect(dropdown).toHaveTextContent('Download')
    expect(dropdown).toHaveTextContent('Copy link')
    expect(dropdown).toHaveTextContent('Others')
  })

  it('closes the share dropdown after selecting "Copy link"', async () => {
    render(<PoemCard poem={mockPoem} />)
    const menuBtn = screen.getByLabelText('Share options')

    await act(async () => {
      fireEvent.click(menuBtn)
    })

    // Find the "Copy link" button within the dropdown (role="menuitem" on button)
    const shareLinkBtn = screen.getByRole('menuitem', { name: /Copy link/ })
    await act(async () => {
      fireEvent.click(shareLinkBtn)
    })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining(`/poem/${mockPoem.id}`)
    )
  })

  it('shows at most 3 tags and a +N badge for extra tags', () => {
    render(<PoemCard poem={manyTagsPoem} />)
    // Only first 3 tags visible as links
    expect(screen.getByText(/#classic/)).toBeInTheDocument()
    expect(screen.getByText(/#nature/)).toBeInTheDocument()
    expect(screen.getByText(/#love/)).toBeInTheDocument()
    // 4th and 5th tags should not be rendered as links
    expect(screen.queryByText(/#philosophy/)).not.toBeInTheDocument()
    expect(screen.queryByText(/#grief/)).not.toBeInTheDocument()
    // +2 overflow badge should appear
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('truncates a long tag name at 18 chars with ellipsis', () => {
    render(<PoemCard poem={longTagPoem} />)
    // Tag text should be truncated to 18 chars + ellipsis character
    expect(screen.getByText('#averylongtagthatex…')).toBeInTheDocument()
  })

  it('applies poem-card__title--clamp class to the title heading', () => {
    render(<PoemCard poem={mockPoem} />)
    const heading = screen.getByRole('heading', { name: /Hope is the thing with feathers/ })
    expect(heading).toHaveClass('poem-card__title--clamp')
  })
})
