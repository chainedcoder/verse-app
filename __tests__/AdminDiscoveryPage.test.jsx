import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminDiscoveryPage from "../app/admin/discovery/page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

describe("Admin Discovery page", () => {
  afterEach(() => jest.restoreAllMocks());

  it("redirects signed-out visitors to login", async () => {
    auth.mockResolvedValue(null);
    await expect(AdminDiscoveryPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders trending tags with velocity bars between 20px and 80px", async () => {
    auth.mockResolvedValue({ user: { id: "admin1" } });
    jest.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(1).mockReturnValueOnce(0.25);

    render(await AdminDiscoveryPage());

    const tags = ["#poetry", "#love", "#nature", "#haiku"];
    const widths = tags.map((tag) => {
      const row = screen.getByText(tag).parentElement;
      const velocityBar = row.lastElementChild.firstElementChild;
      return velocityBar.style.width;
    });
    expect(widths).toEqual(["20px", "50px", "80px", "35px"]);
  });
});
