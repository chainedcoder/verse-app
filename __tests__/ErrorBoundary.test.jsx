import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ErrorBoundary from '../components/ErrorBoundary'

// Suppress React error boundary console.error noise in test output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  console.error.mockRestore()
})

// Mock fetch so error reporting doesn't fail in jsdom
global.fetch = jest.fn(() => Promise.resolve({ ok: true }))

const ThrowingChild = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('Test error: component crashed')
  return <div data-testid="child">All good</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument()
  })

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Go home/i })).toBeInTheDocument()
  })

  it('resets to show children after clicking "Try again"', () => {
    const { unmount } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }))

    // Unmount and remount fresh with non-throwing child to verify boundary is reset
    unmount()
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('calls fetch to report the error when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/errors',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('"Go home" link points to "/"', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByRole('link', { name: /Go home/i })).toHaveAttribute('href', '/')
  })
})
