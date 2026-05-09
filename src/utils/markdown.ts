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
  })
    .trim()
    .replace(/&amp;nbsp;/g, "&nbsp;");
};

export const markdownToHtml = (markdown: string): string =>
  cleanHtml(marked.parse(markdown) as string);

export const htmlToMarkdown = (html: string): string => turndown.turndown(html);
