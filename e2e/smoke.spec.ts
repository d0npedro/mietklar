import { expect, test } from "@playwright/test";

test("marketing and demo pages load", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /was moechten sie heute sehen\?/i,
    }),
  ).toBeVisible();

  await page
    .getByRole("link", { name: /ich verwalte wohnungen/i })
    .click();
  await expect(page).toHaveURL(/\/manager$/);
  await expect(
    page.getByRole("heading", {
      name: /ich verwalte wohnungen/i,
    }),
  ).toBeVisible();

  await page
    .getByRole("link", { name: /mieteransicht ansehen/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/mieter$/);
  await expect(
    page.getByRole("heading", {
      name: /ich wohne hier/i,
    }),
  ).toBeVisible();
});
