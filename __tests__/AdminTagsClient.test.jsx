import { render, screen, fireEvent, act } from '@testing-library/react'
import AdminTagsClient from '../components/AdminTagsClient'
import '@testing-library/jest-dom'
import { renameTagAdmin, deleteTagAdmin } from '@/app/actions/admin'

jest.mock('@/app/actions/admin', () => ({
  renameTagAdmin: jest.fn(),
  deleteTagAdmin: jest.fn()
}))

describe('AdminTagsClient Component', () => {
  const mockTags = [
    { id: 'tag-1', name: 'poetry', _count: { poems: 5 } },
    { id: 'tag-2', name: 'love', _count: { poems: 12 } }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
    window.prompt = jest.fn(() => 'new-name')
    window.alert = jest.fn()
  })

  it('renders a list of tags', () => {
    render(<AdminTagsClient initialTags={mockTags} currentUserRole="ADMIN" />)
    expect(screen.getByText('#poetry')).toBeInTheDocument()
    expect(screen.getByText('5 poems')).toBeInTheDocument()
    expect(screen.getByText('#love')).toBeInTheDocument()
    expect(screen.getByText('12 poems')).toBeInTheDocument()
  })

  it('filters tags by search term', () => {
    render(<AdminTagsClient initialTags={mockTags} currentUserRole="ADMIN" />)
    const searchInput = screen.getByPlaceholderText('Search tags...')
    
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'love' } })
    })

    expect(screen.getByText('#love')).toBeInTheDocument()
    expect(screen.queryByText('#poetry')).not.toBeInTheDocument()
  })

  it('calls renameTagAdmin when rename is clicked', async () => {
    renameTagAdmin.mockResolvedValue({ success: true })
    render(<AdminTagsClient initialTags={mockTags} currentUserRole="ADMIN" />)
    
    const renameButtons = screen.getAllByText('Rename')
    await act(async () => {
      fireEvent.click(renameButtons[0]) // poetry
    })

    expect(window.prompt).toHaveBeenCalledWith('Enter new name for tag:', 'poetry')
    expect(renameTagAdmin).toHaveBeenCalledWith('tag-1', 'new-name')
  })

  it('calls deleteTagAdmin when delete is clicked', async () => {
    deleteTagAdmin.mockResolvedValue({ success: true })
    render(<AdminTagsClient initialTags={mockTags} currentUserRole="ADMIN" />)
    
    const deleteButtons = screen.getAllByText('Delete')
    await act(async () => {
      fireEvent.click(deleteButtons[0]) // poetry
    })

    expect(window.confirm).toHaveBeenCalled()
    expect(deleteTagAdmin).toHaveBeenCalledWith('tag-1')
  })
})
