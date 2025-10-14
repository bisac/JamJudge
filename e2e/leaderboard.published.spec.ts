import { test, expect } from "@playwright/test";
import { seedPublishedLeaderboard } from "./helpers/firestore-seed";

test.beforeEach(async ({ request }) => {
  await seedPublishedLeaderboard(request);
});

test("Leaderboard – results published renders table", async ({ page }) => {
  // Navigate to leaderboard
  await page.goto("/leaderboard");

  // Wait for heading to appear with a longer timeout
  await expect(
    page.getByRole("heading", { name: /JamJudge Open 2025 - Leaderboard/i }),
  ).toBeVisible({ timeout: 10000 });

  // Check project names
  await expect(page.getByText("Project Alpha")).toBeVisible();
  await expect(page.getByText("Project Beta")).toBeVisible();

  // Check team names
  await expect(page.getByText("Team A")).toBeVisible();
  await expect(page.getByText("Team B")).toBeVisible();

  // Check scores
  await expect(page.getByText("92.34")).toBeVisible();
  await expect(page.getByText("88.10")).toBeVisible();
});
