import { render, screen, fireEvent, act } from '@testing-library/react'
import AdminContentClient from '../components/AdminContentClient'
import '@testing-library/jest-dom'
import { togglePoemFeatured, deletePoemAdmin } from '@/app/actions/admin'

jest.mock('@/app/actions/admin', () => ({
  togglePoemFeatured: jest.fn(),
  deletePoemAdmin: jest.fn()
}))

jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

describe('AdminContentClient', () => {
  const mockPoems = [
    {
      id: 'poem-1',
      title: 'First Poem',
      excerpt: 'This is the first excerpt.',
      status: 'PUBLISHED',
      featured: false,
      author: { id: 'author-1', name: 'Author One', image: null }
    },
    {
      id: 'poem-2',
      title: 'Second Poem',
      excerpt: 'This is the second excerpt.',
      status: 'PUBLISHED',
      featured: true,
      author: { id: 'author-2', name: 'Author Two', image: null }
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
    window.alert = jest.fn()
  })

  it('renders poems list', () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    expect(screen.getByText('First Poem')).toBeInTheDocument()
    expect(screen.getByText('Second Poem')).toBeInTheDocument()
  })

  it('filters poems by search term', () => {
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    const searchInput = screen.getByPlaceholderText('Search poems by title or excerpt...')
    
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'First' } })
    })

    expect(screen.getByText('First Poem')).toBeInTheDocument()
    expect(screen.queryByText('Second Poem')).not.toBeInTheDocument()
  })

  it('calls togglePoemFeatured when Feature button is clicked', async () => {
    togglePoemFeatured.mockResolvedValue({ success: true })
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    
    const featureButtons = screen.getAllByText('Feature')
    await act(async () => {
      fireEvent.click(featureButtons[0])
    })

    expect(togglePoemFeatured).toHaveBeenCalledWith('poem-1', true)
  })

  it('calls deletePoemAdmin when Delete button is clicked', async () => {
    deletePoemAdmin.mockResolvedValue({ success: true })
    render(<AdminContentClient initialPoems={mockPoems} currentUserRole="ADMIN" />)
    
    const deleteButtons = screen.getAllByText('Delete')
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })

    expect(deletePoemAdmin).toHaveBeenCalledWith('poem-1')
  })
})
