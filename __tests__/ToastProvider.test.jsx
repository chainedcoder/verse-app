import { render, screen, fireEvent, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import { ToastProvider, useToast } from "../components/ToastProvider"

const mockUndo = jest.fn()

const TestComponent = () => {
  const { showToast, showUndoToast } = useToast()
  return (
    <div>
      <button onClick={() => showToast("Error message", "error")}>Show Error</button>
      <button onClick={() => showToast("Success message", "success")}>Show Success</button>
      <button onClick={() => showUndoToast("Undo this action", mockUndo)}>Show Undo</button>
    </div>
  )
}

describe("ToastProvider", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("renders a toast message", () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText("Show Error"))
    expect(screen.getByText("Error message")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("allows dismissing a toast", () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText("Show Success"))
    expect(screen.getByText("Success message")).toBeInTheDocument()

    const dismissBtn = screen.getByRole("button", { name: "Dismiss" })
    fireEvent.click(dismissBtn)

    expect(screen.queryByText("Success message")).not.toBeInTheDocument()
  })

  it("allows undoing an action", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText("Show Undo"))
    expect(screen.getByText("Undo this action")).toBeInTheDocument()

    const undoBtn = screen.getByText("Undo")
    fireEvent.click(undoBtn)

    expect(mockUndo).toHaveBeenCalled()
    expect(screen.queryByText("Undo this action")).not.toBeInTheDocument()
  })

  it("auto-dismisses toasts after 5 seconds", () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText("Show Error"))
    expect(screen.getByText("Error message")).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.queryByText("Error message")).not.toBeInTheDocument()
  })
})
