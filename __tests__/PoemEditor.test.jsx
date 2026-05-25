import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PoemEditor from '../components/PoemEditor'
import '@testing-library/jest-dom'

// Mock the server actions
const mockCreatePoem = jest.fn()
const mockUpdatePoem = jest.fn()
const mockDeletePoem = jest.fn()

jest.mock('@/app/actions/poems', () => ({
  createPoem: (...args) => mockCreatePoem(...args),
  updatePoem: (...args) => mockUpdatePoem(...args),
  deletePoem: (...args) => mockDeletePoem(...args)
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn()
  })
}))

// React 19 useTransition mock
jest.mock('react', () => {
  const actualReact = jest.requireActual('react')
  return {
    ...actualReact,
    useTransition: () => [false, (cb) => cb()],
  }
})

describe('PoemEditor', () => {
  beforeEach(() => {
    mockCreatePoem.mockClear()
    mockUpdatePoem.mockClear()
    mockDeletePoem.mockClear()
    window.confirm = jest.fn(() => true) // mock confirm dialog
  })

  it('renders all form fields in create mode', () => {
    render(<PoemEditor />)
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText(/Excerpt/)).toBeInTheDocument()
    expect(screen.getByLabelText('Body')).toBeInTheDocument()
    expect(screen.getByLabelText(/Tags/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('renders all fields with initial values in edit mode', () => {
    const mockPoem = {
      id: '123',
      title: 'Existing Title',
      fullText: 'Existing Body',
      isPrivate: true,
      tags: [{ name: 'nature' }, { name: 'love' }]
    }
    render(<PoemEditor initialPoem={mockPoem} />)
    
    expect(screen.getByLabelText('Title')).toHaveValue('Existing Title')
    expect(screen.getByLabelText('Body')).toHaveValue('Existing Body')
    expect(screen.getByLabelText(/Tags/)).toHaveValue('nature, love')
    expect(screen.getByLabelText(/Keep Private/i)).toBeChecked()
    
    expect(screen.getByRole('button', { name: /update poem/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('submits form data to the server action in create mode', async () => {
    mockCreatePoem.mockResolvedValueOnce({})
    
    render(<PoemEditor />)
    
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'A New Poem' } })
    fireEvent.change(screen.getByLabelText('Body'), { target: { value: 'This is the body of the poem.' } })
    
    // Simulate clicking Publish
    const form = screen.getByLabelText('Title').closest('form')
    fireEvent.submit(form, { nativeEvent: { submitter: { name: 'publish' } } })
    
    await waitFor(() => {
      expect(mockCreatePoem).toHaveBeenCalledTimes(1)
    })
    
    const submittedFormData = mockCreatePoem.mock.calls[0][0]
    expect(submittedFormData.get('title')).toBe('A New Poem')
    expect(submittedFormData.get('status')).toBe('PUBLISHED')
  })

  it('submits update action when in edit mode', async () => {
    mockUpdatePoem.mockResolvedValueOnce({})
    const mockPoem = { id: '123', title: 'Old', fullText: 'Old body' }
    
    render(<PoemEditor initialPoem={mockPoem} />)
    
    const saveDraftBtn = screen.getByRole('button', { name: /save draft/i })
    fireEvent.click(saveDraftBtn)
    
    await waitFor(() => {
      expect(mockUpdatePoem).toHaveBeenCalledWith('123', expect.any(FormData))
    })
    
    const submittedFormData = mockUpdatePoem.mock.calls[0][1]
    expect(submittedFormData.get('status')).toBe('DRAFT')
  })

  it('calls deletePoem when delete button is clicked', async () => {
    mockDeletePoem.mockResolvedValueOnce({ success: true })
    const mockPoem = { id: '123', title: 'Old', fullText: 'Old body' }
    
    render(<PoemEditor initialPoem={mockPoem} />)
    
    // Click the delete button
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    
    await waitFor(() => {
      expect(mockDeletePoem).toHaveBeenCalledWith('123')
    })
  })
})
