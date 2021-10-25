ready(() => {
    const defaultYear = new Date().getFullYear()
    const {
        dayYmd,
        dayYmdHs,
        dayYmdT,
    } = nextMonday()
    document.getElementById('date').value = dayYmdHs
    template.postDateYmd = dayYmd
    template.postDateAtom = dayYmdT
    document.getElementById('coverYear').value = defaultYear
    document.getElementById('originalYear').value = defaultYear
    document.getElementById('markdown').innerHTML = template.text()
})

document.getElementById('generate').addEventListener('input', (e) => {
    const postDate = new Date(e.target.value)
    const postDateArray =
            postDate !== 'Invalid Date'
                ? postDate.toString().split(' ')
                : Date.now.toString().split(' ')

    switch (e.target.id) {
        case 'title':
            template.title = e.target.value.trim()
            template.titleFriendly = template.title
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .replace('--', '-')
            break
        case 'date':
            template.postDateYmd = `${postDate.getFullYear()}-${(
                postDate.getMonth() +
        1 +
        ''
            ).padStart(2, 0)}-${(postDate.getDate() + '').padStart(2, 0)}`
            template.postDateAtom = `${template.postDateYmd}T${
                postDateArray[4]
            }${postDateArray[5].substr(3)}` // 2018-09-17T04:45:00-07:00
            break
        case 'originalVideo': // fallthrough
        case 'coverVideo':
            template[e.target.id + 'Id'] = e.target.value.split('/').reverse()[0]
            break
        default:
            if (Object.keys(template).includes(e.target.id)) {
                template[e.target.id] = e.target.value.trim()
            }
    }
    document.getElementById('markdown').innerHTML = template.text()
})

function ready (fn) {
    if (
        document.attachEvent
            ? document.readyState === 'complete'
            : document.readyState !== 'loading'
    ) {
        fn()
    } else {
        document.addEventListener('DOMContentLoaded', fn)
    }
}

const nextMonday = () => {
    const now = new Date()
    const x = now.getDay()
    const days = x > 1 ? 8 - x : x === 1 ? 0 : 1
    const day = new Date()
    day.setDate(now.getDate() + days)
    day.setHours(11)
    day.setMinutes(45)
    day.setSeconds(0)
    const dayArray = day.toString().split(' ')
    const dayYmd = `${day.getFullYear()}-${(day.getMonth() + 1 + '').padStart(
        2,
        0,
    )}-${(day.getDate() + '').padStart(2, 0)}`
    const dayYmdHs = `${dayYmd} ${day.getHours()}:${day.getMinutes()}`
    const dayYmdT = `${dayYmd}T${dayArray[4]}${dayArray[5].substr(3)}`
    return {
        dayYmd,
        dayYmdHs,
        dayYmdT,
    }
}

const template = {
    title: 'TITLE',
    titleFriendly: 'title-friendly',
    titleUrl: 'http://example.com',
    postDateYmd: 'YYYY-MM-DD',
    postDateAtom: 'YYYY-MM-DDTHH:MM:SSO', // e.g., 2018-09-17T04:45:00-07:00
    originalYear: new Date().getFullYear(),
    originalArtist: 'ORIGINAL ARTIST',
    originalArtistUrl: 'http://example.com',
    originalAlbum: 'ORIGINAL ALBUM',
    originalAlbumUrl: 'http://example.com',
    originalVideoId: 'ORIGINAL_ID',
    coverYear: new Date().getFullYear(),
    coverArtist: 'COVER ARTIST',
    coverArtistUrl: 'http://example.com',
    coverAlbum: 'COVER ALBUM',
    coverAlbumUrl: 'http://example.com',
    coverVideoId: 'COVER_ID',
    complementaryText: '',
    text () {
        return `---
${this.postDateYmd}-${this.titleFriendly}.md
---
title: "${this.title}"
date: ${this.postDateAtom}
excerpt: "This week’s instalment of Music Monday is ${this.title}. The ${this.originalYear} ${this.originalArtist} original and a ${this.coverYear} cover by ${this.coverArtist}."
layout: post
categories:
- People
- Music Monday
tags:
- covers
- music
- video
- ${this.originalArtist}
- ${this.coverArtist}
---
This week’s instalment of Music Monday is [_${this.title}_](${this.titleUrl}) by
[${this.originalArtist}](${this.originalArtistUrl}) from their ${this.originalYear} album,
[${this.originalAlbum}](${this.originalAlbumUrl}). The [${this.coverArtist}](${this.coverArtistUrl})
version is from their ${this.coverYear} album, [${this.coverAlbum}](${this.coverAlbumUrl}).

${this.complementaryText}

&lt;div class="video-container"&gt;
&lt;iframe width="560" height="315" src="https://www.youtube.com/embed/${this.originalVideoId}" frameborder="0" allowfullscreen title="Video: ${this.title} by ${this.originalArtist}"&gt;&lt;/iframe&gt;
&lt;/div&gt;

&lt;div class="video-container"&gt;
&lt;iframe width="560" height="315" src="https://www.youtube.com/embed/${this.coverVideoId}" frameborder="0" allowfullscreen title="Video: ${this.title} by ${this.coverArtist}"&gt;&lt;/iframe&gt;
&lt;/div&gt;
---
${this.title}: The ${this.originalYear} ${this.originalArtist} original and a ${this.coverYear} cover by ${this.coverArtist} #musicmonday https://craigmcn.ca/${this.titleFriendly}.html`
    },
}
