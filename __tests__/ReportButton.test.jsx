import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import ReportButton from "../components/ReportButton"
import { useSession } from "next-auth/react"
import { submitReport } from "@/app/actions/reports"

// Mock NextAuth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn()
}))

// Mock Server Actions
jest.mock("@/app/actions/reports", () => ({
  submitReport: jest.fn()
}))

describe("ReportButton", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSession.mockReturnValue({
      data: { user: { id: "user1", name: "Test User" } },
      status: "authenticated"
    })
  })

  it("renders nothing if user is not authenticated", () => {
    useSession.mockReturnValue({ data: null, status: "unauthenticated" })
    const { container } = render(<ReportButton type="POEM" targetId="123" />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders the report button for authenticated users", () => {
    render(<ReportButton type="POEM" targetId="123" />)
    expect(screen.getByRole("button", { name: /report/i })).toBeInTheDocument()
  })

  it("opens the modal and submits a valid report", async () => {
    submitReport.mockResolvedValue({ success: true })
    
    render(<ReportButton type="POEM" targetId="123" />)
    
    // Open modal
    fireEvent.click(screen.getByRole("button", { name: /report/i }))
    expect(screen.getByText("Report Poem")).toBeInTheDocument()

    // Try submitting with invalid reason
    fireEvent.change(screen.getByPlaceholderText(/details/i), { target: { value: "bad" } })
    fireEvent.click(screen.getByRole("button", { name: /submit report/i }))
    
    expect(screen.getByText(/valid reason/i)).toBeInTheDocument()
    expect(submitReport).not.toHaveBeenCalled()

    // Submit with valid reason
    fireEvent.change(screen.getByPlaceholderText(/details/i), { target: { value: "This poem is highly inappropriate." } })
    fireEvent.click(screen.getByRole("button", { name: /submit report/i }))

    await waitFor(() => {
      expect(submitReport).toHaveBeenCalledWith({
        type: "POEM",
        targetId: "123",
        reason: "This poem is highly inappropriate."
      })
    })

    // Check success state
    expect(await screen.findByText(/Report Submitted/i)).toBeInTheDocument()
  })
})
