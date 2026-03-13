import { expect, test } from "@playwright/test";

test("manager can sign in and reach the protected portal", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: /als verwalter testen/i }).click();

  await expect(page).toHaveURL(/\/portal\/manager$/);
  await expect(
    page.getByRole("heading", {
      name: /verwaltung/i,
    }),
  ).toBeVisible();
  await expect(
    page
      .locator("p")
      .filter({ hasText: /lindenhof mitte/i })
      .first(),
  ).toBeVisible();
});
