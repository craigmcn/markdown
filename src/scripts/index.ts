import Quill from "quill";
import "quill/dist/quill.snow.css";
import {
  cleanHtml,
  markdownToHtml,
  htmlToMarkdown,
  htmlToRichText,
  richTextToHtml,
} from "../utils/markdown";

const main = document.querySelector("main.app-grid") as HTMLElement;
const markdown = document.getElementById("markdown") as HTMLElement;
const richText = document.getElementById("rich-text") as HTMLElement;
const richTextHeader = richText.querySelector(".subheader") as HTMLElement;

/* Editor */
// https://ace.c9.io/#nav=howto
const markdownEditor = ace.edit("markdown-editor", {
  mode: "ace/mode/markdown",
  newLineMode: "unix",
  wrap: true,
});
const htmlEditor = ace.edit("html-editor", {
  mode: "ace/mode/html",
  newLineMode: "unix",
  wrap: true,
});

// Ace renders a hidden <textarea> for input capture; give it an accessible
// name since it has no visible <label>.
document
  .querySelector("#markdown-editor .ace_text-input")
  ?.setAttribute("aria-label", "Markdown input");
document
  .querySelector("#html-editor .ace_text-input")
  ?.setAttribute("aria-label", "HTML input");

// Formats are limited to what survives conversion (cleanHtml strips <img>), so
// pasted colors, fonts, sizes and images are dropped up front, not silently.
const richTextEditor = new Quill("#rich-text-editor", {
  theme: "snow",
  formats: [
    "header",
    "bold",
    "italic",
    "strike",
    "code",
    "link",
    "blockquote",
    "code-block",
    "list",
    "indent",
    "table",
  ],
  modules: {
    table: true,
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "strike", "code"],
      ["link", "blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  },
});
richTextEditor.root.setAttribute("role", "textbox");
richTextEditor.root.setAttribute("aria-multiline", "true");
richTextEditor.root.setAttribute("aria-label", "Rich text input");
// Quill draws the heading picker's label with CSS ::before, so axe sees no name.
richText
  .querySelector(".ql-header .ql-picker-label")
  ?.setAttribute("aria-label", "Text style");
// Quill gives toolbar buttons no tooltips, and inline code and code block
// share an icon, so name each one on hover.
const toolbarTitles: Record<string, string> = {
  ".ql-bold": "Bold",
  ".ql-italic": "Italic",
  ".ql-strike": "Strikethrough",
  ".ql-code": "Inline code",
  ".ql-link": "Link",
  ".ql-blockquote": "Quote",
  ".ql-code-block": "Code block",
  '.ql-list[value="ordered"]': "Numbered list",
  '.ql-list[value="bullet"]': "Bulleted list",
  ".ql-clean": "Clear formatting",
};
for (const [selector, title] of Object.entries(toolbarTitles)) {
  richText
    .querySelector(`.ql-toolbar ${selector}`)
    ?.setAttribute("title", title);
}

// "silent" keeps this from firing text-change and echoing back to the others.
const setRichText = (html: string) => {
  richTextEditor.setContents(
    richTextEditor.clipboard.convert({ html: htmlToRichText(html) }),
    "silent",
  );
};

richTextEditor.on("text-change", (_delta, _oldDelta, source) => {
  if (source !== "user") return;
  const html = richTextToHtml(richTextEditor.getSemanticHTML());
  htmlEditor.setValue(html);
  htmlEditor.clearSelection();
  markdownEditor.setValue(htmlToMarkdown(html));
  markdownEditor.clearSelection();
});

markdownEditor.session.selection.on("changeSelection", () => {
  markdownEditorChange();
});
markdownEditor.session.selection.on("changeCursor", () => {
  markdownEditorChange();
});

const markdownEditorChange = () => {
  if (document.activeElement?.parentElement?.id === "markdown-editor") {
    const markdownValue = markdownEditor.getValue();
    const clean = markdownToHtml(markdownValue);
    setRichText(clean);
    htmlEditor.setValue(clean);
    htmlEditor.clearSelection();
  }
};

htmlEditor.session.selection.on("changeSelection", () => {
  htmlEditorChange();
});
htmlEditor.session.selection.on("changeCursor", () => {
  htmlEditorChange();
});

const htmlEditorChange = () => {
  if (document.activeElement?.parentElement?.id === "html-editor") {
    const htmlValue = htmlEditor.getValue();
    const convertedMarkdown = htmlToMarkdown(htmlValue);
    setRichText(cleanHtml(htmlValue));
    markdownEditor.setValue(convertedMarkdown);
    markdownEditor.clearSelection();
  }
};

/* Resize editor */
// https://stackoverflow.com/questions/26233180/resize-a-div-on-border-drag-and-drop-without-adding-extra-markup/53220241
let richTextTop: number | undefined;
let touchDiff: number | undefined;
let columnX: number | undefined;
let columnTouchDiff: number | undefined;
let rowY: number | undefined;
let rowTouchDiff: number | undefined;
const HANDLE_SIZE = 4; // must match --handle-size in index.css

const setRichTextHeight = (e: Event) => {
  if (e.type === "mousemove") richTextTop = (e as MouseEvent).clientY;
  if (e.type === "touchmove")
    richTextTop = (e as TouchEvent).touches[0].clientY - (touchDiff ?? 0);

  if (richTextTop !== undefined) {
    const richTextStyle = getComputedStyle(richText);
    const maxHeight = parseInt(richTextStyle.maxHeight);
    const minHeight = parseInt(richTextStyle.minHeight);
    const numAreas =
      getComputedStyle(main).gridTemplateAreas.split('" ').length;

    const newHeight = window.innerHeight - richTextTop;
    const setHeight =
      newHeight > maxHeight
        ? maxHeight
        : newHeight < minHeight
          ? minHeight
          : newHeight;

    if (setHeight !== newHeight) {
      richTextTop = window.innerHeight - setHeight;
    }

    main.style.gridTemplateRows = `${numAreas === 3 ? "auto " : ""}auto ${setHeight}px`;
  }

  markdownEditor.resize();
  htmlEditor.resize();
};

const setColumnWidths = (e: Event) => {
  if (e.type === "mousemove") columnX = (e as MouseEvent).clientX;
  if (e.type === "touchmove")
    columnX = (e as TouchEvent).touches[0].clientX - (columnTouchDiff ?? 0);

  if (columnX !== undefined) {
    const mainRect = main.getBoundingClientRect();
    const totalWidth = mainRect.width;
    const newWidth = columnX - mainRect.left;
    const minWidth = totalWidth * 0.2;
    const maxWidth = totalWidth * 0.8;
    const setWidth =
      newWidth > maxWidth
        ? maxWidth
        : newWidth < minWidth
          ? minWidth
          : newWidth;

    if (setWidth !== newWidth) {
      columnX = mainRect.left + setWidth;
    }

    main.style.gridTemplateColumns = `${setWidth}px 1fr`;
  }

  markdownEditor.resize();
  htmlEditor.resize();
};

const setMarkdownHeight = (e: Event) => {
  if (e.type === "mousemove") rowY = (e as MouseEvent).clientY;
  if (e.type === "touchmove")
    rowY = (e as TouchEvent).touches[0].clientY - (rowTouchDiff ?? 0);

  if (rowY !== undefined) {
    const mainRect = main.getBoundingClientRect();
    const totalHeight = mainRect.height;
    const newHeight = rowY - mainRect.top;
    const minHeight = totalHeight * 0.2;
    const maxHeight = totalHeight * 0.8;
    const setHeight =
      newHeight > maxHeight
        ? maxHeight
        : newHeight < minHeight
          ? minHeight
          : newHeight;

    if (setHeight !== newHeight) {
      rowY = mainRect.top + setHeight;
    }

    const richTextRowHeight =
      getComputedStyle(main).gridTemplateRows.split(" ")[2];
    main.style.gridTemplateRows = `${setHeight}px auto ${richTextRowHeight}`;
  }

  markdownEditor.resize();
  htmlEditor.resize();
};

const startDragging = () => {
  document.body.style.userSelect = "none";
};

const stopDragging = () => {
  document.body.style.userSelect = "";
  document.removeEventListener("mousemove", setRichTextHeight, false);
  document.removeEventListener("mousemove", setColumnWidths, false);
  document.removeEventListener("mousemove", setMarkdownHeight, false);
  document.removeEventListener("touchmove", setRichTextHeight, false);
  document.removeEventListener("touchmove", setColumnWidths, false);
  document.removeEventListener("touchmove", setMarkdownHeight, false);
};

richText.querySelector(".subheader")?.addEventListener(
  "mousedown",
  (e: Event) => {
    if ((e as MouseEvent).offsetY <= HANDLE_SIZE) {
      startDragging();
      document.addEventListener("mousemove", setRichTextHeight, false);
    }
  },
  false,
);

document.addEventListener("mouseup", stopDragging, false);
window.addEventListener("blur", stopDragging, false);

richText.querySelector(".subheader")?.addEventListener(
  "touchstart",
  (e: Event) => {
    touchDiff =
      (e as TouchEvent).touches[0].clientY -
      richTextHeader.getBoundingClientRect().top;
    startDragging();
    document.addEventListener("touchmove", setRichTextHeight, false);
  },
  false,
);

document.addEventListener("touchend", stopDragging, false);
document.addEventListener("touchcancel", stopDragging, false);

markdown.addEventListener(
  "mousedown",
  (e: Event) => {
    const numAreas =
      getComputedStyle(main).gridTemplateAreas.split('" ').length;
    const mouseEvent = e as MouseEvent;
    const markdownRect = markdown.getBoundingClientRect();
    if (
      numAreas === 2 &&
      mouseEvent.clientX >= markdownRect.right - HANDLE_SIZE
    ) {
      startDragging();
      document.addEventListener("mousemove", setColumnWidths, false);
    } else if (
      numAreas === 3 &&
      mouseEvent.clientY >= markdownRect.bottom - HANDLE_SIZE
    ) {
      startDragging();
      document.addEventListener("mousemove", setMarkdownHeight, false);
    }
  },
  false,
);

markdown.addEventListener(
  "touchstart",
  (e: Event) => {
    const numAreas =
      getComputedStyle(main).gridTemplateAreas.split('" ').length;
    const touch = (e as TouchEvent).touches[0];
    const markdownRect = markdown.getBoundingClientRect();
    if (numAreas === 2 && touch.clientX >= markdownRect.right - HANDLE_SIZE) {
      columnTouchDiff = touch.clientX - markdownRect.right;
      startDragging();
      document.addEventListener("touchmove", setColumnWidths, false);
    } else if (
      numAreas === 3 &&
      touch.clientY >= markdownRect.bottom - HANDLE_SIZE
    ) {
      rowTouchDiff = touch.clientY - markdownRect.bottom;
      startDragging();
      document.addEventListener("touchmove", setMarkdownHeight, false);
    }
  },
  false,
);

window.addEventListener("resize", setRichTextHeight, false);

window.addEventListener(
  "resize",
  () => {
    const numAreas =
      getComputedStyle(main).gridTemplateAreas.split('" ').length;
    if (numAreas !== 2) {
      main.style.gridTemplateColumns = "";
      columnX = undefined;
    } else {
      rowY = undefined;
    }
  },
  false,
);
