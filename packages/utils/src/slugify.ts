const COMBINING_DIACRITICS = /[̀-ͯ]/g;
const NON_ALPHANUMERIC_RUN = /[^a-z0-9]+/g;

export function slugify(input: string): string {
  const collapsed = input
    .normalize('NFKD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
    .trim()
    .replace(NON_ALPHANUMERIC_RUN, '-');

  let start = 0;
  let end = collapsed.length;
  while (start < end && collapsed[start] === '-') start++;
  while (end > start && collapsed[end - 1] === '-') end--;

  return collapsed.slice(start, end).slice(0, 120);
}
