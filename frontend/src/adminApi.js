const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const ADMIN_TOKEN_KEY = 'cineregal-admin-token';
const REQUEST_TIMEOUT_MS = 15000;

const apiUnavailable = () => {
  const error = new Error('API unavailable. Start the backend with `npm run dev` and try again.');
  error.code = 'API_UNAVAILABLE';
  return error;
};

const request = async (path, options = {}) => {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('The administrator service did not respond in time. Check that the backend is running, then try again.');
      timeoutError.code = 'API_TIMEOUT';
      throw timeoutError;
    }
    if (error instanceof TypeError) throw apiUnavailable();
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
  let result;
  try {
    result = await response.json();
  } catch {
    if ([502, 503, 504].includes(response.status)) throw apiUnavailable();
    throw new Error('The server returned an invalid response. Please try again.');
  }
  if (!response.ok) {
    const error = new Error(result.message || 'The administrator request could not be completed');
    error.status = response.status;
    error.code = result.code;
    throw error;
  }
  return result;
};

const paramsToQuery = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  return query.toString();
};

const jsonRequest = (method, body) => ({
  method,
  body: JSON.stringify(body),
});

const wikipediaJson = async (params) => {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  Object.entries({ ...params, format: 'json', origin: '*' }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Wikipedia returned HTTP ${response.status}`);
  return response.json();
};

const cleanWikiText = (value = '') => String(value)
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<ref\b[^>]*>[\s\S]*?<\/ref\s*>/gi, '')
  .replace(/<ref\b[^>]*\/>/gi, '')
  .replace(/<br\s*\/?\s*>/gi, ', ')
  .replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?\|([^\]]+)\]\]/g, '$2')
  .replace(/\[\[([^\]]+)\]\]/g, '$1')
  .replace(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/gi, '$1')
  .replace(/\{\{[^{}]*\}\}/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/'{2,5}/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const wikipediaInfoboxField = (wikitext, aliases) => {
  const start = wikitext.search(/\{\{\s*Infobox\s+(?:film|movie)\b/i);
  if (start < 0) return '';
  const infobox = wikitext.slice(start, start + 18000);
  const field = new RegExp(`\\n\\|[ \\t]*(?:${aliases})[ \\t]*=([\\s\\S]*?)(?=\\n\\|[ \\t]*[^\\n=]+?\\s*=|\\n\\}\\})`, 'i').exec(infobox);
  return field?.[1]?.trim() || '';
};

const wikipediaNames = (value) => {
  const linked = [...value.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g)]
    .map((match) => cleanWikiText(match[2] || match[1]))
    .filter(Boolean);
  const names = linked.length ? linked : cleanWikiText(value).split(/,|\n/).map((name) => name.trim());
  return [...new Set(names.filter((name) => name && !/^\d+\s*(?:min|minutes?)$/i.test(name)))].slice(0, 12);
};

const searchWikipedia = async (query) => {
  const payload = await wikipediaJson({
    action: 'query',
    list: 'search',
    srsearch: query,
    srnamespace: '0',
    srlimit: '10',
  });
  const results = payload.query?.search || [];
  return {
    success: true,
    source: 'Wikipedia',
    data: results.map((page) => ({
      id: `wiki-${page.pageid}`,
      source: 'Wikipedia',
      title: page.title,
      overview: String(page.snippet || '').replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&'),
      releaseDate: '',
      poster: '',
    })),
  };
};

const getWikipediaMovie = async (id) => {
  const pageId = id.slice('wiki-'.length);
  const payload = await wikipediaJson({
    action: 'query',
    pageids: pageId,
    prop: 'extracts|pageimages|info|revisions',
    exintro: '1',
    explaintext: '1',
    pithumbsize: '1200',
    piprop: 'thumbnail|original',
    inprop: 'url',
    rvprop: 'ids|content',
    rvslots: 'main',
    formatversion: '2',
  });
  const page = payload.query?.pages?.[0];
  if (!page || page.missing !== undefined) throw new Error('That Wikipedia film page could not be found.');
  const releaseYearFromExtract = String(page.extract || '').match(/\b(?:18|19|20)\d{2}\b/)?.[0] || '';
  const wikitext = page.revisions?.[0]?.slots?.main?.content || '';
  const release = cleanWikiText(wikipediaInfoboxField(wikitext, 'released|release_date|release date'));
  const releaseDateValue = Date.parse(release);
  const releaseDate = Number.isNaN(releaseDateValue) ? '' : new Date(releaseDateValue).toISOString().slice(0, 10);
  const releaseYear = releaseDate.slice(0, 4) || release.match(/\b(?:18|19|20)\d{2}\b/)?.[0] || releaseYearFromExtract;
  const rawRuntime = cleanWikiText(wikipediaInfoboxField(wikitext, 'runtime|running_time|running time'));
  const duration = rawRuntime.match(/\d+\s*(?:hours?|hrs?)(?:\s*\d+\s*(?:minutes?|mins?))?|\d+\s*(?:minutes?|mins?)/i)?.[0] || rawRuntime;
  const genre = wikipediaNames(wikipediaInfoboxField(wikitext, 'genre|genres')).join(' · ');
  const director = wikipediaNames(wikipediaInfoboxField(wikitext, 'director|directors')).join(', ');
  const cast = wikipediaNames(wikipediaInfoboxField(wikitext, 'starring|cast'));
  const revisionId = page.revisions?.[0]?.revid;
  const sourceUrl = revisionId
    ? `https://en.wikipedia.org/w/index.php?curid=${page.pageid}&oldid=${revisionId}`
    : page.fullurl;
  const poster = page.original?.source || page.thumbnail?.source || '';
  const posterSourceUrl = page.pageimage
    ? `https://en.wikipedia.org/wiki/File:${encodeURIComponent(String(page.pageimage).replace(/ /g, '_'))}`
    : sourceUrl;
  return {
    success: true,
    source: 'Wikipedia',
    data: {
      metadataSource: 'wikipedia',
      sourceUrl: sourceUrl || `https://en.wikipedia.org/?curid=${page.pageid}`,
      posterSourceUrl,
      wikipediaPageId: page.pageid,
      title: page.title,
      description: String(page.extract || '').replace(/\s+/g, ' ').trim(),
      year: releaseYear,
      release: release || releaseYear,
      releaseDate,
      genre,
      duration,
      director,
      cast,
      poster,
      backdrop: page.original?.source || poster,
      rating: '',
      published: false,
      featured: false,
    },
  };
};

