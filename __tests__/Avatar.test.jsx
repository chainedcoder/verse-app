import { render, screen } from '@testing-library/react'
import Avatar from '../components/Avatar'
import '@testing-library/jest-dom'

describe('Avatar Component', () => {
  it('renders standard initials when no image is provided', () => {
    render(<Avatar name="John Doe" />)
    const element = screen.getByText('JD')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('avatar')
    expect(element).toHaveClass('avatar-sm')
    expect(element).toHaveClass('avatar-warm')
  })

  it('renders correct initials when name has multiple words', () => {
    render(<Avatar name="John Fitzgerald Kennedy" />)
    expect(screen.getByText('JF')).toBeInTheDocument()
  })

  it('renders initials inside div when image is a class (e.g. avatar-rose)', () => {
    render(<Avatar name="Sofia Reyes" image="avatar-rose" />)
    const element = screen.getByText('SR')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('avatar')
    expect(element).toHaveClass('avatar-rose')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders initials inside div when image is a simple class without avatar- prefix (e.g. bg-emerald)', () => {
    render(<Avatar name="Emily Dickinson" image="bg-emerald" />)
    const element = screen.getByText('ED')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('bg-emerald')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders img element when image is a URL', () => {
    render(<Avatar name="Jane Doe" image="/uploads/jane.png" />)
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/uploads/jane.png')
    expect(img).toHaveAttribute('alt', 'Jane Doe')
    expect(img).toHaveClass('avatar')
    expect(img).toHaveClass('avatar-sm')
  })

  it('handles custom size and style', () => {
    render(<Avatar name="Test User" size="xl" style={{ marginTop: '10px' }} />)
    const element = screen.getByText('TU')
    expect(element).toHaveClass('avatar-xl')
    expect(element).toHaveStyle({ marginTop: '10px' })
  })

  it('handles string "null" or "undefined" as no image and defaults to avatar-warm', () => {
    const { rerender } = render(<Avatar name="Null User" image="null" />)
    let element = screen.getByText('NU')
    expect(element).toHaveClass('avatar-warm')
    expect(element).not.toHaveClass('null')

    rerender(<Avatar name="Undefined User" image="undefined" />)
    element = screen.getByText('UU')
    expect(element).toHaveClass('avatar-warm')
    expect(element).not.toHaveClass('undefined')
  })
})
