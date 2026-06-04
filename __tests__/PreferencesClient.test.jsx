const mockUpdatePreferences = jest.fn()

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn()
  })
}))

jest.mock('@/app/actions/profile', () => ({
  updatePreferences: (...args) => mockUpdatePreferences(...args)
}))

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PreferencesClient from '../components/PreferencesClient'
import '@testing-library/jest-dom'

jest.mock('react', () => {
  const actualReact = jest.requireActual('react')
  return {
    ...actualReact,
    useTransition: () => [false, (cb) => cb()],
  }
})

describe('PreferencesClient', () => {
  const mockUser = {
    theme: 'dark',
    immersiveMode: true,
    exportPreferences: {
      watermark: 'bottom-left',
      margin: 30
    }
  }

  beforeEach(() => {
    mockUpdatePreferences.mockReset()
  })

  it('renders initial user preferences', () => {
    render(<PreferencesClient user={mockUser} />)
    
    const darkRadio = screen.getByLabelText('dark')
    expect(darkRadio).toBeChecked()

    const immersiveCheckbox = screen.getByLabelText(/Immersive Mode/i)
    expect(immersiveCheckbox).toBeChecked()

    expect(screen.getByLabelText(/Bottom Left/i)).toBeChecked()
    expect(document.querySelector('input[name="exportMargin"]')).toHaveValue(30)
  })

  it('submits updated preferences', async () => {
    mockUpdatePreferences.mockResolvedValueOnce({ success: true })
    
    render(<PreferencesClient user={mockUser} />)
    
    fireEvent.click(screen.getByLabelText('light'))
    fireEvent.click(screen.getByLabelText(/Immersive Mode/i)) // uncheck
    fireEvent.click(screen.getByLabelText(/none/i))
    const marginInput = document.querySelector('input[name="exportMargin"]')
    fireEvent.change(marginInput, { target: { value: 10 } })
    
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }))
    
    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledTimes(1)
    })
    
    const submittedData = mockUpdatePreferences.mock.calls[0][0]
    expect(submittedData.get('theme')).toBe('light')
    expect(submittedData.get('immersiveMode')).toBe('false')
    expect(submittedData.get('exportWatermark')).toBe('none')
    expect(submittedData.get('exportMargin')).toBe('10')
  })
})
