import showdown from 'showdown';
import { cleanHtml } from '../utils/markdown';

const converter = new showdown.Converter({
  simpleLineBreaks: true,
  strikethrough: true,
  tables: true,
});

const main = document.querySelector('main.grid') as HTMLElement;
const preview = document.getElementById('preview') as HTMLElement;
const previewHeader = preview.querySelector('.subheader') as HTMLElement;
const previewContent = document.getElementById('preview-content') as HTMLElement;

/* Editor */
// https://ace.c9.io/#nav=howto
const markdownEditor = ace.edit('markdown-editor', {
  mode: 'ace/mode/markdown',
  newLineMode: 'unix',
  wrap: true,
});
const htmlEditor = ace.edit('html-editor', {
  mode: 'ace/mode/html',
  newLineMode: 'unix',
  wrap: true,
});

markdownEditor.session.selection.on('changeSelection', () => {
  markdownEditorChange();
});
markdownEditor.session.selection.on('changeCursor', () => {
  markdownEditorChange();
});

const markdownEditorChange = () => {
  if (document.activeElement?.parentElement?.id === 'markdown-editor') {
    const markdownValue = markdownEditor.getValue();
    const convertedHtml = converter.makeHtml(markdownValue);
    const clean = cleanHtml(convertedHtml);
    previewContent.innerHTML = clean;
    htmlEditor.setValue(clean);
    htmlEditor.clearSelection();
  }
};

htmlEditor.session.selection.on('changeSelection', () => {
  htmlEditorChange();
});
htmlEditor.session.selection.on('changeCursor', () => {
  htmlEditorChange();
});

const htmlEditorChange = () => {
  if (document.activeElement?.parentElement?.id === 'html-editor') {
    const htmlValue = htmlEditor.getValue();
    const convertedMarkdown = converter.makeMarkdown(htmlValue);
    previewContent.innerHTML = cleanHtml(htmlValue);
    markdownEditor.setValue(convertedMarkdown);
    markdownEditor.clearSelection();
  }
};

/* Resize editor */
// https://stackoverflow.com/questions/26233180/resize-a-div-on-border-drag-and-drop-without-adding-extra-markup/53220241
let previewTop: number | undefined;
let touchDiff: number | undefined;
const HANDLE_SIZE = 4; // set in CSS

const setPreviewHeight = (e: Event) => {
  if (e.type === 'mousemove') previewTop = (e as MouseEvent).clientY;
  if (e.type === 'touchmove')
    previewTop =
      (e as TouchEvent).touches[0].clientY - (touchDiff ?? 0);

  if (previewTop !== undefined) {
    const previewStyle = getComputedStyle(preview);
    const maxHeight = parseInt(previewStyle.maxHeight);
    const minHeight = parseInt(previewStyle.minHeight);
    const numAreas = getComputedStyle(main).gridTemplateAreas.split('" ').length;

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

    main.style.gridTemplateRows = `${numAreas === 3 ? 'auto ' : ''}auto ${setHeight}px`;
  }

  markdownEditor.resize();
  htmlEditor.resize();
};

preview.querySelector('.subheader')?.addEventListener(
  'mousedown',
  (e: Event) => {
    if ((e as MouseEvent).offsetY <= HANDLE_SIZE) {
      document.addEventListener('mousemove', setPreviewHeight, false);
    }
  },
  false,
);

document.addEventListener(
  'mouseup',
  () => {
    document.removeEventListener('mousemove', setPreviewHeight, false);
  },
  false,
);

preview.querySelector('.subheader')?.addEventListener(
  'touchstart',
  (e: Event) => {
    touchDiff =
      (e as TouchEvent).touches[0].clientY -
      previewHeader.getBoundingClientRect().top;
    document.addEventListener('touchmove', setPreviewHeight, false);
  },
  false,
);

document.addEventListener(
  'touchend',
  () => {
    document.removeEventListener('touchmove', setPreviewHeight, false);
  },
  false,
);

window.addEventListener('resize', setPreviewHeight, false);
