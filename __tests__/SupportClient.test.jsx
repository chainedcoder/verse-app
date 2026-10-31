import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SupportClient from "../app/settings/support/SupportClient";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

const makeTicket = (id, title, messages = []) => ({
  id,
  title,
  status: "Open",
  category: "Account",
  snippet: `Details for ${title}`,
  createdAt: "2026-02-01T09:00:00.000Z",
  threadId: `thread-${id}`,
  thread: { messages },
});

const makeChat = (id, lastMessage) => ({
  id,
  createdAt: "2026-02-01T09:00:00.000Z",
  messages: lastMessage ? [{ id: `${id}-m`, content: JSON.stringify([lastMessage]) }] : [],
});

describe("Settings SupportClient", () => {
  beforeAll(() => {
    // jsdom has no <dialog> modal support
    HTMLDialogElement.prototype.showModal = jest.fn();
    HTMLDialogElement.prototype.close = jest.fn();
  });

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
  });

  afterEach(() => {
    delete global.fetch;
  });

  it("renders tickets and chats from props", () => {
    render(
      <SupportClient
        initialTickets={[makeTicket("t1", "Login trouble")]}
        initialChats={[makeChat("c1", "Hello there")]}
        userId="u1"
      />
    );
    expect(screen.getByText("Login trouble")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Live Chats", { exact: false }));
    expect(screen.getByText("Hello there")).toBeInTheDocument();
  });

  it("handles missing props", () => {
    render(<SupportClient userId="u1" />);
    fireEvent.click(screen.getByText("Live Chats", { exact: false }));
    expect(screen.getByText("No active live chats.")).toBeInTheDocument();
  });

  it("optimistically appends a sent reply to the ticket conversation", async () => {
    render(<SupportClient initialTickets={[makeTicket("t1", "Login trouble")]} initialChats={[]} userId="u1" />);

    fireEvent.click(screen.getByText("Login trouble"));
    fireEvent.change(screen.getByPlaceholderText("Type your message..."), { target: { value: "Any update?" } });
    fireEvent.click(screen.getByText("Send"));

    await waitFor(() => expect(screen.getByText("Any update?")).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/user/chat/thread-t1/messages",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("replaces local state when the server sends new tickets and chats", async () => {
    const { rerender } = render(
      <SupportClient initialTickets={[makeTicket("t1", "Login trouble")]} initialChats={[]} userId="u1" />
    );

    fireEvent.click(screen.getByText("Login trouble"));
    fireEvent.change(screen.getByPlaceholderText("Type your message..."), { target: { value: "Any update?" } });
    fireEvent.click(screen.getByText("Send"));
    await waitFor(() => expect(screen.getByText("Any update?")).toBeInTheDocument());

    // e.g. after router.refresh(): server data wins over the optimistic message
    const serverMessage = { id: "m1", senderType: "user", senderId: "u1", content: JSON.stringify(["Any update? (saved)"]), createdAt: "2026-02-01T10:00:00.000Z" };
    rerender(
      <SupportClient
        initialTickets={[makeTicket("t1", "Login trouble", [serverMessage]), makeTicket("t2", "Billing question")]}
        initialChats={[makeChat("c1", "New chat message")]}
        userId="u1"
      />
    );

    expect(screen.getByText("Billing question")).toBeInTheDocument();
    expect(screen.getByText("Any update? (saved)")).toBeInTheDocument();
    expect(screen.queryByText("Any update?")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Live Chats", { exact: false }));
    expect(screen.getByText("New chat message")).toBeInTheDocument();
  });
});
