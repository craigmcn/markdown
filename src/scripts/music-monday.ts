import { nextMonday, template } from '../utils/music-monday';

document.addEventListener('DOMContentLoaded', () => {
  const defaultYear = new Date().getFullYear();
  const { dayYmd, dayYmdHs, dayYmdT } = nextMonday();

  (document.getElementById('date') as HTMLInputElement).value = dayYmdHs;
  template.postDateYmd = dayYmd;
  template.postDateAtom = dayYmdT;
  (document.getElementById('coverYear') as HTMLInputElement).value =
    String(defaultYear);
  (document.getElementById('originalYear') as HTMLInputElement).value =
    String(defaultYear);
  (document.getElementById('markdown') as HTMLElement).innerHTML =
    template.text();
});

document.getElementById('generate')?.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  const postDate = new Date(target.value);
  const postDateArray = !isNaN(postDate.getTime())
    ? postDate.toString().split(' ')
    : new Date().toString().split(' ');

  switch (target.id) {
    case 'title':
      template.title = target.value.trim();
      template.titleFriendly = template.title
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace('--', '-');
      break;
    case 'date':
      template.postDateYmd = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}-${String(postDate.getDate()).padStart(2, '0')}`;
      template.postDateAtom = `${template.postDateYmd}T${postDateArray[4]}${postDateArray[5].substring(3)}`;
      break;
    case 'originalVideo':
    case 'coverVideo':
      template[`${target.id}Id` as 'originalVideoId' | 'coverVideoId'] =
        target.value.split('/').reverse()[0];
      break;
    default:
      if (Object.keys(template).includes(target.id)) {
        (template as Record<string, string | number>)[target.id] =
          target.value.trim();
      }
  }

  (document.getElementById('markdown') as HTMLElement).innerHTML =
    template.text();
});
