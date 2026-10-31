import { render, screen, fireEvent, act } from '@testing-library/react'
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
  default: ({ alt, ...props }) => <img alt={alt} {...props} />
}))

jest.mock('html-to-image', () => ({
  toJpeg: jest.fn(() => Promise.resolve('data:image/jpeg;base64,mock')),
  toSvg: jest.fn(() => Promise.resolve('data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C%2Fsvg%3E')),
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

  it.each([
    ['JPEG', 'image/jpeg', '.jpg'],
    ['SVG', 'image/svg+xml', '.svg'],
  ])('downloads %s through a blob URL so iOS Safari saves it', async (label, mimeType, ext) => {
    global.URL.createObjectURL = jest.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = jest.fn()
    await act(async () => {
      render(<ExportPageClient poem={mockPoem} author={mockPoem.author} />)
    })

    let clicked
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      clicked = { href: this.href, download: this.download }
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${label}$`, 'i') }))
    })

    const blob = URL.createObjectURL.mock.calls[0][0]
    expect(blob.type).toBe(mimeType)
    expect(clicked.href).toBe('blob:mock')
    expect(clicked.download).toMatch(new RegExp(`^verse-p1-.+\\${ext}$`))
    clickSpy.mockRestore()
  })
})
