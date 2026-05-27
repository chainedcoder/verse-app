import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthorCard from '../components/AuthorCard'
import { toggleFollow } from '@/app/actions/interactions'

// Mock the server action
jest.mock('@/app/actions/interactions', () => ({
  toggleFollow: jest.fn()
}))

// Mock Avatar to isolate AuthorCard testing
jest.mock('../components/Avatar', () => {
  return function MockAvatar({ name }) {
    return <div data-testid="avatar">{name}</div>
  }
})

describe('AuthorCard Component', () => {
  const mockAuthor = {
    id: 'author-123',
    name: 'Emily Dickinson',
    bio: 'A reclusive poet.',
    poems: 10,
    readers: 50,
    image: 'avatar-purple'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders author information correctly', () => {
    render(<AuthorCard author={mockAuthor} />)
    expect(screen.getAllByText('Emily Dickinson')[0]).toBeInTheDocument()
    expect(screen.getByText('A reclusive poet.')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('shows Follow button when not following', () => {
    render(<AuthorCard author={mockAuthor} initialFollowing={false} />)
    expect(screen.getByRole('button', { name: /follow author/i })).toBeInTheDocument()
  })

  it('shows Following button when already following', () => {
    render(<AuthorCard author={mockAuthor} initialFollowing={true} />)
    expect(screen.getByRole('button', { name: /following/i })).toBeInTheDocument()
  })

  it('calls toggleFollow when follow button is clicked', async () => {
    render(<AuthorCard author={mockAuthor} initialFollowing={false} />)
    
    const followBtn = screen.getByRole('button', { name: /follow author/i })
    fireEvent.click(followBtn)

    // Verify optimistic UI update
    expect(screen.getByRole('button', { name: /following/i })).toBeInTheDocument()
    
    // Verify server action call
    await waitFor(() => {
      expect(toggleFollow).toHaveBeenCalledWith('author-123')
    })
  })
})
