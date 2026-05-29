import { render, screen, fireEvent } from '@testing-library/react'
import Offline from '@/app/offline/page'

describe('Offline Page', () => {
  it('renders the offline message', () => {
    render(<Offline />)
    expect(screen.getByText("You're offline")).toBeInTheDocument()
    expect(screen.getByText("It looks like you've lost your connection. Check your network and try again.")).toBeInTheDocument()
  })

  it('renders the retry button', () => {
    render(<Offline />)
    const button = screen.getByRole('button', { name: /retry/i })
    expect(button).toBeInTheDocument()
  })
})
