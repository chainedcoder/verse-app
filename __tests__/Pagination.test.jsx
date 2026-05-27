import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '../components/Pagination'
import '@testing-library/jest-dom'

describe('Pagination Component', () => {
  it('does not render if totalPages is 1 or less', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders correctly with multiple pages', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />)
    expect(screen.getByText(/Page 2 of 5/i)).toBeInTheDocument()
    expect(screen.getByText(/Prev/i)).toBeInTheDocument()
    expect(screen.getByText(/Next/i)).toBeInTheDocument()
  })

  it('disables Prev button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: /Prev/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled()
  })

  it('disables Next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: /Prev/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled()
  })

  it('calls onPageChange with correct page numbers when buttons are clicked', () => {
    const onPageChangeMock = jest.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChangeMock} />)
    
    fireEvent.click(screen.getByRole('button', { name: /Prev/i }))
    expect(onPageChangeMock).toHaveBeenCalledWith(2)

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    expect(onPageChangeMock).toHaveBeenCalledWith(4)
  })
})
