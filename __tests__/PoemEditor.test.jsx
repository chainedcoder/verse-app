import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PoemEditor from '../components/PoemEditor'
import '@testing-library/jest-dom'

// Mock the server action
const mockCreatePoem = jest.fn()
jest.mock('@/app/actions/poems', () => ({
  createPoem: (...args) => mockCreatePoem(...args)
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
  })

  it('renders all form fields', () => {
    render(<PoemEditor />)
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText(/Excerpt/)).toBeInTheDocument()
    expect(screen.getByLabelText('Body')).toBeInTheDocument()
    expect(screen.getByLabelText(/Tags/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument()
  })

  it('displays error if action returns one', async () => {
    mockCreatePoem.mockResolvedValueOnce({ error: 'Title and body are required.' })
    
    render(<PoemEditor />)
    
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText('Body'), { target: { value: 'Test body' } })
    
    fireEvent.click(screen.getByRole('button', { name: /publish/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Title and body are required.')).toBeInTheDocument()
    })
  })

  it('submits form data to the server action', async () => {
    mockCreatePoem.mockResolvedValueOnce({})
    
    render(<PoemEditor />)
    
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'A New Poem' } })
    fireEvent.change(screen.getByLabelText('Body'), { target: { value: 'This is the body of the poem.' } })
    
    fireEvent.click(screen.getByRole('button', { name: /publish/i }))
    
    await waitFor(() => {
      expect(mockCreatePoem).toHaveBeenCalledTimes(1)
    })
    
    // Check if FormData has the correct values
    const submittedFormData = mockCreatePoem.mock.calls[0][0]
    expect(submittedFormData.get('title')).toBe('A New Poem')
    expect(submittedFormData.get('fullText')).toBe('This is the body of the poem.')
  })
})
