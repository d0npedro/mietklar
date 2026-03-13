import { expect, test } from "@playwright/test";

test("tenant can sign in and view the protected tenant portal", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByRole("button", { name: /als mieter testen/i }).click();

  await expect(page).toHaveURL(/\/portal\/mieter$/);
  await expect(
    page.getByRole("heading", {
      name: /mein zuhause/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/meine aktuelle miete/i)).toBeVisible();
});
