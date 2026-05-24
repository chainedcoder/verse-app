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

// Mock the data library
jest.mock('@/lib/data', () => ({
  getAuthor: jest.fn(() => ({
    id: 'author1',
    name: 'Emily Dickinson',
    initials: 'ED',
    avatarClass: 'bg-emerald'
  })),
  isLiked: jest.fn(() => false),
  getLikeCount: jest.fn(() => 42),
  toggleLike: jest.fn()
}));

describe('PoemCard', () => {
  const mockPoem = {
    id: 'poem1',
    title: 'Hope is the thing with feathers',
    excerpt: 'Hope is the thing with feathers\nThat perches in the soul',
    fullText: 'Hope is the thing with feathers\nThat perches in the soul,\nAnd sings the tune without the words,\nAnd never stops at all,',
    tags: ['classic', 'nature'],
    featured: true,
    authorId: 'author1',
    date: '1891'
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
