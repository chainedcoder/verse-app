import { render, screen } from '@testing-library/react'
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

describe('PoemCard', () => {
  const mockPoem = {
    id: 'poem1',
    title: 'Hope is the thing with feathers',
    excerpt: 'Hope is the thing with feathers\nThat perches in the soul',
    fullText: 'Hope is the thing with feathers\nThat perches in the soul,\nAnd sings the tune without the words,\nAnd never stops at all,',
    tags: 'classic,nature',
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

  it('renders the poem title and excerpt correctly', () => {
    render(<PoemCard poem={mockPoem} />)
    
    expect(screen.getByText('Hope is the thing with feathers')).toBeInTheDocument()
    expect(screen.getByText(/That perches in the soul/)).toBeInTheDocument()
  })

  it('renders the author name and metadata', () => {
    render(<PoemCard poem={mockPoem} />)
    
    expect(screen.getByText('Emily Dickinson')).toBeInTheDocument()
    expect(screen.getByText(/1891/)).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument() // Like count
  })

  it('renders featured badge if poem is featured', () => {
    render(<PoemCard poem={mockPoem} />)
    expect(screen.getByText('featured')).toBeInTheDocument()
  })
})
