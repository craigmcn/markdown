import sanitize from "sanitize-html";
import { marked } from "marked";
import TurndownService from "turndown";

marked.use({ breaks: true, gfm: true });
const turndown = new TurndownService();

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
