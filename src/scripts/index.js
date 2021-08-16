import showdown from "showdown";
import sanitize from "sanitize-html";

const converter = new showdown.Converter({
    simpleLineBreaks: true,
    strikethrough: true,
    tables: true,
});

const main = document.querySelector("main.grid");
const preview = document.getElementById("preview");
const previewHeader = preview.querySelector(".subheader")
const previewContent = document.getElementById("preview-content");

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

markdownEditor.session.selection.on('changeSelection', e => {
    markdownEditorChange();
});
markdownEditor.session.selection.on('changeCursor', e => {
    markdownEditorChange();
});

const markdownEditorChange = () => {
    if (document.activeElement.parentElement.id === "markdown-editor") {
        const markdownValue = markdownEditor.getValue();
        const convertedHtml = converter.makeHtml(markdownValue);

        const clean = cleanHtml(convertedHtml);

        previewContent.innerHTML = clean;

        htmlEditor.setValue(clean);
        htmlEditor.clearSelection();
    }
}

htmlEditor.session.selection.on('changeSelection', e => {
    htmlEditorChange();
});
htmlEditor.session.selection.on('changeCursor', e => {
    htmlEditorChange();
});

const htmlEditorChange = () => {
    if (document.activeElement.parentElement.id === "html-editor") {
        const htmlValue = htmlEditor.getValue();
        const convertedMarkdown = converter.makeMarkdown(htmlValue);

        previewContent.innerHTML = cleanHtml(htmlValue);

        markdownEditor.setValue(convertedMarkdown);
        markdownEditor.clearSelection();
    }
}

const cleanHtml = (html) => {
    return sanitize(html, {
        allowedTags: sanitize.defaults.allowedTags.concat(["h1", "h2", "del"]),
        allowedAttributes: Object.assign(
            { "*": ["class", "style"] },
            sanitize.defaults.allowedAttributes
        ),
    })
        .trim()
        .replace(/&amp;nbsp;/g, "&nbsp;");
}

/* Resize editor */
// https://stackoverflow.com/questions/26233180/resize-a-div-on-border-drag-and-drop-without-adding-extra-markup/53220241
let previewTop, touchDiff
const HANDLE_SIZE = 4 // set in CSS

/* Resize preview */
const setPreviewHeight = e => {
    if (e.type === "mousemove") previewTop = e.clientY

    if (e.type === "touchmove") previewTop = e.touches[0].clientY - touchDiff

    if (previewTop) {
        const previewStyle = getComputedStyle(preview)
        const maxHeight = parseInt(previewStyle.maxHeight)
        const minHeight = parseInt(previewStyle.minHeight)
        const numAreas = getComputedStyle(main).gridTemplateAreas.split("\" ").length

        const newHeight = window.innerHeight - previewTop;
        const setHeight = newHeight > maxHeight ? maxHeight : newHeight < minHeight ? minHeight : newHeight

        if (setHeight !== newHeight) {
            previewTop = window.innerHeight - setHeight
        }

        main.style.gridTemplateRows = `${numAreas === 3 ? "auto " : ""}auto ${setHeight}px`;
    }

    markdownEditor.resize()
    htmlEditor.resize()
}

preview.querySelector(".subheader").addEventListener('mousedown', e => {
    if (e.offsetY <= HANDLE_SIZE) { // only resize while handle is active
        document.addEventListener('mousemove', setPreviewHeight, false);
    }
}, false);

document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', setPreviewHeight, false);
}, false);

preview.querySelector(".subheader").addEventListener('touchstart', e => {
    touchDiff = e.touches[0].clientY - previewHeader.getBoundingClientRect().top
    document.addEventListener('touchmove', setPreviewHeight, false);
}, false);

document.addEventListener('touchend', () => {
    document.removeEventListener('touchmove', setPreviewHeight, false);
}, false);

window.addEventListener('resize', setPreviewHeight, false);
