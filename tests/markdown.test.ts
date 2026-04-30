import { describe, it, expect } from 'vitest';
import { cleanHtml } from '../src/utils/markdown';

describe('cleanHtml', () => {
  it('passes through safe block elements unchanged', () => {
    expect(cleanHtml('<p>Hello world</p>')).toBe('<p>Hello world</p>');
  });

  it('strips script tags', () => {
    expect(cleanHtml('<script>alert("xss")</script><p>text</p>')).toBe(
      '<p>text</p>',
    );
  });

  it('strips event handler attributes', () => {
    expect(cleanHtml('<p onclick="alert()">text</p>')).toBe('<p>text</p>');
  });

  it('allows h1 (added beyond sanitize-html defaults)', () => {
    expect(cleanHtml('<h1>Heading</h1>')).toBe('<h1>Heading</h1>');
  });

  it('allows h2 (added beyond sanitize-html defaults)', () => {
    expect(cleanHtml('<h2>Heading</h2>')).toBe('<h2>Heading</h2>');
  });

  it('allows del tags (added beyond sanitize-html defaults)', () => {
    expect(cleanHtml('<del>deleted text</del>')).toBe(
      '<del>deleted text</del>',
    );
  });

  it('allows class attributes on any element', () => {
    expect(cleanHtml('<p class="foo">text</p>')).toBe(
      '<p class="foo">text</p>',
    );
  });

  it('allows style attributes on any element', () => {
    expect(cleanHtml('<p style="color:red">text</p>')).toBe(
      '<p style="color:red">text</p>',
    );
  });

  it('normalises &amp;nbsp; to &nbsp;', () => {
    expect(cleanHtml('<p>hello&amp;nbsp;world</p>')).toBe(
      '<p>hello&nbsp;world</p>',
    );
  });

  it('trims surrounding whitespace', () => {
    expect(cleanHtml('  <p>text</p>  ')).toBe('<p>text</p>');
  });

  it('handles empty string', () => {
    expect(cleanHtml('')).toBe('');
  });
});
