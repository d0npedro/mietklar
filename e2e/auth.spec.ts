import { expect, test } from "@playwright/test";

test("manager can sign in and reach the protected portal", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("E-Mail").fill("manager@mietklar.demo");
  await page.getByLabel("Passwort").fill("Demo12345!");
  await page.getByRole("button", { name: /anmelden/i }).click();

  await expect(page).toHaveURL(/\/portal\/manager$/);
  await expect(
    page.getByRole("heading", {
      name: /manager-portal/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/lindenhof mitte/i)).toBeVisible();
});
