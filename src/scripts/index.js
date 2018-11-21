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

document.querySelectorAll('[data-toggle]').forEach(i =>
  i.addEventListener('click', e => {
    e.preventDefault()
    const el = document.getElementById(e.target.dataset.toggle)
    el.style.display = el.style.display === 'block' ? 'none' : 'block'

    if (e.target.dataset.toggle === 'source') {
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
