import { cleanHtml, markdownToHtml, htmlToMarkdown } from "../utils/markdown";

const main = document.querySelector("main.app-grid") as HTMLElement;
const markdown = document.getElementById("markdown") as HTMLElement;
const preview = document.getElementById("preview") as HTMLElement;
const previewHeader = preview.querySelector(".subheader") as HTMLElement;
const previewContent = document.getElementById(
  "preview-content",
) as HTMLElement;

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
    previewContent.innerHTML = clean;
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
    previewContent.innerHTML = cleanHtml(htmlValue);
    markdownEditor.setValue(convertedMarkdown);
    markdownEditor.clearSelection();
  }
};

/* Resize editor */
// https://stackoverflow.com/questions/26233180/resize-a-div-on-border-drag-and-drop-without-adding-extra-markup/53220241
let previewTop: number | undefined;
let touchDiff: number | undefined;
let columnX: number | undefined;
let columnTouchDiff: number | undefined;
let rowY: number | undefined;
let rowTouchDiff: number | undefined;
const HANDLE_SIZE = 4; // must match --handle-size in index.css

const setPreviewHeight = (e: Event) => {
  if (e.type === "mousemove") previewTop = (e as MouseEvent).clientY;
  if (e.type === "touchmove")
    previewTop = (e as TouchEvent).touches[0].clientY - (touchDiff ?? 0);

  if (previewTop !== undefined) {
    const previewStyle = getComputedStyle(preview);
    const maxHeight = parseInt(previewStyle.maxHeight);
    const minHeight = parseInt(previewStyle.minHeight);
    const numAreas =
      getComputedStyle(main).gridTemplateAreas.split('" ').length;

    const newHeight = window.innerHeight - previewTop;
    const setHeight =
      newHeight > maxHeight
        ? maxHeight
        : newHeight < minHeight
          ? minHeight
          : newHeight;

    if (setHeight !== newHeight) {
      previewTop = window.innerHeight - setHeight;
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

    const previewRowHeight =
      getComputedStyle(main).gridTemplateRows.split(" ")[2];
    main.style.gridTemplateRows = `${setHeight}px auto ${previewRowHeight}`;
  }

  markdownEditor.resize();
  htmlEditor.resize();
};

const startDragging = () => {
  document.body.style.userSelect = "none";
};

const stopDragging = () => {
  document.body.style.userSelect = "";
  document.removeEventListener("mousemove", setPreviewHeight, false);
  document.removeEventListener("mousemove", setColumnWidths, false);
  document.removeEventListener("mousemove", setMarkdownHeight, false);
  document.removeEventListener("touchmove", setPreviewHeight, false);
  document.removeEventListener("touchmove", setColumnWidths, false);
  document.removeEventListener("touchmove", setMarkdownHeight, false);
};

preview.querySelector(".subheader")?.addEventListener(
  "mousedown",
  (e: Event) => {
    if ((e as MouseEvent).offsetY <= HANDLE_SIZE) {
      startDragging();
      document.addEventListener("mousemove", setPreviewHeight, false);
    }
  },
  false,
);

document.addEventListener("mouseup", stopDragging, false);
window.addEventListener("blur", stopDragging, false);

preview.querySelector(".subheader")?.addEventListener(
  "touchstart",
  (e: Event) => {
    touchDiff =
      (e as TouchEvent).touches[0].clientY -
      previewHeader.getBoundingClientRect().top;
    startDragging();
    document.addEventListener("touchmove", setPreviewHeight, false);
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

window.addEventListener("resize", setPreviewHeight, false);

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
