import { expect, test } from "@playwright/test";

test("marketing and demo pages load", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /jede miete\. jeder kostenblock\. jede aenderung offen erklaert\./i,
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: /manager-demo ansehen/i }).click();
  await expect(page).toHaveURL(/\/manager$/);
  await expect(
    page.getByRole("heading", {
      name: /objekte, kosten, snapshots und veroeffentlichung in einem ablauf/i,
    }),
  ).toBeVisible();

  await page
    .getByRole("link", { name: /mieter-demo/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/mieter$/);
  await expect(
    page.getByRole("heading", {
      name: /deine miete, dein verlauf, deine dokumente in klartext/i,
    }),
  ).toBeVisible();
});
