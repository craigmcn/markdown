import showdown from "showdown";
import sanitize from "sanitize-html";

const converter = new showdown.Converter({
    simpleLineBreaks: true,
    strikethrough: true,
    tables: true,
});
const editor = document.getElementById("editor");
const content = document.getElementById("content");
const source = document.getElementById("source");
const formatted = document.getElementById("formatted");
const html = document.getElementById("html");

editor.querySelector("[contenteditable]").addEventListener("input", e => {
    const convertedHtml = converter.makeHtml(e.target.innerText);
    const clean = sanitize(convertedHtml, {
        allowedTags: sanitize.defaults.allowedTags.concat(["h1", "h2", "del"]),
        allowedAttributes: Object.assign(
            { "*": ["class", "style"] },
            sanitize.defaults.allowedAttributes
        ),
    })
        .trim()
        .replace(/&amp;nbsp;/g, "&nbsp;");
    content.innerHTML = clean;
    source.innerHTML = clean
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/\n/g, "<br>");

    if (formatted.style.height) {
        formatted.style.height = ""; //reset height, then recalculate
        formatted.style.height = editor.offsetHeight - html.offsetHeight + "px";
    }
});

document.getElementById('toggleSource').addEventListener("click", e => {
    e.preventDefault();

    const source = document.getElementById('source');
    const show = document.getElementById('source-show')
    const hide = document.getElementById('source-hide')
    const isHidden = source.hidden;

    source.hidden = !isHidden
    show.hidden = isHidden
    hide.hidden = !isHidden

    if (source.hidden) {
        html.style.height =
            html.querySelector("header").offsetHeight + "px";
        formatted.style.height =
            editor.offsetHeight - html.offsetHeight + "px";
    } else {
        html.style.height = "";
        formatted.style.height = "";
    }
})
