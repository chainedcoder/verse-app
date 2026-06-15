import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { ConfirmProvider, useConfirm } from "../components/ConfirmProvider"

const TestComponent = () => {
  const { confirm } = useConfirm()
  
  const handleAction = async () => {
    const res = await confirm("Are you absolutely sure?")
    if (res) {
      document.body.setAttribute("data-confirmed", "true")
    } else {
      document.body.setAttribute("data-confirmed", "false")
    }
  }

  return (
    <div>
      <button onClick={handleAction}>Trigger Confirm</button>
    </div>
  )
}

describe("ConfirmProvider", () => {
  beforeEach(() => {
    document.body.removeAttribute("data-confirmed")
  })

  it("renders confirm dialog and resolves true on confirm", async () => {
    render(
      <ConfirmProvider>
        <TestComponent />
      </ConfirmProvider>
    )

    fireEvent.click(screen.getByText("Trigger Confirm"))
    expect(screen.getByText("Are you absolutely sure?")).toBeInTheDocument()

    const confirmBtn = screen.getByRole("button", { name: "Confirm" })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(document.body.getAttribute("data-confirmed")).toBe("true")
      expect(screen.queryByText("Are you absolutely sure?")).not.toBeInTheDocument()
    })
  })

  it("renders confirm dialog and resolves false on cancel", async () => {
    render(
      <ConfirmProvider>
        <TestComponent />
      </ConfirmProvider>
    )

    fireEvent.click(screen.getByText("Trigger Confirm"))
    expect(screen.getByText("Are you absolutely sure?")).toBeInTheDocument()

    const cancelBtn = screen.getByRole("button", { name: "Cancel" })
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(document.body.getAttribute("data-confirmed")).toBe("false")
      expect(screen.queryByText("Are you absolutely sure?")).not.toBeInTheDocument()
    })
  })
})
