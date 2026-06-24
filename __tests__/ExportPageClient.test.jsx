import { render, screen, fireEvent } from '@testing-library/react'
import ExportPageClient from '../components/ExportPageClient'
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  })
}))

// We need to mock next/image for export page client
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />
}))

describe('ExportPageClient', () => {
  const mockPoem = {
    id: 'p1',
    title: 'Test Poem Title',
    excerpt: 'Excerpt text',
    fullText: 'Full poem body content',
    createdAt: '2026-05-26T22:00:00.000Z',
    author: {
      id: 'a1',
      name: 'Author Name',
    }
  }

  it('renders author toggle and updates author name dynamically', async () => {
    const { act } = require('react')
    await act(async () => {
      render(<ExportPageClient poem={mockPoem} author={mockPoem.author} />)
    })

    // Initially, "Show Author" checkbox is checked, and author name input is shown with "Author Name"
    const authorCheckbox = screen.getByLabelText(/Show Author/i)
    expect(authorCheckbox).toBeChecked()
    
    const authorInput = screen.getByPlaceholderText(/Author name/i)
    expect(authorInput).toHaveValue('Author Name')

    // Toggling off the checkbox hides the input
    await act(async () => {
      fireEvent.click(authorCheckbox)
    })
    expect(authorCheckbox).not.toBeChecked()
    expect(screen.queryByPlaceholderText(/Author name/i)).not.toBeInTheDocument()

    // Toggling back on shows it again
    await act(async () => {
      fireEvent.click(authorCheckbox)
    })
    expect(screen.getByPlaceholderText(/Author name/i)).toBeInTheDocument()
    
    // Changing the input value updates state
    const newInput = screen.getByPlaceholderText(/Author name/i)
    await act(async () => {
      fireEvent.change(newInput, { target: { value: 'New Custom Author' } })
    })
    expect(newInput).toHaveValue('New Custom Author')
  })
})
