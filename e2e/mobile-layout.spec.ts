import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile view stacks all three sections edge-to-edge at full width and height", async ({
  page,
}) => {
  await page.goto("/");

  const main = page.locator("main.app-grid");
  const markdown = page.locator("#markdown");
  const html = page.locator("#html");
  const richText = page.locator("#rich-text");

  await expect(markdown).toBeVisible();
  await expect(html).toBeVisible();
  await expect(richText).toBeVisible();

  const mainBox = await main.boundingBox();
  const markdownBox = await markdown.boundingBox();
  const htmlBox = await html.boundingBox();
  const richTextBox = await richText.boundingBox();
  if (!mainBox || !markdownBox || !htmlBox || !richTextBox) {
    throw new Error("expected bounding boxes for main and all three sections");
  }

  // Full width: each section spans the same width as its container --
  // regression test for the AlbertCSS `.grid` utility class collision,
  // which left these squeezed into a 12-column fraction of the viewport.
  for (const box of [markdownBox, htmlBox, richTextBox]) {
    expect(box.width).toBeCloseTo(mainBox.width, -1);
  }
  const viewportWidth = page.viewportSize()?.width;
  expect(
    await page.evaluate(() => document.body.scrollWidth),
  ).toBeLessThanOrEqual(viewportWidth ?? mainBox.width);

  // Full height: stacked with no gaps or overlaps, filling the container
  // from top to bottom.
  expect(markdownBox.y).toBeCloseTo(mainBox.y, -1);
  expect(htmlBox.y).toBeCloseTo(markdownBox.y + markdownBox.height, -1);
  expect(richTextBox.y).toBeCloseTo(htmlBox.y + htmlBox.height, -1);
  expect(richTextBox.y + richTextBox.height).toBeCloseTo(
    mainBox.y + mainBox.height,
    -1,
  );
});
