// Shared helpers for the affiliate dossier UIs and cards.

export const ytId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
};

// Projects that can be shown as video thumbnails ("[...]" titles are placeholders).
export const getWorks = (projects) =>
  (projects || []).filter((q) => ytId(q.url) && !q.title.startsWith('['));

// "Lead Vocalist / Mix Engineer" -> ["lead-vocalist", "mix-engineer"]
export const toTags = (role) =>
  (role || '')
    .split('/')
    .map((r) => r.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean);

const COUNTRY_FLAGS = {
  japan: 'jp', japanese: 'jp',
  usa: 'us', us: 'us', 'united states': 'us', american: 'us',
  canada: 'ca', canadian: 'ca',
  uk: 'gb', 'united kingdom': 'gb', british: 'gb', england: 'gb',
  australia: 'au', australian: 'au',
  philippines: 'ph', filipino: 'ph',
  china: 'cn', chinese: 'cn',
  taiwan: 'tw', taiwanese: 'tw',
  'south korea': 'kr', korea: 'kr', korean: 'kr',
  indonesia: 'id', indonesian: 'id',
  malaysia: 'my', malaysian: 'my',
  singapore: 'sg', singaporean: 'sg',
  thailand: 'th', thai: 'th',
  vietnam: 'vn', vietnamese: 'vn',
  germany: 'de', german: 'de',
  france: 'fr', french: 'fr',
  russia: 'ru', russian: 'ru',
  brazil: 'br', brazilian: 'br',
  mexico: 'mx', mexican: 'mx',
  argentina: 'ar', argentinian: 'ar',
  spain: 'es', spanish: 'es',
  italy: 'it', italian: 'it',
  netherlands: 'nl', dutch: 'nl',
  poland: 'pl', polish: 'pl',
  sweden: 'se', swedish: 'se',
  norway: 'no', norwegian: 'no',
  finland: 'fi', finnish: 'fi',
  denmark: 'dk', danish: 'dk',
  'new zealand': 'nz', kiwi: 'nz',
  india: 'in', indian: 'in',
  'sri lanka': 'lk', 'sri lankan': 'lk',
  venezuela: 've', venezuelan: 've',
  estonia: 'ee', estonian: 'ee',
  'hong kong': 'hk',
  'puerto rico': 'pr', 'puerto rican': 'pr',
};

export const getFlagCode = (str) => COUNTRY_FLAGS[str.trim().toLowerCase()] || null;
