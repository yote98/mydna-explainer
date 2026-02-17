import { test, expect } from "@playwright/test";

test("home page renders key sections", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByText("Translate Your Genetic Report")
  ).toBeVisible();

  const pricingBadge = page.getByText("ALWAYS_FREE");
  await pricingBadge.scrollIntoViewIfNeeded();
  await expect(pricingBadge).toBeVisible();

  const testimonialsHeading = page.getByText("Clarity when it matters most");
  await testimonialsHeading.scrollIntoViewIfNeeded();
  await expect(testimonialsHeading).toBeVisible();
});

test("translate page allows entering text and shows validation error", async ({ page }) => {
  await page.goto("/translate");

  await expect(
    page.getByText("Translate Your Genetic Report")
  ).toBeVisible();

  const textarea = page.getByRole("textbox", {
    name: /paste your genetic report text here/i,
  }).or(page.locator("textarea"));

  await textarea.fill("too short");

  const runButton = page.getByRole("button", {
    name: /run translation engine/i,
  });

  await runButton.click();

  await expect(
    page.getByText(/seems too short/i)
  ).toBeVisible();
});
