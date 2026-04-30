import sanitize from 'sanitize-html';

export const cleanHtml = (html: string): string => {
  return sanitize(html, {
    allowedTags: sanitize.defaults.allowedTags.concat(['h1', 'h2', 'del']),
    allowedAttributes: Object.assign(
      { '*': ['class', 'style'] },
      sanitize.defaults.allowedAttributes,
    ),
  })
    .trim()
    .replace(/&amp;nbsp;/g, '&nbsp;');
};
