import './polyfill-nodelist-foreach'
import '../styles/index.scss'

const showdown = require('showdown'),
  sanitize = require('sanitize-html'),
  converter = new showdown.Converter({
    simpleLineBreaks: true,
    strikethrough: true,
    tables: true
  }),
  editor = document.getElementById('editor').querySelector('[contenteditable]'),
  formatted = document.getElementById('content'),
  source = document.getElementById('source')

editor.addEventListener('input', e => {
  const html = converter.makeHtml(e.target.innerText),
    clean = sanitize(html, {
      allowedTags: sanitize.defaults.allowedTags.concat(['h1', 'h2', 'del']),
      allowedAttributes: Object.assign(
        { '*': ['class', 'style'] },
        sanitize.defaults.allowedAttributes
      )
    })
      .trim()
      .replace(/&amp;nbsp;/g, '&nbsp;')
  formatted.innerHTML = clean
  source.innerHTML = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')

  if (document.getElementById('formatted').style.height) {
    document.getElementById('formatted').style.height = '' //reset height, then recalculate
    document.getElementById('formatted').style.height =
      document.getElementById('editor').offsetHeight -
      document.getElementById('html').offsetHeight +
      'px'
  }
})

document.querySelectorAll('.js-isToggle').forEach(i =>
  i.addEventListener('click', e => {
    e.preventDefault()
    let toggle
    if (e.target.classList.contains('js-isToggle')) {
      toggle = e.target
    } else {
      toggle = e.target.closest('.js-isToggle')
    }
    if (toggle.dataset.icon === 'true') {
      const icon = toggle.querySelector('[data-fa-i2svg]')
      if (toggle.dataset.toggleOn && toggle.dataset.toggleOff) {
        if (icon.classList.contains(toggle.dataset.toggleOn)) {
          icon.classList.replace(
            toggle.dataset.toggleOn,
            toggle.dataset.toggleOff
          )
        } else {
          icon.classList.replace(
            toggle.dataset.toggleOff,
            toggle.dataset.toggleOn
          )
        }
      }
    } else {
      if (toggle.dataset.toggleOn && toggle.dataset.toggleOff) {
        if (toggle.innerText === toggle.dataset.toggleOn) {
          toggle.innerText === toggle.dataset.toggleOff
        } else {
          toggle.innerText === toggle.dataset.toggleOn
        }
      }
    }
    const el = document.getElementById(toggle.dataset.toggle)
    el.style.display = el.style.display === 'block' ? 'none' : 'block'

    if (toggle.dataset.toggle === 'source') {
      if (el.style.display === 'block') {
        document.getElementById('html').style.height = ''
        document.getElementById('formatted').style.height = ''
      } else {
        document.getElementById('html').style.height =
          document.getElementById('html').querySelector('header').offsetHeight +
          'px'
        document.getElementById('formatted').style.height =
          document.getElementById('editor').offsetHeight -
          document.getElementById('html').offsetHeight +
          'px'
      }
    }
  })
)
