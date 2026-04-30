import { describe, it, expect, beforeEach } from 'vitest';
import { nextMonday, template } from '../src/utils/music-monday';

describe('nextMonday', () => {
  it('returns a Monday', () => {
    const { dayYmd } = nextMonday();
    const [year, month, day] = dayYmd.split('-').map(Number);
    // Construct in local time to avoid UTC midnight timezone shift
    expect(new Date(year, month - 1, day).getDay()).toBe(1);
  });

  it('returns dayYmd in YYYY-MM-DD format', () => {
    const { dayYmd } = nextMonday();
    expect(dayYmd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns dayYmdHs containing time 11:45', () => {
    const { dayYmdHs } = nextMonday();
    expect(dayYmdHs).toContain('11:45');
  });

  it('returns dayYmdT starting with the same date as dayYmd', () => {
    const { dayYmd, dayYmdT } = nextMonday();
    expect(dayYmdT).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(dayYmdT.startsWith(dayYmd)).toBe(true);
  });

  it('returns a date that is today or in the future', () => {
    const { dayYmd } = nextMonday();
    const [year, month, day] = dayYmd.split('-').map(Number);
    const result = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(result.getTime()).toBeGreaterThanOrEqual(today.getTime());
  });
});

describe('template.text', () => {
  beforeEach(() => {
    template.postDateYmd = '2026-05-05';
    template.postDateAtom = '2026-05-05T11:45:00-07:00';
    template.title = 'Test Song';
    template.titleFriendly = 'test-song';
    template.titleUrl = 'http://example.com/song';
    template.originalArtist = 'Original Artist';
    template.originalArtistUrl = 'http://example.com/original';
    template.originalAlbum = 'Original Album';
    template.originalAlbumUrl = 'http://example.com/album';
    template.originalYear = 1999;
    template.originalVideoId = 'origVidId';
    template.coverArtist = 'Cover Artist';
    template.coverArtistUrl = 'http://example.com/cover';
    template.coverAlbum = 'Cover Album';
    template.coverAlbumUrl = 'http://example.com/coveralbum';
    template.coverYear = 2024;
    template.coverVideoId = 'coverVidId';
    template.complementaryText = '';
  });

  it('includes the post date in the output', () => {
    expect(template.text()).toContain('2026-05-05');
  });

  it('includes the title', () => {
    expect(template.text()).toContain('Test Song');
  });

  it('includes the original and cover artist', () => {
    const text = template.text();
    expect(text).toContain('Original Artist');
    expect(text).toContain('Cover Artist');
  });

  it('includes YouTube embed URLs for both videos', () => {
    const text = template.text();
    expect(text).toContain('youtube.com/embed/origVidId');
    expect(text).toContain('youtube.com/embed/coverVidId');
  });

  it('includes complementary text when provided', () => {
    template.complementaryText = 'Some extra context.';
    expect(template.text()).toContain('Some extra context.');
  });

  it('generates Jekyll frontmatter delimiters', () => {
    const text = template.text();
    expect(text.startsWith('---')).toBe(true);
  });

  it('includes the title-friendly slug in the filename line', () => {
    expect(template.text()).toContain('2026-05-05-test-song.md');
  });
});
