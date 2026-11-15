import { test, expect } from "@playwright/test";

test("converts typed Markdown into HTML and rich text", async ({ page }) => {
  await page.goto("/");

  await page.locator("#markdown-editor").click();
  await page.keyboard.type("# Hello\n\nThis is **bold**.");

  await expect(page.locator("#html-editor .ace_content")).toContainText(
    "<h1>Hello</h1>",
  );
  await expect(page.locator("#rich-text-editor h1")).toHaveText("Hello");
  await expect(page.locator("#rich-text-editor strong")).toHaveText("bold");
});

test("converts typed HTML into Markdown", async ({ page }) => {
  await page.goto("/");

  await page.locator("#html-editor").click();
  await page.keyboard.type("<h1>Hi</h1>");

  await expect(page.locator("#markdown-editor .ace_content")).toContainText(
    "Hi",
  );
  await expect(page.locator("#rich-text-editor h1")).toHaveText("Hi");
});

test("converts pasted rich text into Markdown and HTML", async ({ page }) => {
  await page.goto("/");

  const editor = page.locator("#rich-text-editor .ql-editor");
  await editor.click();
  // Synthesize the paste: Playwright can't write text/html to the OS clipboard.
  await editor.evaluate((el) => {
    const data = new DataTransfer();
    data.setData(
      "text/html",
      '<h2 style="color:red">Pasted</h2><p>Some <b>bold</b> and <a href="https://example.com">a link</a>.</p><ul><li>one</li><li>two</li></ul>',
    );
    el.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      }),
    );
  });

  const markdown = page.locator("#markdown-editor .ace_content");
  await expect(markdown).toContainText("## Pasted");
  await expect(markdown).toContainText(
    "Some **bold** and [a link](https://example.com).",
  );
  await expect(markdown).toContainText("one");

  const html = page.locator("#html-editor .ace_content");
  await expect(html).toContainText("<h2>Pasted</h2>");
  await expect(html).toContainText("<ul>");
  await expect(html).not.toContainText("color:red");
});

test("converts typed rich text into Markdown and HTML", async ({ page }) => {
  await page.goto("/");

  await page.locator("#rich-text-editor .ql-editor").click();
  await page.keyboard.type("Hello rich world");

  // Spaces must stay spaces, not Quill's &nbsp; entities.
  await expect(page.locator("#html-editor .ace_content")).toContainText(
    "<p>Hello rich world</p>",
  );
  await expect(page.locator("#markdown-editor .ace_content")).toContainText(
    "Hello rich world",
  );
});
