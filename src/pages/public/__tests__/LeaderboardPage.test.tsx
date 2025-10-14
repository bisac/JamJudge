/// <reference types="vitest/globals" />
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LeaderboardPage from "../LeaderboardPage";
import * as useLeaderboardData from "../../../hooks/useLeaderboardData";
import * as firebase from "firebase/firestore";

// Mock firebase
vi.mock("firebase/firestore");

describe("LeaderboardPage", () => {
  const mockGetDocs = firebase.getDocs as Mock;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading spinner initially", () => {
    mockGetDocs.mockReturnValue(new Promise(() => {})); // Keep it pending
    const { container } = render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>,
    );
    expect(container.querySelector(".ant-spin")).toBeInTheDocument();
  });

  it("shows 'Event Not Found' when no event exists", async () => {
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText(/Event Not Found/i)).toBeInTheDocument();
    });
  });

  it("shows 'Results Not Published' placeholder if results are not ready", async () => {
    const mockEvent = {
      id: "test-event",
      data: () => ({ name: "Test Event", resultsPublishedAt: null }),
    };
    mockGetDocs.mockResolvedValue({ empty: false, docs: [mockEvent] });

    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(
        screen.getByText(/Results Not Yet Published/i),
      ).toBeInTheDocument();
    });
  });

  it("renders the leaderboard table with data when results are published", async () => {
    const mockEvent = {
      id: "test-event",
      data: () => ({
        name: "Test Event",
        // This is the key fix: The component calls .toDate() on this object.
        resultsPublishedAt: {
          toDate: () => new Date(),
        },
      }),
    };
    mockGetDocs.mockResolvedValue({ empty: false, docs: [mockEvent] });

    const mockLeaderboardData = {
      results: [
        {
          id: "proj-1",
          rank: 1,
          projectName: "Cool Project",
          teamName: "The A-Team",
          totalScore: 95.5,
        },
      ],
      isLoading: false,
      error: null,
    };

    // Spy on the hook within this specific test for better isolation
    vi.spyOn(useLeaderboardData, "useLeaderboardData").mockReturnValue(
      mockLeaderboardData as ReturnType<
        typeof useLeaderboardData.useLeaderboardData
      >,
    );

    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      // Check for a unique element from the LeaderboardTable, like a table header
      expect(screen.getByText("Rank")).toBeInTheDocument();
      expect(screen.getByText("Cool Project")).toBeInTheDocument();
      expect(screen.getByText("The A-Team")).toBeInTheDocument();
      expect(screen.getByText("95.50")).toBeInTheDocument(); // .toFixed(2)
    });
  });
});