export const adminApi = {
  tokenKey: ADMIN_TOKEN_KEY,

  async login(loginId, password) {
    const result = await request('/admin/auth/login', {
      ...jsonRequest('POST', { loginId, password }),
      headers: {},
    });
    sessionStorage.setItem(ADMIN_TOKEN_KEY, result.token);
    return result.user;
  },

  me() {
    return request('/admin/auth/me');
  },

  overview() {
    return request('/admin/overview');
  },

  list(resource, params = {}) {
    const query = paramsToQuery(params);
    return request(`/admin/${resource}${query ? `?${query}` : ''}`);
  },

  createMovie(data) {
    return request('/admin/movies', jsonRequest('POST', data));
  },

  updateMovie(id, data) {
    return request(`/admin/movies/${encodeURIComponent(id)}`, jsonRequest('PUT', data));
  },

  deleteMovie(id) {
    return request(`/admin/movies/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  searchImport(query) {
    return searchWikipedia(query)
      .then((result) => result.data.length ? result : request(`/admin/import/search?${paramsToQuery({ q: query })}`))
      .catch(() => request(`/admin/import/search?${paramsToQuery({ q: query })}`));
  },

  getImportedMovie(id) {
    if (id.startsWith('wiki-')) return getWikipediaMovie(id);
    return request(`/admin/import/${encodeURIComponent(id)}`);
  },

  setReviewStatus(id, status) {
    return request(`/admin/reviews/${encodeURIComponent(id)}`, jsonRequest('PATCH', { status }));
  },

  deleteReview(id) {
    return request(`/admin/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  setSupportStatus(id, status) {
    return request(`/admin/support/${encodeURIComponent(id)}`, jsonRequest('PATCH', { status }));
  },

  setBookingRefundStatus(id, status) {
    return request(`/admin/bookings/${encodeURIComponent(id)}/refund`, jsonRequest('PATCH', { status }));
  },
};

export default adminApi;
