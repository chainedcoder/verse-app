import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import StatsCards from "../components/admin/StatsCards";
import { VibeSoundboardMixer } from "../components/admin/VibeSoundboardMixer";
import { CollectionComposer } from "../components/admin/CollectionComposer";
import { RecentVersesTable } from "../components/admin/RecentVersesTable";
import { LiveModerationFeed } from "../components/admin/LiveModerationFeed";
import { DribbbleTrendDeck } from "../components/admin/DribbbleTrendDeck";
import WorkflowDashboardClient from "../components/admin/WorkflowDashboardClient";
import { TimerProvider } from "../components/admin/context/TimerContext";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => "/admin",
}));

// Mock links
jest.mock("next/link", () => ({ children, href }) => <a href={href}>{children}</a>);

// Mock Server Actions to prevent network/env issues during unit tests
jest.mock("@/app/actions/admin", () => ({
  togglePoemFeatured: jest.fn(() => Promise.resolve({ success: true })),
  updateReportStatus: jest.fn(() => Promise.resolve({ success: true })),
}));
jest.mock("@/app/actions/poems", () => ({
  searchPoems: jest.fn(() => Promise.resolve({ poems: [] })),
}));

describe("Admin Dashboard — StatsCards", () => {
  it("renders with default fallback values when no props are provided", () => {
    render(<StatsCards />);
    expect(screen.getByText("Published Verses")).toBeInTheDocument();
    expect(screen.getByText("780")).toBeInTheDocument();
    expect(screen.getByText("/ 1,000")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    
    expect(screen.getByText("Database Volume")).toBeInTheDocument();
    expect(screen.getByText("163")).toBeInTheDocument();
    expect(screen.getByText("/ 512.0 MB")).toBeInTheDocument();
    expect(screen.getByText("68%")).toBeInTheDocument();
  });

  it("renders with dynamic props correctly", () => {
    render(
      <StatsCards
        card1Title="Immersive Coverage"
        card1Value={10}
        card1Progress={13}
        card1Sub="/ 79 Verses"
        card2Title="Homepage Curation"
        card2Value={2}
        card2Progress={3}
        card2Sub="/ 79 Verses"
      />
    );
    expect(screen.getByText("Immersive Coverage")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getAllByText("/ 79 Verses").length).toBe(2);
    expect(screen.getByText("13%")).toBeInTheDocument();
    
    expect(screen.getByText("Homepage Curation")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3%")).toBeInTheDocument();
  });
});

describe("Admin Dashboard — VibeSoundboardMixer", () => {
  it("renders the interactive vibe mixer channels and play triggers", () => {
    render(<VibeSoundboardMixer />);
    expect(screen.getByText("Atmospheric Audio Matrix")).toBeInTheDocument();
    expect(screen.getByText("Midnight Rain")).toBeInTheDocument();
    expect(screen.getByText("Lofi Serenade")).toBeInTheDocument();
  });
});

describe("Admin Dashboard — CollectionComposer", () => {
  const mockFeatured = [
    { id: "1", title: "The Road Not Taken", excerpt: "Two roads...", author: { name: "Robert Frost" } },
  ];

  it("renders the visual curation composer playlist tracks", () => {
    render(<CollectionComposer initialFeatured={mockFeatured} />);
    expect(screen.getByText("Editorial Curation Canvas")).toBeInTheDocument();
    expect(screen.getByText(/"The Road Not Taken"/)).toBeInTheDocument();
  });
});

describe("Admin Dashboard — RecentVersesTable", () => {
  const mockRecent = [
    { id: "1", title: "Ode to a Grecian Urn", author: "John Keats", likes: 8, comments: 2, hasVibe: true, createdAt: "2026-06-16T12:00:00.000Z" },
  ];

  it("renders recent publications datatable", () => {
    render(<RecentVersesTable recentPoems={mockRecent} />);
    expect(screen.getByText("High-Velocity Curation Feed")).toBeInTheDocument();
    expect(screen.getByText(/"Ode to a Grecian Urn"/)).toBeInTheDocument();
  });
});

describe("Admin Dashboard — LiveModerationFeed", () => {
  const mockReports = [
    { id: "1", reporter: "Alice", reportedEntity: "Bad Words", type: "Comment", reason: "Abusive language", status: "PENDING", createdAt: "2026-06-16T12:00:00.000Z" },
  ];

  it("renders real-time flagged reports and action triggers", () => {
    render(<LiveModerationFeed initialReports={mockReports} />);
    expect(screen.getByText("Appeals & Moderation Desk")).toBeInTheDocument();
    expect(screen.getByText(/"Bad Words"/)).toBeInTheDocument();
    expect(screen.getByText("Abusive language")).toBeInTheDocument();
  });
});

describe("Admin Dashboard — DribbbleTrendDeck", () => {
  const mockChartData = [
    { day: "15 Jun", ops: 0.8, data: 0.6, empty: false, tooltipOps: "18 verses", tooltipData: "14 sign-ups" },
  ];

  it("renders widescreen area trend spline line chart and donut catalog balance", () => {
    render(<DribbbleTrendDeck chartData={mockChartData} totalPoems={79} vibeConfigured={10} />);
    expect(screen.getByText("Platform Activity Trends")).toBeInTheDocument();
    expect(screen.getByText("Catalog Balance")).toBeInTheDocument();
    expect(screen.getByText("13%")).toBeInTheDocument(); // 10 / 79 rounded is 13%
  });
});

describe("Admin Dashboard — WorkflowDashboardClient", () => {
  const mockStats = {
    card1Title: "Immersive Coverage",
    card1Value: 10,
    card1Progress: 13,
    card1Sub: "/ 79 Verses",
    card2Title: "Homepage Curation",
    card2Value: 2,
    card2Progress: 3,
    card2Sub: "/ 79 Verses",
  };

  const mockChartData = [
    { day: "15 Jun", ops: 0.8, data: 0.6, empty: false, tooltipOps: "18 verses", tooltipData: "14 sign-ups" },
  ];

  const mockFeatured = [
    { id: "1", title: "The Road Not Taken", excerpt: "Two roads...", author: { name: "Robert Frost" } },
  ];

  const mockRecent = [
    { id: "1", title: "Ode to the West Wind", author: "Percy Shelley", likes: 23, comments: 11, hasVibe: true, createdAt: "2026-06-16T12:00:00.000Z" },
  ];

  it("renders the entire workflow dashboard seamlessly with pristine bento cards", () => {
    render(
      <TimerProvider pendingReportsCount={0} newestFeaturedTime={null} unsecuredModsCount={4}>
        <WorkflowDashboardClient 
          stats={mockStats} 
          chartData={mockChartData} 
          featuredList={mockFeatured}
          recentPoems={mockRecent}
          reportsList={[]}
        />
      </TimerProvider>
    );

    // Check header text elements
    expect(screen.getByText("Managing Your Poets")).toBeInTheDocument();
    expect(screen.getByText("Configure Platform")).toBeInTheDocument();

    // Check stats cards render
    expect(screen.getByText("Immersive Coverage")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    // Check custom widgets are in place
    expect(screen.getByText("High-Velocity Curation Feed")).toBeInTheDocument();
    expect(screen.getByText("Platform Activity Trends")).toBeInTheDocument();
    expect(screen.getByText("Editorial Curation Canvas")).toBeInTheDocument();
    expect(screen.getByText("Appeals & Moderation Desk")).toBeInTheDocument();

    // Check active timers are rendered
    expect(screen.getByText("Active Timers")).toBeInTheDocument();
  });
});
