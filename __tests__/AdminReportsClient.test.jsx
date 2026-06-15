import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import AdminReportsClient from "../components/AdminReportsClient"
import { updateReportStatus, updateUserStatus, deletePoemAdmin } from "@/app/actions/admin"

jest.mock("next/link", () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

jest.mock("@/app/actions/admin", () => ({
  updateReportStatus: jest.fn(),
  updateUserStatus: jest.fn(),
  deletePoemAdmin: jest.fn()
}))

jest.mock("../components/ToastProvider", () => ({
  useToast: () => ({ showToast: (msg) => window.alert(msg) })
}))
jest.mock("../components/ConfirmProvider", () => ({
  useConfirm: () => ({ confirm: async (msg) => window.confirm(msg) })
}))

describe("AdminReportsClient", () => {
  const mockReports = [
    {
      id: "r1",
      reason: "Inappropriate language",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      reporter: { name: "Reporter 1" },
      reportedPoemId: "p1",
      reportedPoem: { title: "Bad Poem", authorId: "u2" }
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    window.alert = jest.fn()
    window.confirm = jest.fn()
  })

  it("renders empty state when no reports", () => {
    render(<AdminReportsClient initialReports={[]} currentUserRole="ADMIN" />)
    expect(screen.getByText(/No pending reports/i)).toBeInTheDocument()
  })

  it("renders reports in the queue", () => {
    render(<AdminReportsClient initialReports={mockReports} currentUserRole="ADMIN" />)
    expect(screen.getByText("Bad Poem")).toBeInTheDocument()
    expect(screen.getByText("Inappropriate language")).toBeInTheDocument()
  })

  it("dismisses a report", async () => {
    updateReportStatus.mockResolvedValue({ success: true })
    render(<AdminReportsClient initialReports={mockReports} currentUserRole="ADMIN" />)
    
    fireEvent.click(screen.getByRole("button", { name: /Dismiss/i }))
    
    await waitFor(() => {
      expect(updateReportStatus).toHaveBeenCalledWith("r1", "DISMISSED")
    })
    
    // The report should be removed from UI
    expect(screen.queryByText("Bad Poem")).not.toBeInTheDocument()
  })

  it("bans user via quick actions", async () => {
    window.confirm.mockReturnValue(true)
    updateUserStatus.mockResolvedValue({ success: true })
    updateReportStatus.mockResolvedValue({ success: true })
    
    render(<AdminReportsClient initialReports={mockReports} currentUserRole="ADMIN" />)
    
    fireEvent.click(screen.getByRole("button", { name: /Ban User/i }))
    
    await waitFor(() => {
      expect(updateUserStatus).toHaveBeenCalledWith("u2", "BANNED")
      expect(updateReportStatus).toHaveBeenCalledWith("r1", "RESOLVED")
    })
  })

  it("deletes poem via quick actions", async () => {
    window.confirm.mockReturnValue(true)
    deletePoemAdmin.mockResolvedValue({ success: true })
    updateReportStatus.mockResolvedValue({ success: true })
    
    render(<AdminReportsClient initialReports={mockReports} currentUserRole="ADMIN" />)
    
    fireEvent.click(screen.getByRole("button", { name: /Delete Poem/i }))
    
    await waitFor(() => {
      expect(deletePoemAdmin).toHaveBeenCalledWith("p1")
      expect(updateReportStatus).toHaveBeenCalledWith("r1", "RESOLVED")
    })
  })
})
