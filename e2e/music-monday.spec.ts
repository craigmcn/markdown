import { test, expect } from "@playwright/test";

test("generates post Markdown from the form fields", async ({ page }) => {
  await page.goto("/music-monday.html");

  await page.locator("#title").fill("Everlong");
  await page.locator("#originalArtist").fill("Foo Fighters");

  await expect(page.locator("#markdown")).toContainText("Everlong");
  await expect(page.locator("#markdown")).toContainText("Foo Fighters");
});
