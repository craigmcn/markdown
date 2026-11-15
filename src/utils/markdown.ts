import sanitize from "sanitize-html";
import { marked } from "marked";
import TurndownService from "turndown";
import { gfm } from "@joplin/turndown-plugin-gfm";

marked.use({ breaks: true, gfm: true });
// ATX headings, fenced code and - bullets are what most Markdown is written in;
// turndown's setext/indented/* defaults read oddly when converting rich text.
const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});
// Tables and strikethrough have no core-Markdown form; without GFM, turndown
// flattens tables to loose text and drops ~~ entirely.
turndown.use(gfm);

export const cleanHtml = (html: string): string => {
  return sanitize(html, {
    allowedTags: sanitize.defaults.allowedTags.concat(["h1", "h2", "del"]),
    allowedAttributes: Object.assign(
      { "*": ["class", "style"] },
      sanitize.defaults.allowedAttributes,
    ),
    // xmp and plaintext are raw-text elements whose content is passed through
    // unescaped by sanitize-html, enabling XSS bypass (CVE/Dependabot #94).
    // Adding them here causes the entire tag and its contents to be dropped.
    // Defaults are: style, script, textarea, option, noscript.
    nonTextTags: [
      "style",
      "script",
      "textarea",
      "option",
      "noscript",
      "xmp",
      "plaintext",
    ],
  })
    .trim()
    .replace(/&amp;nbsp;/g, "&nbsp;");
};

export const markdownToHtml = (markdown: string): string =>
  cleanHtml(marked.parse(markdown) as string);

export const htmlToMarkdown = (html: string): string => turndown.turndown(html);

// Adapts HTML to what Quill's clipboard matches: its table module only knows
// <td> (a <th> row gets merged into one cell), whitespace between table tags
// becomes a stray paragraph that splits the table, and strike only matches <s>.
export const htmlToRichText = (html: string): string =>
  html
    .replace(/\s*(<\/?(?:table|thead|tbody|tr|th|td)\b[^>]*>)\s*/g, "$1")
    .replace(/<(\/?)th\b/g, "<$1td")
    .replace(/<(\/?)del\b/g, "<$1s");

// GFM tables need a header row and Quill has no header cells, so treat each
// table's first row as its header, as pasted tables almost always intend.
const promoteHeaderRow = (html: string): string =>
  html.replace(
    /<table[^>]*>\s*<tbody>\s*(<tr[^>]*>[\s\S]*?<\/tr>)/g,
    (_match, row: string) =>
      `<table><thead>${row.replace(/<(\/?)td\b/g, "<$1th")}</thead><tbody>`,
  );

// Quill 2.0.3's getSemanticHTML() emits spaces as &nbsp;, code blocks without
// <code> (turndown won't fence them), and its own link targets and ql-* classes.
export const richTextToHtml = (semanticHtml: string): string =>
  cleanHtml(
    promoteHeaderRow(
      semanticHtml
        .replace(/&nbsp;/g, " ")
        .replace(/ (?:target="_blank"|rel="[^"]*"|class="ql-[^"]*")/g, "")
        .replace(
          /<pre[^>]*>\n?([\s\S]*?)\n?<\/pre>/g,
          "<pre><code>$1</code></pre>",
        ),
    ),
  ).replace(/<tbody><\/tbody>/g, "");
