import { describe, it, expect } from "vitest";
import {
  cleanHtml,
  markdownToHtml,
  htmlToMarkdown,
} from "../src/utils/markdown";

describe("cleanHtml", () => {
  it("passes through safe block elements unchanged", () => {
    expect(cleanHtml("<p>Hello world</p>")).toBe("<p>Hello world</p>");
  });

  it("strips script tags", () => {
    expect(cleanHtml('<script>alert("xss")</script><p>text</p>')).toBe(
      "<p>text</p>",
    );
  });

  it("strips event handler attributes", () => {
    expect(cleanHtml('<p onclick="alert()">text</p>')).toBe("<p>text</p>");
  });

  it("allows h1 (added beyond sanitize-html defaults)", () => {
    expect(cleanHtml("<h1>Heading</h1>")).toBe("<h1>Heading</h1>");
  });

  it("allows h2 (added beyond sanitize-html defaults)", () => {
    expect(cleanHtml("<h2>Heading</h2>")).toBe("<h2>Heading</h2>");
  });

  it("allows del tags (added beyond sanitize-html defaults)", () => {
    expect(cleanHtml("<del>deleted text</del>")).toBe(
      "<del>deleted text</del>",
    );
  });

  it("allows class attributes on any element", () => {
    expect(cleanHtml('<p class="foo">text</p>')).toBe(
      '<p class="foo">text</p>',
    );
  });

  it("allows style attributes on any element", () => {
    expect(cleanHtml('<p style="color:red">text</p>')).toBe(
      '<p style="color:red">text</p>',
    );
  });

  it("normalises &amp;nbsp; to &nbsp;", () => {
    expect(cleanHtml("<p>hello&amp;nbsp;world</p>")).toBe(
      "<p>hello&nbsp;world</p>",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(cleanHtml("  <p>text</p>  ")).toBe("<p>text</p>");
  });

  it("handles empty string", () => {
    expect(cleanHtml("")).toBe("");
  });

  it("drops xmp tag and its contents entirely", () => {
    expect(cleanHtml("<xmp><script>alert(1)</script></xmp>")).toBe("");
  });

  it("drops plaintext tag and its contents entirely", () => {
    expect(cleanHtml("<plaintext><script>alert(1)</script></plaintext>")).toBe(
      "",
    );
  });
});

describe("markdownToHtml", () => {
  it("converts a paragraph", () => {
    expect(markdownToHtml("Hello world")).toBe("<p>Hello world</p>");
  });

  it("converts a heading", () => {
    expect(markdownToHtml("# Hello")).toBe("<h1>Hello</h1>");
  });

  it("converts single newlines to <br> (breaks: true)", () => {
    expect(markdownToHtml("line one\nline two")).toBe(
      "<p>line one<br />line two</p>",
    );
  });

  it("converts GFM strikethrough (gfm: true)", () => {
    expect(markdownToHtml("~~deleted~~")).toBe("<p><del>deleted</del></p>");
  });

  it("sanitizes script tags in output", () => {
    expect(markdownToHtml('<script>alert("xss")</script>')).toBe("");
  });
});

describe("htmlToMarkdown", () => {
  it("converts a paragraph", () => {
    expect(htmlToMarkdown("<p>Hello world</p>")).toBe("Hello world");
  });

  it("converts a heading", () => {
    expect(htmlToMarkdown("<h3>Hello</h3>")).toBe("### Hello");
  });

  it("converts bold", () => {
    expect(htmlToMarkdown("<strong>bold</strong>")).toBe("**bold**");
  });

  it("converts italic", () => {
    expect(htmlToMarkdown("<em>italic</em>")).toBe("_italic_");
  });

  it("converts a link", () => {
    expect(htmlToMarkdown('<a href="https://example.com">link</a>')).toBe(
      "[link](https://example.com)",
    );
  });
});
