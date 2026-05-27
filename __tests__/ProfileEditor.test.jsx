import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfileEditor from '../components/ProfileEditor'
import '@testing-library/jest-dom'

const mockUpdateProfile = jest.fn()

jest.mock('@/app/actions/profile', () => ({
  updateProfile: (...args) => mockUpdateProfile(...args)
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn()
  })
}))

jest.mock('react', () => {
  const actualReact = jest.requireActual('react')
  return {
    ...actualReact,
    useTransition: () => [false, (cb) => cb()],
  }
})

describe('ProfileEditor', () => {
  const mockUser = {
    id: 'user1',
    name: 'Emily Dickinson',
    username: 'emilyd',
    website: 'https://emilydickinson.com',
    bio: 'I am nobody! Who are you?',
    location: 'Amherst, MA',
    image: null
  }

  beforeEach(() => {
    mockUpdateProfile.mockReset()
    // Mock URL.createObjectURL for the image preview feature
    global.URL.createObjectURL = jest.fn(() => 'mock-url')
  })

  it('renders initial user data', () => {
    render(<ProfileEditor user={mockUser} />)
    
    expect(screen.getByLabelText('Display Name')).toHaveValue('Emily Dickinson')
    expect(screen.getByLabelText('Username')).toHaveValue('emilyd')
    expect(screen.getByLabelText('Website')).toHaveValue('https://emilydickinson.com')
    expect(screen.getByLabelText('Location')).toHaveValue('Amherst, MA')
    expect(screen.getByLabelText('Bio')).toHaveValue('I am nobody! Who are you?')
  })

  it('submits updated profile data', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true })
    
    render(<ProfileEditor user={mockUser} />)
    
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Emily D.' } })
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'emily_new' } })
    fireEvent.change(screen.getByLabelText('Website'), { target: { value: 'https://newsite.com' } })
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Boston, MA' } })
    
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }))
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1)
    })
    
    const submittedData = mockUpdateProfile.mock.calls[0][0]
    expect(submittedData.get('name')).toBe('Emily D.')
    expect(submittedData.get('username')).toBe('emily_new')
    expect(submittedData.get('website')).toBe('https://newsite.com')
    expect(submittedData.get('location')).toBe('Boston, MA')
  })

  it('displays success message on successful update', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true })
    
    render(<ProfileEditor user={mockUser} />)
    
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument()
    })
  })

  it('displays error message if update fails', async () => {
    mockUpdateProfile.mockResolvedValue({ error: 'Server error occurred' })
    
    render(<ProfileEditor user={mockUser} />)
    
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Server error occurred/i)).toBeInTheDocument()
    })
  })

  it('validates file size before uploading', async () => {
    render(<ProfileEditor user={mockUser} />)
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    // Mock the size to be 6MB
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })
    
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText(/Image size must be less than 5MB/i)).toBeInTheDocument()
    })
  })
})
