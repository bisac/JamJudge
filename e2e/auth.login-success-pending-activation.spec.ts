import { test, expect } from "@playwright/test";
import { seedUser } from "./helpers/auth-seed";

const TEST_USER_EMAIL = "participant@example.com";
const TEST_USER_PASSWORD = "password123";
const TEST_USER_DISPLAY_NAME = "Test Participant";

test.beforeEach(async ({ request }) => {
  // Create a user in Firebase Auth AND in Firestore to simulate a fully registered user
  await seedUser(request, {
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    displayName: TEST_USER_DISPLAY_NAME,
    role: "participant",
  });
});

test("Login success for registered user redirects to dashboard", async ({
  page,
}) => {
  // 1. Navigate to login page
  await page.goto("/auth/login");

  // 2. Fill in credentials
  await page.getByLabel("Email").fill(TEST_USER_EMAIL);
  await page.getByLabel("Hasło").fill(TEST_USER_PASSWORD);

  // 3. Click login button
  await page.getByRole("button", { name: /zaloguj się/i }).click();

  // 4. Verify redirect to the participant dashboard
  await expect(page).toHaveURL("/participant/dashboard", { timeout: 10000 });

  // 5. Verify that the login form is no longer visible as an extra check
  await expect(
    page.getByRole("button", { name: /zaloguj się/i }),
  ).not.toBeVisible();
});
