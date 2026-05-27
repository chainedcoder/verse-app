const mockRevokeSession = jest.fn()

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn()
  })
}))

jest.mock('@/app/actions/sessions', () => ({
  revokeSession: (...args) => mockRevokeSession(...args)
}))

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SessionsClient from '../components/SessionsClient'
import '@testing-library/jest-dom'

jest.mock('react', () => {
  const actualReact = jest.requireActual('react')
  return {
    ...actualReact,
    useTransition: () => [false, (cb) => cb()],
  }
})

describe('SessionsClient', () => {
  const mockSessions = [
    {
      id: 'session-1',
      sessionToken: 'token-1',
      createdAt: new Date('2023-01-01T10:00:00Z'),
      expires: new Date('2023-02-01T10:00:00Z')
    },
    {
      id: 'session-2',
      sessionToken: 'token-2',
      createdAt: new Date('2023-01-05T12:00:00Z'),
      expires: new Date('2023-02-05T12:00:00Z')
    }
  ]

  beforeEach(() => {
    mockRevokeSession.mockReset()
  })

  it('renders all sessions and marks the current one', () => {
    render(<SessionsClient sessions={mockSessions} currentSessionToken="token-1" />)
    
    expect(screen.getByText('Current')).toBeInTheDocument()
    // One session is current, so only one Revoke button should exist
    const revokeButtons = screen.getAllByRole('button', { name: /revoke/i })
    expect(revokeButtons).toHaveLength(1)
  })

  it('calls revokeSession when revoke button is clicked', async () => {
    mockRevokeSession.mockResolvedValueOnce({ success: true })
    
    render(<SessionsClient sessions={mockSessions} currentSessionToken="token-1" />)
    
    fireEvent.click(screen.getByRole('button', { name: /revoke/i }))
    
    await waitFor(() => {
      expect(mockRevokeSession).toHaveBeenCalledWith('session-2')
    })
  })
})
