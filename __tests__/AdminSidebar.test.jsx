import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Sidebar from "../components/admin/Sidebar";

let mockPathname = "/admin";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

jest.mock("next/link", () => ({ children, href, ...rest }) => <a href={href} {...rest}>{children}</a>);

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { name: "Ada Admin", role: "ADMIN" } } }),
}));

const setViewportWidth = (width) => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
};

describe("Admin Sidebar", () => {
  beforeEach(() => {
    mockPathname = "/admin";
    localStorage.clear();
    setViewportWidth(1280);
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
  });

  afterEach(() => {
    delete global.fetch;
  });

  describe("expanded state", () => {
    it("defaults to collapsed when nothing is stored", () => {
      render(<Sidebar />);
      expect(screen.getByTitle("Expand Sidebar")).toBeInTheDocument();
    });

    it("restores the expanded state from localStorage", () => {
      localStorage.setItem("admin_sidebar_expanded", "true");
      render(<Sidebar />);
      expect(screen.getByTitle("Collapse Sidebar")).toBeInTheDocument();
    });

    it("toggles and persists the expanded state", () => {
      render(<Sidebar />);

      fireEvent.click(screen.getByTitle("Expand Sidebar"));
      expect(screen.getByTitle("Collapse Sidebar")).toBeInTheDocument();
      expect(localStorage.getItem("admin_sidebar_expanded")).toBe("true");

      fireEvent.click(screen.getByTitle("Collapse Sidebar"));
      expect(screen.getByTitle("Expand Sidebar")).toBeInTheDocument();
      expect(localStorage.getItem("admin_sidebar_expanded")).toBe("false");
    });

    it("still toggles when localStorage is unavailable", () => {
      const getItem = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      const setItem = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
      });

      render(<Sidebar />);
      fireEvent.click(screen.getByTitle("Expand Sidebar"));
      expect(screen.getByTitle("Collapse Sidebar")).toBeInTheDocument();

      getItem.mockRestore();
      setItem.mockRestore();
    });
  });

  describe("mobile drawer", () => {
    const getBackdrop = (container) =>
      Array.from(container.querySelectorAll("div")).find(
        (el) => el.style.backgroundColor === "rgba(0, 0, 0, 0.5)"
      );

    it("opens from the hamburger and closes from the backdrop", () => {
      setViewportWidth(600);
      const { container } = render(<Sidebar />);

      expect(getBackdrop(container)).toBeUndefined();
      fireEvent.click(container.querySelector(".admin-mobile-hamburger"));
      expect(getBackdrop(container)).toBeDefined();

      fireEvent.click(getBackdrop(container));
      expect(getBackdrop(container)).toBeUndefined();
    });

    it("closes automatically when the pathname changes", () => {
      setViewportWidth(600);
      const { container, rerender } = render(<Sidebar />);

      fireEvent.click(container.querySelector(".admin-mobile-hamburger"));
      expect(getBackdrop(container)).toBeDefined();

      mockPathname = "/admin/users";
      rerender(<Sidebar />);
      expect(getBackdrop(container)).toBeUndefined();

      // Navigating back does not resurrect the drawer
      mockPathname = "/admin";
      rerender(<Sidebar />);
      expect(getBackdrop(container)).toBeUndefined();
    });
  });

  describe("theme and accent", () => {
    const openThemePanel = (container) => {
      fireEvent.click(container.querySelector("#admin-theme-toggle"));
    };

    it("reads the stored theme and accent on mount", () => {
      localStorage.setItem("verse_theme", "dark");
      localStorage.setItem("verse_accent", "emerald");
      const { container } = render(<Sidebar />);
      openThemePanel(container);

      expect(screen.getByRole("button", { name: /Dark/ })).toHaveClass("active");
      expect(screen.getByLabelText("Set accent color to emerald")).toHaveClass("active");
    });

    it("updates when the theme or accent changes", () => {
      const { container } = render(<Sidebar />);
      openThemePanel(container);

      fireEvent.click(screen.getByRole("button", { name: /Dark/ }));
      expect(screen.getByRole("button", { name: /Dark/ })).toHaveClass("active");
      expect(screen.getByRole("button", { name: /Light/ })).not.toHaveClass("active");

      fireEvent.click(screen.getByLabelText("Set accent color to rose"));
      expect(screen.getByLabelText("Set accent color to rose")).toHaveClass("active");
      expect(screen.getByLabelText("Set accent color to indigo")).not.toHaveClass("active");
    });

    it("follows theme changes made elsewhere in the app", () => {
      const { container } = render(<Sidebar />);
      openThemePanel(container);

      act(() => {
        localStorage.setItem("verse_theme", "system");
        window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: "system" } }));
      });
      expect(screen.getByRole("button", { name: /System/ })).toHaveClass("active");
    });
  });
});
