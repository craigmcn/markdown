import showdown from "showdown";
import sanitize from "sanitize-html";
import "../styles/index.scss";

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

document.querySelectorAll(".js-isToggle").forEach(i =>
    i.addEventListener("click", e => {
        e.preventDefault();
        let toggle = e.target;
        if (!e.target.classList.contains("js-isToggle")) {
            toggle = e.target.closest(".js-isToggle");
        }
        if (toggle.dataset.icon === "true") {
            const icon = toggle.querySelector("[data-fa-i2svg]");
            if (toggle.dataset.toggleOn && toggle.dataset.toggleOff) {
                if (icon.classList.contains(toggle.dataset.toggleOn)) {
                    icon.classList.replace(
                        toggle.dataset.toggleOn,
                        toggle.dataset.toggleOff
                    );
                } else {
                    icon.classList.replace(
                        toggle.dataset.toggleOff,
                        toggle.dataset.toggleOn
                    );
                }
            }
        } else {
            if (toggle.dataset.toggleOn && toggle.dataset.toggleOff) {
                if (toggle.innerText === toggle.dataset.toggleOn) {
                    toggle.innerText = toggle.dataset.toggleOff;
                } else {
                    toggle.innerText = toggle.dataset.toggleOn;
                }
            }
        }
        const el = document.getElementById(toggle.dataset.toggle);
        el.style.display = el.style.display === "block" ? "none" : "block";

        if (toggle.dataset.toggle === "source") {
            if (el.style.display === "block") {
                html.style.height = "";
                formatted.style.height = "";
            } else {
                html.style.height =
                    html.querySelector("header").offsetHeight + "px";
                formatted.style.height =
                    editor.offsetHeight - html.offsetHeight + "px";
            }
        }
    })
);
