import { test, expect } from "@playwright/test";

test("Login – invalid credentials shows user-friendly error", async ({
  page,
}) => {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill("bad@example.com");
  await page.getByLabel("Hasło").fill("wrong");
  await page.getByRole("button", { name: "Zaloguj się" }).click();

  await expect(page.getByText("Nieprawidłowy email lub hasło.")).toBeVisible();
});
