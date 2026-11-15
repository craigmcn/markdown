import { describe, it, expect } from "vitest";
import {
  cleanHtml,
  markdownToHtml,
  htmlToMarkdown,
  htmlToRichText,
  richTextToHtml,
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

  it("converts h1 to an ATX heading", () => {
    expect(htmlToMarkdown("<h1>Hello</h1>")).toBe("# Hello");
  });

  it("converts bold", () => {
    expect(htmlToMarkdown("<strong>bold</strong>")).toBe("**bold**");
  });

  it("converts italic", () => {
    expect(htmlToMarkdown("<em>italic</em>")).toBe("_italic_");
  });

  it("converts bullet lists with - markers", () => {
    expect(htmlToMarkdown("<ul><li>one</li></ul>")).toBe("-   one");
  });

  it("converts strikethrough to ~~ (GFM)", () => {
    expect(htmlToMarkdown("<p><s>gone</s> and <del>gone</del></p>")).toBe(
      "~~gone~~ and ~~gone~~",
    );
  });

  it("converts a table with a header row to a GFM table", () => {
    expect(
      htmlToMarkdown(
        "<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>",
      ),
    ).toBe("| a   | b   |\n| --- | --- |\n| 1   | 2   |");
  });

  it("converts a link", () => {
    expect(htmlToMarkdown('<a href="https://example.com">link</a>')).toBe(
      "[link](https://example.com)",
    );
  });
});

describe("richTextToHtml", () => {
  it("turns Quill's &nbsp; spaces back into plain spaces", () => {
    expect(richTextToHtml("<p>Hello&nbsp;big&nbsp;world</p>")).toBe(
      "<p>Hello big world</p>",
    );
  });

  it("wraps bare <pre> code blocks in <code> so turndown fences them", () => {
    const html = richTextToHtml("<pre>\nconst&nbsp;a&nbsp;=&nbsp;1;\n</pre>");
    expect(html).toBe("<pre><code>const a = 1;</code></pre>");
    expect(htmlToMarkdown(html)).toBe("```\nconst a = 1;\n```");
  });

  it("restores Quill tables' first row as a header, dropping its border style", () => {
    expect(
      richTextToHtml(
        '<table style="border: 1px solid #000;"><tbody><tr><td data-row="1">a</td><td data-row="1">b</td></tr><tr><td data-row="2">1</td><td data-row="2">2</td></tr></tbody></table>',
      ),
    ).toBe(
      "<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>",
    );
  });

  it("drops the empty tbody left by a single-row table", () => {
    expect(
      richTextToHtml(
        '<table style="border: 1px solid #000;"><tbody><tr><td>a</td></tr></tbody></table>',
      ),
    ).toBe("<table><thead><tr><th>a</th></tr></thead></table>");
  });

  it("sanitizes pasted markup", () => {
    expect(richTextToHtml('<p onclick="alert()">hi</p>')).toBe("<p>hi</p>");
  });
});

describe("htmlToRichText", () => {
  it("turns header cells into plain cells for Quill's table module", () => {
    expect(
      htmlToRichText(
        '<table><thead><tr><th align="left">a</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>',
      ),
    ).toBe(
      '<table><thead><tr><td align="left">a</td></tr></thead><tbody><tr><td>1</td></tr></tbody></table>',
    );
  });

  it("leaves <thead> alone", () => {
    expect(htmlToRichText("<thead>")).toBe("<thead>");
  });

  it("strips whitespace between table tags so the table stays whole", () => {
    expect(
      htmlToRichText(
        "<table>\n<thead>\n<tr>\n<th>a</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>1</td>\n</tr>\n</tbody></table>",
      ),
    ).toBe(
      "<table><thead><tr><td>a</td></tr></thead><tbody><tr><td>1</td></tr></tbody></table>",
    );
  });

  it("keeps whitespace between inline elements", () => {
    expect(htmlToRichText("<p><b>a</b> <i>b</i></p>")).toBe(
      "<p><b>a</b> <i>b</i></p>",
    );
  });

  it("turns <del> into Quill's <s>", () => {
    expect(htmlToRichText("<p><del>gone</del></p>")).toBe("<p><s>gone</s></p>");
  });
});
