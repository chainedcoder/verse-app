import { render, screen, fireEvent, act } from '@testing-library/react'
import ExportModal from '../components/ExportModal'
import '@testing-library/jest-dom'

// Mock the theme library used inside ExportModal
jest.mock('@/lib/theme', () => ({
  getTheme: jest.fn(() => 'light'),
  getAccent: jest.fn(() => 'indigo'),
}))

// Mock canvas API used in generateCanvas
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillStyle: '',
  globalAlpha: 1,
  font: '',
  textAlign: '',
  fillRect: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
}))
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock')
HTMLCanvasElement.prototype.toBlob = jest.fn((cb) => cb(new Blob(['mock'])))

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
    expect(screen.getByText('Choose a style to export as an image')).toBeInTheDocument()
  })

  it('renders all 5 template cards', () => {
    render(<ExportModal {...defaultProps} />)
    expect(screen.getByText('Site view')).toBeInTheDocument()
    expect(screen.getByText('Minimal')).toBeInTheDocument()
    expect(screen.getByText('Dark cinematic')).toBeInTheDocument()
    expect(screen.getByText('Love letter')).toBeInTheDocument()
    expect(screen.getByText('Story format')).toBeInTheDocument()
  })

  it('renders Preview and Download action buttons', () => {
    render(<ExportModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument()
    expect(screen.getByTestId('export-modal-download')).toBeInTheDocument()
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
    const img = screen.getByAltText('Poem preview')
    expect(img).toBeInTheDocument()
    expect(img.src).toContain('data:image/png')
  })

  it('triggers download (blob creation) when Download button is clicked', async () => {
    render(<ExportModal {...defaultProps} />)
    const downloadBtn = screen.getByTestId('export-modal-download')

    // Spy on document.createElement so that the <a> click does not cause errors
    const origCreateElement = document.createElement.bind(document)
    const createElSpy = jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreateElement(tag)
      if (tag === 'a') {
        jest.spyOn(el, 'click').mockImplementation(() => {})
      }
      return el
    })

    await act(async () => {
      fireEvent.click(downloadBtn)
    })

    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalled()

    createElSpy.mockRestore()
  })
})
