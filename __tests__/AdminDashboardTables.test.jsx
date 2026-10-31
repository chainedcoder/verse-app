import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LiveModerationFeed } from "../components/admin/LiveModerationFeed";
import { RecentVersesTable } from "../components/admin/RecentVersesTable";
import { VibeSoundboardMixer } from "../components/admin/VibeSoundboardMixer";
import { reinstatePoemAdmin, togglePoemFeatured } from "@/app/actions/admin";

jest.mock("@/app/actions/admin", () => ({
  reinstatePoemAdmin: jest.fn(() => Promise.resolve({ success: true })),
  togglePoemFeatured: jest.fn(() => Promise.resolve({ success: true })),
}));

const makePoem = (id, title, author = "Poet " + id) => ({
  id,
  title,
  author,
  likes: 3,
  comments: 1,
  hasVibe: false,
  createdAt: "2026-01-15T10:00:00.000Z",
});

describe("LiveModerationFeed — banned list", () => {
  const openBannedTab = () => fireEvent.click(screen.getByText(/Recently Banned/));

  it("renders without props", () => {
    render(<LiveModerationFeed />);
    expect(screen.getByText("Recently Banned (0)")).toBeInTheDocument();
    expect(screen.getByText("Active Reports (0)")).toBeInTheDocument();
  });

  it("optimistically removes a reinstated poem and calls the server action", async () => {
    render(<LiveModerationFeed bannedPoems={[makePoem("p1", "Ash"), makePoem("p2", "Ember")]} />);
    openBannedTab();
    expect(screen.getByText("Recently Banned (2)")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getAllByText("Reinstate")[0]);
    });

    expect(reinstatePoemAdmin).toHaveBeenCalledWith("p1");
    expect(screen.getByText("Recently Banned (1)")).toBeInTheDocument();
    expect(screen.queryByText('"Ash"')).not.toBeInTheDocument();
    expect(screen.getByText('"Ember"')).toBeInTheDocument();
  });

  it("shows the new list when the bannedPoems prop changes", async () => {
    const { rerender } = render(<LiveModerationFeed bannedPoems={[makePoem("p1", "Ash"), makePoem("p2", "Ember")]} />);
    openBannedTab();

    await act(async () => {
      fireEvent.click(screen.getAllByText("Reinstate")[0]);
    });
    expect(screen.getByText("Recently Banned (1)")).toBeInTheDocument();

    // Server data replaces the optimistic state, including a poem that was banned again
    rerender(<LiveModerationFeed bannedPoems={[makePoem("p1", "Ash"), makePoem("p3", "Cinder")]} />);
    expect(screen.getByText("Recently Banned (2)")).toBeInTheDocument();
    expect(screen.getByText('"Ash"')).toBeInTheDocument();
    expect(screen.getByText('"Cinder"')).toBeInTheDocument();
    expect(screen.queryByText('"Ember"')).not.toBeInTheDocument();
  });

  it("filters the banned list by title or poet", () => {
    render(<LiveModerationFeed bannedPoems={[makePoem("p1", "Ash", "Rumi"), makePoem("p2", "Ember", "Hafez")]} />);
    openBannedTab();

    fireEvent.change(screen.getByPlaceholderText(/Search banned verses/), { target: { value: "hafez" } });
    expect(screen.queryByText('"Ash"')).not.toBeInTheDocument();
    expect(screen.getByText('"Ember"')).toBeInTheDocument();
  });
});

describe("RecentVersesTable — curation feed", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("marks a poem featured, then fades it out after 800ms", async () => {
    render(<RecentVersesTable recentPoems={[makePoem("r1", "Dawn"), makePoem("r2", "Dusk")]} />);

    await act(async () => {
      fireEvent.click(screen.getAllByText("★ Feature")[0]);
    });
    expect(togglePoemFeatured).toHaveBeenCalledWith("r1", true);
    expect(screen.getByText("✓ Featured")).toBeInTheDocument();
    expect(screen.getByText('"Dawn"')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(800);
    });
    expect(screen.queryByText('"Dawn"')).not.toBeInTheDocument();
    expect(screen.getByText('"Dusk"')).toBeInTheDocument();
  });

  it("shows the new rows when the recentPoems prop changes", async () => {
    const { rerender } = render(<RecentVersesTable recentPoems={[makePoem("r1", "Dawn"), makePoem("r2", "Dusk")]} />);

    await act(async () => {
      fireEvent.click(screen.getAllByText("★ Feature")[0]);
    });
    act(() => {
      jest.advanceTimersByTime(800);
    });
    expect(screen.queryByText('"Dawn"')).not.toBeInTheDocument();

    rerender(<RecentVersesTable recentPoems={[makePoem("r1", "Dawn"), makePoem("r3", "Noon")]} />);
    expect(screen.getByText('"Dawn"')).toBeInTheDocument();
    expect(screen.getByText('"Noon"')).toBeInTheDocument();
    expect(screen.queryByText('"Dusk"')).not.toBeInTheDocument();
  });
});

describe("VibeSoundboardMixer — audio elements", () => {
  beforeEach(() => {
    jest.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
    jest.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("applies default volumes and looping to every soundscape on mount", () => {
    const { container } = render(<VibeSoundboardMixer />);
    const audios = Array.from(container.querySelectorAll("audio"));

    expect(audios).toHaveLength(4);
    expect(audios.map((a) => a.volume)).toEqual([0.6, 0.4, 0.3, 0.2]);
    audios.forEach((a) => expect(a.loop).toBe(true));
  });

  it("plays one soundscape at a time", () => {
    const { container } = render(<VibeSoundboardMixer />);
    const [rain, lofi] = container.querySelectorAll("audio");

    // Dials render in soundscape order: rain, lofi, hearth, drone
    fireEvent.click(screen.getAllByText("OFF")[0]);
    expect(HTMLMediaElement.prototype.play.mock.contexts).toContain(rain);
    expect(screen.getAllByText("ON")).toHaveLength(1);

    fireEvent.click(screen.getAllByText("OFF")[0]);
    expect(HTMLMediaElement.prototype.pause.mock.contexts).toContain(rain);
    expect(HTMLMediaElement.prototype.play.mock.contexts).toContain(lofi);
    expect(screen.getAllByText("ON")).toHaveLength(1);
  });

  it("adjusts the matching audio element's volume", () => {
    const { container } = render(<VibeSoundboardMixer />);
    const [rain] = container.querySelectorAll("audio");

    fireEvent.click(screen.getAllByText("+")[0]);
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(rain.volume).toBeCloseTo(0.7);
  });
});
