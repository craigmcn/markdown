import { cleanHtml, markdownToHtml, htmlToMarkdown } from "../utils/markdown";

const main = document.querySelector("main.grid") as HTMLElement;
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

preview.querySelector(".subheader")?.addEventListener(
  "mousedown",
  (e: Event) => {
    if ((e as MouseEvent).offsetY <= HANDLE_SIZE) {
      document.addEventListener("mousemove", setPreviewHeight, false);
    }
  },
  false,
);

document.addEventListener(
  "mouseup",
  () => {
    document.removeEventListener("mousemove", setPreviewHeight, false);
    document.removeEventListener("mousemove", setColumnWidths, false);
  },
  false,
);

preview.querySelector(".subheader")?.addEventListener(
  "touchstart",
  (e: Event) => {
    touchDiff =
      (e as TouchEvent).touches[0].clientY -
      previewHeader.getBoundingClientRect().top;
    document.addEventListener("touchmove", setPreviewHeight, false);
  },
  false,
);

document.addEventListener(
  "touchend",
  () => {
    document.removeEventListener("touchmove", setPreviewHeight, false);
    document.removeEventListener("touchmove", setColumnWidths, false);
  },
  false,
);

markdown.addEventListener(
  "mousedown",
  (e: Event) => {
    const numAreas =
      getComputedStyle(main).gridTemplateAreas.split('" ').length;
    if (
      numAreas === 2 &&
      (e as MouseEvent).clientX >=
        markdown.getBoundingClientRect().right - HANDLE_SIZE
    ) {
      document.addEventListener("mousemove", setColumnWidths, false);
    }
  },
  false,
);

markdown.addEventListener(
  "touchstart",
  (e: Event) => {
    const numAreas =
      getComputedStyle(main).gridTemplateAreas.split('" ').length;
    if (numAreas !== 2) return;
    const touch = (e as TouchEvent).touches[0];
    const markdownRect = markdown.getBoundingClientRect();
    if (touch.clientX >= markdownRect.right - HANDLE_SIZE) {
      columnTouchDiff = touch.clientX - markdownRect.right;
      document.addEventListener("touchmove", setColumnWidths, false);
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
    }
  },
  false,
);
