import { render, screen, fireEvent } from '@testing-library/react'
import PoemImageCarousel from '../components/PoemImageCarousel'
import '@testing-library/jest-dom'

describe('PoemImageCarousel', () => {
  const images = [
    { id: 1, url: '/img1.jpg', alt: 'Image 1' },
    { id: 2, url: '/img2.jpg', alt: 'Image 2' },
    { id: 3, url: '/img3.jpg', alt: 'Image 3' }
  ]

  it('renders null if no images are provided', () => {
    const { container } = render(<PoemImageCarousel images={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all images in the carousel', () => {
    render(<PoemImageCarousel images={images} />)
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(3)
    expect(imgs[0]).toHaveAttribute('src', '/img1.jpg')
    expect(imgs[1]).toHaveAttribute('src', '/img2.jpg')
  })

  it('renders pagination dots for multiple images', () => {
    render(<PoemImageCarousel images={images} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0]).toHaveAttribute('aria-label', 'Go to slide 1')
  })

  it('does not render pagination dots for a single image', () => {
    render(<PoemImageCarousel images={[{ id: 1, url: '/img1.jpg', alt: 'Image 1' }]} />)
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })
})
