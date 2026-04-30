export interface MusicMondayDates {
  dayYmd: string;
  dayYmdHs: string;
  dayYmdT: string;
}

export const nextMonday = (): MusicMondayDates => {
  const now = new Date();
  const x = now.getDay();
  const days = x > 1 ? 8 - x : x === 1 ? 0 : 1;
  const day = new Date();
  day.setDate(now.getDate() + days);
  day.setHours(11);
  day.setMinutes(45);
  day.setSeconds(0);
  const dayArray = day.toString().split(' ');
  const dayYmd = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  const dayYmdHs = `${dayYmd} ${day.getHours()}:${day.getMinutes()}`;
  const dayYmdT = `${dayYmd}T${dayArray[4]}${dayArray[5].substring(3)}`;
  return { dayYmd, dayYmdHs, dayYmdT };
};

export interface MusicMondayTemplate {
  title: string;
  titleFriendly: string;
  titleUrl: string;
  postDateYmd: string;
  postDateAtom: string;
  originalYear: string | number;
  originalArtist: string;
  originalArtistUrl: string;
  originalAlbum: string;
  originalAlbumUrl: string;
  originalVideoId: string;
  coverYear: string | number;
  coverArtist: string;
  coverArtistUrl: string;
  coverAlbum: string;
  coverAlbumUrl: string;
  coverVideoId: string;
  complementaryText: string;
  text(): string;
}

export const template: MusicMondayTemplate = {
  title: 'TITLE',
  titleFriendly: 'title-friendly',
  titleUrl: 'http://example.com',
  postDateYmd: 'YYYY-MM-DD',
  postDateAtom: 'YYYY-MM-DDTHH:MM:SSO',
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
  text() {
    return `---
${this.postDateYmd}-${this.titleFriendly}.md
---
title: "${this.title}"
date: ${this.postDateAtom}
excerpt: "This week's instalment of Music Monday is ${this.title}. The ${this.originalYear} ${this.originalArtist} original and a ${this.coverYear} cover by ${this.coverArtist}."
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
This week's instalment of Music Monday is [_${this.title}_](${this.titleUrl}) by
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
${this.title}: The ${this.originalYear} ${this.originalArtist} original and a ${this.coverYear} cover by ${this.coverArtist} #musicmonday https://craigmcn.ca/${this.titleFriendly}.html`;
  },
};
