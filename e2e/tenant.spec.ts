import { expect, test } from "@playwright/test";

test("tenant can sign in and view the protected tenant portal", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("E-Mail").fill("mieter@mietklar.demo");
  await page.getByLabel("Passwort").fill("Demo12345!");
  await page.getByRole("button", { name: /anmelden/i }).click();

  await expect(page).toHaveURL(/\/portal\/mieter$/);
  await expect(
    page.getByRole("heading", {
      name: /mieterportal/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/aktuelle warmmiete/i)).toBeVisible();
});
