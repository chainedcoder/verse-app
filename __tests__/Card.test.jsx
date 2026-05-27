import React from 'react'
import { render, screen } from '@testing-library/react'
import Card from '../components/Card'

// Mock the CSS module so styles resolve correctly
jest.mock('../components/Card.module.css', () => ({
  'card': 'card',
  'card-clickable': 'card-clickable',
  'card-compact': 'card-compact',
  'poem-card--mine': 'poem-card--mine'
}))

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card>Test Content</Card>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies default card class', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.firstChild).toHaveClass('card')
  })

  it('applies clickable class when clickable prop is true', () => {
    const { container } = render(<Card clickable>Content</Card>)
    expect(container.firstChild).toHaveClass('card-clickable')
  })

  it('applies compact class when compact prop is true', () => {
    const { container } = render(<Card compact>Content</Card>)
    expect(container.firstChild).toHaveClass('card-compact')
  })

  it('applies isMine class when isMine prop is true', () => {
    const { container } = render(<Card isMine>Content</Card>)
    expect(container.firstChild).toHaveClass('poem-card--mine')
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders as a custom element type', () => {
    const { container } = render(<Card as="article">Content</Card>)
    expect(container.querySelector('article')).toBeInTheDocument()
  })
})
