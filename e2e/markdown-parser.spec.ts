import { test, expect } from "@playwright/test";

test("converts typed Markdown into HTML and a rendered preview", async ({
  page,
}) => {
  await page.goto("/");

  await page.locator("#markdown-editor").click();
  await page.keyboard.type("# Hello\n\nThis is **bold**.");

  await expect(page.locator("#html-editor .ace_content")).toContainText(
    "<h1>Hello</h1>",
  );
  await expect(page.locator("#preview-content h1")).toHaveText("Hello");
  await expect(page.locator("#preview-content strong")).toHaveText("bold");
});

test("converts typed HTML into Markdown", async ({ page }) => {
  await page.goto("/");

  await page.locator("#html-editor").click();
  await page.keyboard.type("<h1>Hi</h1>");

  await expect(page.locator("#markdown-editor .ace_content")).toContainText(
    "Hi",
  );
  await expect(page.locator("#preview-content h1")).toHaveText("Hi");
});
