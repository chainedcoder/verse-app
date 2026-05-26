/**
 * WebVitals component test
 *
 * The component calls `useReportWebVitals` and posts metric payloads to /api/vitals.
 * We mock the hook to capture the callback and invoke it with a fake metric.
 */

import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock next/web-vitals before importing the component
const mockUseReportWebVitals = jest.fn()
jest.mock('next/web-vitals', () => ({
  useReportWebVitals: (cb) => mockUseReportWebVitals(cb),
}))

global.fetch = jest.fn(() => Promise.resolve({ ok: true }))

// Import after mocking
const { WebVitals } = require('../components/WebVitals')

const fakeLCP = {
  name: 'LCP',
  value: 1234.5,
  rating: 'good',
  id: 'v3-123',
  navigationType: 'navigate',
}

describe('WebVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing (null) into the DOM', () => {
    const { container } = render(<WebVitals />)
    expect(container).toBeEmptyDOMElement()
  })

  it('registers a callback with useReportWebVitals', () => {
    render(<WebVitals />)
    expect(mockUseReportWebVitals).toHaveBeenCalledTimes(1)
    expect(typeof mockUseReportWebVitals.mock.calls[0][0]).toBe('function')
  })

  it('POSTs the metric payload to /api/vitals when the callback fires', async () => {
    render(<WebVitals />)

    // Grab the registered callback and invoke it
    const callback = mockUseReportWebVitals.mock.calls[0][0]
    await callback(fakeLCP)

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/vitals',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          name: 'LCP',
          value: 1234.5,
          rating: 'good',
          id: 'v3-123',
          navigationType: 'navigate',
        }),
      })
    )
  })

  it('silently catches fetch errors without throwing', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))
    render(<WebVitals />)
    const callback = mockUseReportWebVitals.mock.calls[0][0]
    // Should not throw
    await expect(callback(fakeLCP)).resolves.toBeUndefined()
  })
})
