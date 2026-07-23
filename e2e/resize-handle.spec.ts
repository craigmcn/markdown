import { test, expect } from "@playwright/test";

// Regression tests for the Markdown/HTML resize handle: it must sit on the
// right edge of #markdown at desktop widths (horizontal drag) and on the
// bottom edge of #markdown at mobile widths, once the sections stack
// (vertical drag).

test("desktop: the handle is rendered on the right edge of #markdown", async ({
  page,
}) => {
  await page.goto("/");

  const handleStyle = await page.evaluate(() => {
    const style = getComputedStyle(
      document.getElementById("markdown")!,
      "::after",
    );
    return { left: style.left, right: style.right, cursor: style.cursor };
  });

  // `right: 0` must actually win — if a leftover `left: 0` from the mobile
  // rule is still in effect, the CSS box-offset resolution rules make
  // `right`'s used value something other than 0, even though it was
  // authored as `right: 0`.
  expect(handleStyle.right).toBe("0px");
  expect(handleStyle.left).not.toBe("0px");
  expect(handleStyle.cursor).toBe("ew-resize");
});

test("desktop: dragging the right edge of #markdown resizes it horizontally", async ({
  page,
}) => {
  await page.goto("/");

  const markdown = page.locator("#markdown");
  const html = page.locator("#html");

  const markdownBefore = await markdown.boundingBox();
  const htmlBefore = await html.boundingBox();
  if (!markdownBefore || !htmlBefore) {
    throw new Error("expected bounding boxes for #markdown and #html");
  }

  const dragY = markdownBefore.y + markdownBefore.height / 2;
  await page.mouse.move(markdownBefore.x + markdownBefore.width - 1, dragY);
  await page.mouse.down();
  await page.mouse.move(markdownBefore.x + markdownBefore.width + 100, dragY);
  await page.mouse.up();

  const markdownAfter = await markdown.boundingBox();
  const htmlAfter = await html.boundingBox();
  if (!markdownAfter || !htmlAfter) {
    throw new Error("expected bounding boxes for #markdown and #html");
  }

  expect(markdownAfter.width).toBeGreaterThan(markdownBefore.width + 50);
  expect(htmlAfter.width).toBeLessThan(htmlBefore.width - 50);
  // Dragging the right edge must not affect vertical layout.
  expect(markdownAfter.height).toBeCloseTo(markdownBefore.height, -1);
});

test("mobile: the handle is rendered on the bottom edge of #markdown", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const handleStyle = await page.evaluate(() => {
    const style = getComputedStyle(
      document.getElementById("markdown")!,
      "::after",
    );
    return { top: style.top, bottom: style.bottom, cursor: style.cursor };
  });

  expect(handleStyle.bottom).toBe("0px");
  expect(handleStyle.top).not.toBe("0px");
  expect(handleStyle.cursor).toBe("ns-resize");
});

test("mobile: dragging the bottom edge of #markdown resizes it vertically", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const markdown = page.locator("#markdown");
  const html = page.locator("#html");

  const markdownBefore = await markdown.boundingBox();
  const htmlBefore = await html.boundingBox();
  if (!markdownBefore || !htmlBefore) {
    throw new Error("expected bounding boxes for #markdown and #html");
  }

  const dragX = markdownBefore.x + markdownBefore.width / 2;
  await page.mouse.move(dragX, markdownBefore.y + markdownBefore.height - 1);
  await page.mouse.down();
  await page.mouse.move(dragX, markdownBefore.y + markdownBefore.height + 80);
  await page.mouse.up();

  const markdownAfter = await markdown.boundingBox();
  const htmlAfter = await html.boundingBox();
  if (!markdownAfter || !htmlAfter) {
    throw new Error("expected bounding boxes for #markdown and #html");
  }

  expect(markdownAfter.height).toBeGreaterThan(markdownBefore.height + 40);
  expect(htmlAfter.height).toBeLessThan(htmlBefore.height);
  // Dragging the bottom edge must not affect horizontal layout.
  expect(markdownAfter.width).toBeCloseTo(markdownBefore.width, -1);
});
