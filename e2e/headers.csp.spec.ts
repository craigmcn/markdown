import { expect, test } from "@playwright/test";
import { watchCsp } from "./csp";

// Runs against `vite preview` of a production build, which sends netlify.toml's
// headers, so every editor is exercised under the production CSP.
test("all three editors work with no CSP violations", async ({ page }) => {
  const violations = await watchCsp(page);
  await page.goto("/");

  await page.locator("#markdown-editor").click();
  await page.keyboard.type("# Hello");
  await expect(page.locator("#rich-text-editor h1")).toHaveText("Hello");
  // Ace's markdown mode is fetched from cdnjs; tokens prove it ran.
  await expect(
    page.locator("#markdown-editor .ace_heading").first(),
  ).toBeVisible();

  // The HTML mode starts Ace's linter in a blob: worker.
  await page.locator("#html-editor").click();
  await page.keyboard.press("End");
  await page.keyboard.type("<p>more</p>");
  await expect(page.locator("#rich-text-editor p").last()).toHaveText("more");

  await page.locator("#rich-text-editor p").last().click();
  await page.keyboard.press("End");
  await page.keyboard.type(" typed");
  await expect(page.locator("#markdown-editor .ace_content")).toContainText(
    "more typed",
  );

  // Let any late worker or module loads report before checking.
  await page.waitForTimeout(1000);
  expect(violations).toEqual([]);
});
