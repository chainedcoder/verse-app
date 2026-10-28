import { render, screen, fireEvent, act } from '@testing-library/react'
import ExportModal from '../components/ExportModal'
import '@testing-library/jest-dom'

// Mock the theme library used inside ExportModal
jest.mock('@/lib/theme', () => ({
  getTheme: jest.fn(() => 'light'),
  getAccent: jest.fn(() => 'indigo'),
}))

// Mock html-to-image
jest.mock('html-to-image', () => ({
  toJpeg: jest.fn(() => Promise.resolve('data:image/jpeg;base64,mock')),
  toSvg: jest.fn(() => Promise.resolve('data:image/svg+xml;base64,mock')),
}))

// Mock jspdf
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      addImage: jest.fn(),
      save: jest.fn(),
    })),
  }
})

// Mock URL APIs used in download
global.URL.createObjectURL = jest.fn(() => 'blob:mock')
global.URL.revokeObjectURL = jest.fn()

const mockPoem = {
  id: 'p1',
  title: 'Ode to Autumn',
  fullText: 'Season of mists and mellow fruitfulness\nClose bosom-friend of the maturing sun',
  excerpt: 'Season of mists...',
}

const mockAuthor = {
  name: 'John Keats',
}

describe('ExportModal', () => {
  const defaultProps = {
    poem: mockPoem,
    author: mockAuthor,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the modal with the poem title in the header', () => {
    render(<ExportModal {...defaultProps} />)
    expect(screen.getByText('Download poem')).toBeInTheDocument()
    expect(screen.getByText('Choose a style and size to export')).toBeInTheDocument()
  })

  it('renders all 10 template cards', () => {
    render(<ExportModal {...defaultProps} />)
    expect(screen.getByText('Site view')).toBeInTheDocument()
    expect(screen.getByText('Minimal')).toBeInTheDocument()
    expect(screen.getByText('Dark cinematic')).toBeInTheDocument()
    expect(screen.getByText('Love letter')).toBeInTheDocument()
    expect(screen.getByText('Story format')).toBeInTheDocument()
    expect(screen.getByText('Botanical press')).toBeInTheDocument()
    expect(screen.getByText('Celestial')).toBeInTheDocument()
    for (const title of ['Solstice', 'Tidal', 'Editorial']) expect(screen.getByText(title)).toBeInTheDocument()
  })

  it('renders Preview and format buttons', () => {
    render(<ExportModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /JPEG/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /SVG/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /PDF/i })).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    render(<ExportModal {...defaultProps} />)
    const closeBtn = screen.getByLabelText('Close export modal')

    await act(async () => {
      fireEvent.click(closeBtn)
    })

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking the overlay backdrop', async () => {
    render(<ExportModal {...defaultProps} />)
    const overlay = screen.getByTestId('export-modal')

    await act(async () => {
      fireEvent.click(overlay)
    })

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', async () => {
    render(<ExportModal {...defaultProps} />)

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('switches selected template when another template card is clicked', async () => {
    render(<ExportModal {...defaultProps} />)

    // Find and click the Minimal template card
    const minimalBtn = screen.getByText('Minimal').closest('[role="button"]')
    expect(minimalBtn).toHaveAttribute('aria-pressed', 'false')

    await act(async () => {
      fireEvent.click(minimalBtn)
    })

    expect(minimalBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('has dialog role and aria-modal attribute', () => {
    render(<ExportModal {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('shows preview image when Preview button is clicked', async () => {
    render(<ExportModal {...defaultProps} />)
    const previewBtn = screen.getByRole('button', { name: /Preview/i })

    await act(async () => {
      fireEvent.click(previewBtn)
    })

    // Preview image should appear
    const img = await screen.findByAltText('Poem preview')
    expect(img).toBeInTheDocument()
    expect(img.src).toContain('data:image/jpeg')
  })

  it.each([
    ['JPEG', 'image/jpeg', 'verse-p1-siteview.jpg'],
    ['SVG', 'image/svg+xml', 'verse-p1-siteview.svg'],
  ])('downloads %s through a blob URL so iOS Safari saves it', async (label, mimeType, fileName) => {
    render(<ExportModal {...defaultProps} />)
    URL.createObjectURL.mockClear()

    let clicked
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      clicked = { href: this.href, download: this.download }
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${label}$`, 'i') }))
    })

    const blob = URL.createObjectURL.mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe(mimeType)
    expect(clicked).toEqual({ href: 'blob:mock', download: fileName })
    clickSpy.mockRestore()
  })
})
