import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Booking from '../models/Booking.js';
import Feedback from '../models/Feedback.js';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import AdminAction from '../models/AdminAction.js';
import { getDBStatus } from '../config/db.js';

const asyncHandler = (handler) => (req, res, next) => (
  Promise.resolve(handler(req, res, next)).catch(next)
);

const requireDatabase = (res) => {
  if (getDBStatus()) return true;
  res.status(503).json({
    success: false,
    message: 'Admin data requires a connected MongoDB database',
  });
  return false;
};

const pageOptions = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const queryText = (value) => (
  typeof value === 'string' ? value.trim().slice(0, 100) : ''
);

const writeAdminAction = (req, action, entity, entityId, details = {}) => (
  AdminAction.create({
    admin: req.user._id,
    action,
    entity,
    entityId: String(entityId),
    details,
  })
);

const toMovieData = (body) => {
  const fields = [
    'imdb', 'tmdbId', 'wikidataId', 'metadataSource', 'sourceUrl', 'posterSourceUrl', 'wikipediaPageId', 'title', 'genre', 'year', 'release', 'releaseDate',
    'rating', 'duration', 'format', 'poster', 'backdrop', 'trailer',
    'director', 'description', 'featured', 'published',
  ];
  const data = {};
  fields.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });

  if (body.cast !== undefined) {
    data.cast = Array.isArray(body.cast)
      ? body.cast.map((name) => String(name).trim()).filter(Boolean)
      : String(body.cast).split(/[,;\n]/).map((name) => name.trim()).filter(Boolean);
  }
  if (data.title !== undefined) data.title = String(data.title).trim();
  if (data.releaseDate) {
    const releaseDate = new Date(data.releaseDate);
    if (Number.isNaN(releaseDate.getTime())) {
      const error = new Error('Release date must be a valid date');
      error.statusCode = 400;
      throw error;
    }
    data.releaseDate = releaseDate;
    if (!data.year) data.year = String(releaseDate.getUTCFullYear());
    if (!data.release) data.release = releaseDate.toISOString().slice(0, 10);
  } else if (data.releaseDate === '') {
    data.releaseDate = null;
  }
  if (data.tmdbId !== undefined && data.tmdbId !== null && data.tmdbId !== '') {
    data.tmdbId = Number(data.tmdbId);
    if (!Number.isInteger(data.tmdbId) || data.tmdbId < 1) {
      const error = new Error('TMDB ID must be a positive integer');
      error.statusCode = 400;
      throw error;
    }
  } else {
    delete data.tmdbId;
  }
  if (data.wikidataId !== undefined) {
    data.wikidataId = String(data.wikidataId).trim();
    if (data.wikidataId && !/^Q\d+$/.test(data.wikidataId)) {
      const error = new Error('Wikidata ID must be a valid Q-ID');
      error.statusCode = 400;
      throw error;
    }
    if (!data.wikidataId) delete data.wikidataId;
  }
  if (data.wikipediaPageId !== undefined && data.wikipediaPageId !== null && data.wikipediaPageId !== '') {
    data.wikipediaPageId = Number(data.wikipediaPageId);
    if (!Number.isInteger(data.wikipediaPageId) || data.wikipediaPageId < 1) {
      const error = new Error('Wikipedia page ID must be a positive integer');
      error.statusCode = 400;
      throw error;
    }
  } else {
    delete data.wikipediaPageId;
  }

  ['featured', 'published'].forEach((field) => {
    if (data[field] !== undefined) data[field] = data[field] === true || data[field] === 'true';
  });
  return data;
};

const findMovie = (id) => {
  const conditions = [];
  if (/^\d+$/.test(id)) conditions.push({ id: Number(id) });
  if (/^[0-9a-fA-F]{24}$/.test(id)) conditions.push({ _id: id });
  return conditions.length ? Movie.findOne({ $or: conditions }) : null;
};

const fetchPublicJson = async (url, source, allowNotFound = false) => {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CineRegal/1.0 (open movie metadata import)',
      },
      signal: AbortSignal.timeout(12000),
    });
  } catch (cause) {
    const error = new Error(`${source} is temporarily unavailable. You can still add the film by entering its details manually.`);
    error.statusCode = 502;
    error.code = cause.name === 'TimeoutError' ? 'METADATA_TIMEOUT' : 'METADATA_UNAVAILABLE';
    throw error;
  }
  if (allowNotFound && response.status === 404) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `${source} could not complete the request`);
    error.statusCode = 502;
    throw error;
  }
  return payload;
};

const fetchWikidataEntities = async (ids) => {
  if (!ids.length) return {};
  const url = new URL('https://www.wikidata.org/w/api.php');
  url.searchParams.set('action', 'wbgetentities');
  url.searchParams.set('ids', ids.join('|'));
  url.searchParams.set('props', 'labels');
  url.searchParams.set('languages', 'en');
  url.searchParams.set('format', 'json');
  const payload = await fetchPublicJson(url, 'Wikidata');
  return payload.entities || {};
};

const searchWikipediaMovies = async (query) => {
  const url = new URL('https://en.wikipedia.org/w/rest.php/v1/search/page');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '10');
  const payload = await fetchPublicJson(url, 'Wikipedia');
  return (payload.pages || []).filter((page) => /\b(film|movie)\b/i.test(`${page.description || ''} ${page.excerpt || ''}`)).map((page) => ({
    id: `wiki-${page.id}`,
    source: 'Wikipedia',
    title: page.title,
    overview: page.description || page.excerpt?.replace(/<[^>]*>/g, '') || '',
    releaseDate: '',
    poster: page.thumbnail?.url || '',
  }));
};

const cleanWikipediaText = (value = '') => String(value)
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<ref\b[^>]*>[\s\S]*?<\/ref\s*>/gi, '')
  .replace(/<ref\b[^>]*\/>/gi, '')
  .replace(/<br\s*\/?\s*>/gi, ', ')
  .replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?\|([^\]]+)\]\]/g, '$2')
  .replace(/\[\[([^\]]+)\]\]/g, '$1')
  .replace(/\{\{[^{}]*\}\}/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/'{2,5}/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getWikipediaInfoboxField = (wikitext, aliases) => {
  const start = wikitext.search(/\{\{\s*Infobox\s+(?:film|movie)\b/i);
  if (start < 0) return '';
  const infobox = wikitext.slice(start, start + 18000);
  const field = new RegExp(`\\n\\|[ \\t]*(?:${aliases})[ \\t]*=([\\s\\S]*?)(?=\\n\\|[ \\t]*[^\\n=]+?\\s*=|\\n\\}\\})`, 'i').exec(infobox);
  return field?.[1]?.trim() || '';
};

const getWikipediaNames = (value) => {
  const linked = [...value.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g)]
    .map((match) => cleanWikipediaText(match[2] || match[1]))
    .filter(Boolean);
  const names = linked.length ? linked : cleanWikipediaText(value).split(/,|\n/).map((name) => name.trim());
  return [...new Set(names.filter((name) => name && !/^\d+\s*(?:min|minutes?)$/i.test(name)))].slice(0, 12);
};

const getWikipediaMovieData = async (pageId) => {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('pageids', String(pageId));
  url.searchParams.set('prop', 'extracts|pageimages|info|revisions');
  url.searchParams.set('exintro', '1');
  url.searchParams.set('explaintext', '1');
  url.searchParams.set('pithumbsize', '1200');
  url.searchParams.set('piprop', 'thumbnail|original');
  url.searchParams.set('inprop', 'url');
  url.searchParams.set('rvprop', 'ids|content');
  url.searchParams.set('rvslots', 'main');
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatversion', '2');
  const payload = await fetchPublicJson(url, 'Wikipedia');
  const page = payload.query?.pages?.[0];
  if (!page || page.missing !== undefined) {
    const error = new Error('That Wikipedia film page could not be found.');
    error.statusCode = 404;
    throw error;
  }
  const extract = String(page.extract || '').replace(/\s+/g, ' ').trim();
  const wikitext = page.revisions?.[0]?.slots?.main?.content || '';
  const release = cleanWikipediaText(getWikipediaInfoboxField(wikitext, 'released|release_date|release date'));
  const parsedRelease = Date.parse(release);
  const releaseDate = Number.isNaN(parsedRelease) ? '' : new Date(parsedRelease).toISOString().slice(0, 10);
  const year = releaseDate.slice(0, 4) || release.match(/\b(?:18|19|20)\d{2}\b/)?.[0] || extract.match(/\b(?:18|19|20)\d{2}\b/)?.[0] || '';
  const rawRuntime = cleanWikipediaText(getWikipediaInfoboxField(wikitext, 'runtime|running_time|running time'));
  const duration = rawRuntime.match(/\d+\s*(?:hours?|hrs?)(?:\s*\d+\s*(?:minutes?|mins?))?|\d+\s*(?:minutes?|mins?)/i)?.[0] || rawRuntime;
  const genre = getWikipediaNames(getWikipediaInfoboxField(wikitext, 'genre|genres')).join(' · ');
  const director = getWikipediaNames(getWikipediaInfoboxField(wikitext, 'director|directors')).join(', ');
  const cast = getWikipediaNames(getWikipediaInfoboxField(wikitext, 'starring|cast'));
  const revisionId = page.revisions?.[0]?.revid;
  const sourceUrl = revisionId
    ? `https://en.wikipedia.org/w/index.php?curid=${page.pageid}&oldid=${revisionId}`
    : page.fullurl;
  const poster = page.original?.source || page.thumbnail?.source || '';
  const posterSourceUrl = page.pageimage
    ? `https://en.wikipedia.org/wiki/File:${encodeURIComponent(page.pageimage.replace(/ /g, '_'))}`
    : sourceUrl;
  return {
    metadataSource: 'wikipedia',
    sourceUrl: sourceUrl || `https://en.wikipedia.org/?curid=${page.pageid}`,
    posterSourceUrl,
    wikipediaPageId: page.pageid,
    title: page.title,
    description: extract,
    year,
    release: release || year,
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
  };
};

const getMovieClaims = (entity, property) => (
  (entity.claims?.[property] || [])
    .filter((claim) => claim.rank !== 'deprecated' && claim.mainsnak?.snaktype === 'value')
    .map((claim) => claim.mainsnak.datavalue?.value)
    .filter((value) => value !== undefined && value !== null)
);

const getWikidataItemIds = (entity, property, limit = 10) => (
  getMovieClaims(entity, property)
    .map((value) => value.id)
    .filter((id) => typeof id === 'string' && /^Q\d+$/.test(id))
    .slice(0, limit)
);

const getWikidataImageUrl = (file) => (
  typeof file === 'string' && file.trim()
    ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.trim())}?width=1200`
    : ''
);

const formatReleaseDate = (releaseDate) => (
  releaseDate
    ? new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${releaseDate}T00:00:00Z`))
    : ''
);

export const adminLogin = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'JWT_SECRET must be configured before administrator access is enabled',
    });
  }
  if (!requireDatabase(res)) return;
  const { loginId, password } = req.body;
  if (typeof loginId !== 'string' || typeof password !== 'string' || !loginId.trim() || !password) {
    return res.status(400).json({ success: false, message: 'Login ID and password are required' });
  }

  const adminUser = await User.findOne({
    loginId: loginId.trim().toLowerCase(),
    role: 'admin',
  }).select('+password');

  if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
    return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
  }

  const token = jwt.sign(
    { id: adminUser._id, role: 'admin' },
    process.env.JWT_SECRET || 'cineregal_jwt_super_secret_production_key_2026',
    { expiresIn: process.env.ADMIN_JWT_EXPIRE || '8h' }
  );

  return res.json({
    success: true,
    token,
    user: {
      id: adminUser._id,
      name: adminUser.name,
      loginId: adminUser.loginId,
      role: adminUser.role,
    },
  });
});

export const getAdminMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      loginId: req.user.loginId,
      role: req.user.role,
    },
  });
});

export const getOverview = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const now = new Date();
  const upcomingMovieFilter = { published: { $ne: false }, releaseDate: { $gte: now } };
  const currentMovieFilter = {
    published: { $ne: false },
    $or: [{ releaseDate: { $lte: now } }, { releaseDate: null }],
  };
  const openSupportFilter = { status: { $in: ['new', 'open', 'in_progress', 'reviewed'] } };

  const [
    currentMovies,
    upcomingMovies,
    totalMovies,
    bookings,
    reviewCount,
    openSupportRequests,
    paymentGroups,
  ] = await Promise.all([
    Movie.countDocuments(currentMovieFilter),
    Movie.countDocuments(upcomingMovieFilter),
    Movie.countDocuments(),
    Booking.countDocuments(),
    Review.countDocuments(),
    Feedback.countDocuments(openSupportFilter),
    Booking.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          total: { $sum: { $ifNull: ['$total', 0] } },
        },
      },
    ]),
  ]);

  const payments = {
    paid: { count: 0, total: 0 },
    pending: { count: 0, total: 0 },
    failed: { count: 0, total: 0 },
    refunded: { count: 0, total: 0 },
    demo: { count: 0, total: 0 },
  };
  paymentGroups.forEach((group) => {
    const status = group._id === 'completed' ? 'demo' : group._id;
    if (!payments[status]) return;
    payments[status].count += group.count;
    payments[status].total += group.total;
  });

  return res.json({
    success: true,
    data: {
      movies: { current: currentMovies, upcoming: upcomingMovies, total: totalMovies },
      bookings,
      reviewCount,
      openSupportRequests,
      payments,
    },
  });
});

export const listMovies = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const { page, limit, skip } = pageOptions(req.query);
  const q = queryText(req.query.q);
  const filter = {};
  if (q) filter.$or = [
    { title: { $regex: escapeRegex(q), $options: 'i' } },
    { genre: { $regex: escapeRegex(q), $options: 'i' } },
    { director: { $regex: escapeRegex(q), $options: 'i' } },
  ];
  if (req.query.status === 'published') filter.published = { $ne: false };
  if (req.query.status === 'draft') filter.published = false;
  if (req.query.timing === 'upcoming') filter.releaseDate = { $gte: new Date() };
  if (req.query.timing === 'current') {
    filter.$and = [
      ...(filter.$and || []),
      { $or: [{ releaseDate: { $lte: new Date() } }, { releaseDate: null }] },
    ];
  }

  const [data, total] = await Promise.all([
    Movie.find(filter).sort({ releaseDate: 1, title: 1 }).skip(skip).limit(limit),
    Movie.countDocuments(filter),
  ]);
  return res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const createMovie = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const data = toMovieData(req.body);
  if (!data.title) return res.status(400).json({ success: false, message: 'A movie title is required' });
  const duplicateConditions = [];
  if (data.wikidataId) duplicateConditions.push({ wikidataId: data.wikidataId });
  if (Number.isInteger(data.tmdbId) && data.tmdbId > 0) duplicateConditions.push({ tmdbId: data.tmdbId });
  if (Number.isInteger(data.wikipediaPageId) && data.wikipediaPageId > 0) duplicateConditions.push({ wikipediaPageId: data.wikipediaPageId });
  const existingMovie = duplicateConditions.length
    ? await Movie.findOne({ $or: duplicateConditions }).select('id title')
    : null;
  if (existingMovie) {
    return res.status(409).json({
      success: false,
      message: `${existingMovie.title} is already in the catalogue`,
    });
  }
  const lastMovie = await Movie.findOne().sort({ id: -1 }).select('id');
  data.id = lastMovie ? lastMovie.id + 1 : 1;
  if (data.wikidataId) data.metadataSource = 'wikidata';
  else if (data.tmdbId) data.metadataSource = 'tmdb';
  else if (data.wikipediaPageId) data.metadataSource = 'wikipedia';
  else if (data.metadataSource !== 'wikipedia') delete data.metadataSource;
  if (data.published === undefined) data.published = false;
  const movie = await Movie.create(data);
  await writeAdminAction(req, 'created', 'movie', movie.id, { title: movie.title });
  return res.status(201).json({ success: true, data: movie, message: 'Movie created' });
});

export const updateMovie = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const movie = await findMovie(req.params.id);
  if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
  const data = toMovieData(req.body);
  Object.assign(movie, data);
  await movie.save();
  await writeAdminAction(req, 'updated', 'movie', movie.id, { title: movie.title });
  return res.json({ success: true, data: movie, message: 'Movie updated' });
});

export const deleteMovie = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const movie = await findMovie(req.params.id);
  if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
  const { id, title } = movie;
  await movie.deleteOne();
  await writeAdminAction(req, 'removed', 'movie', id, { title });
  return res.json({ success: true, message: 'Movie removed' });
});

export const searchOpenMovies = asyncHandler(async (req, res) => {
  const q = queryText(req.query.q);
  if (q.length < 2) return res.status(400).json({ success: false, message: 'Enter at least two characters to search' });
  const [wikidataResult, wikipediaResult] = await Promise.allSettled([
    (async () => {
    const url = new URL('https://www.wikidata.org/w/api.php');
    url.searchParams.set('action', 'wbsearchentities');
    url.searchParams.set('search', q);
    url.searchParams.set('language', 'en');
    url.searchParams.set('type', 'item');
    url.searchParams.set('limit', '10');
    url.searchParams.set('format', 'json');
    const payload = await fetchPublicJson(url, 'Wikidata');
    return (payload.search || []).slice(0, 10).map((movie) => ({
      id: movie.id,
      source: 'Wikidata',
      title: movie.label || movie.id,
      overview: movie.description || '',
      releaseDate: '',
      poster: '',
    }));
    })(),
    searchWikipediaMovies(q),
  ]);
  const wikidataResults = wikidataResult.status === 'fulfilled' ? wikidataResult.value : [];
  const wikipediaResults = wikipediaResult.status === 'fulfilled' ? wikipediaResult.value : [];
  const results = [...wikidataResults.slice(0, 5), ...wikipediaResults.slice(0, 5), ...wikidataResults.slice(5), ...wikipediaResults.slice(5)]
    .filter((item, index, all) => all.findIndex((candidate) => candidate.title.toLocaleLowerCase() === item.title.toLocaleLowerCase()) === index)
    .slice(0, 10);
  if (!results.length && wikidataResult.status === 'rejected' && wikipediaResult.status === 'rejected') {
    throw wikipediaResult.reason;
  }
  return res.json({
    success: true,
    source: 'Wikidata and Wikipedia',
    data: results,
  });
});

export const getOpenMovie = asyncHandler(async (req, res) => {
  const id = String(req.params.id || '');
  const wikipediaId = id.match(/^wiki-(\d+)$/);
  if (wikipediaId) {
    const data = await getWikipediaMovieData(wikipediaId[1]);
    return res.json({ success: true, source: 'Wikipedia', data });
  }
  if (!/^Q\d+$/.test(id)) return res.status(400).json({ success: false, message: 'Choose a valid Wikidata movie result' });

  const entityUrl = new URL('https://www.wikidata.org/w/api.php');
  entityUrl.searchParams.set('action', 'wbgetentities');
  entityUrl.searchParams.set('ids', id);
  entityUrl.searchParams.set('props', 'claims|labels|descriptions|sitelinks');
  entityUrl.searchParams.set('languages', 'en');
  entityUrl.searchParams.set('format', 'json');
  const payload = await fetchPublicJson(entityUrl, 'Wikidata');
  const entity = payload.entities?.[id];
  if (!entity || entity.missing !== undefined) {
    return res.status(404).json({ success: false, message: 'That open-data movie entry could not be found' });
  }

  const wikidataTitle = entity.labels?.en?.value || entity.labels?.mul?.value || '';
  const wikidataDescription = entity.descriptions?.en?.value || '';
  const instanceIds = getWikidataItemIds(entity, 'P31', 20);
  const filmTypes = new Set(['Q11424', 'Q506240', 'Q202866', 'Q24869', 'Q2597816']);
  if (instanceIds.length && !instanceIds.some((typeId) => filmTypes.has(typeId)) &&
      !/\b(film|movie)\b/i.test(wikidataDescription)) {
    return res.status(422).json({ success: false, message: 'The selected open-data result is not classified as a film' });
  }

  const directorIds = getWikidataItemIds(entity, 'P57', 4);
  const castIds = getWikidataItemIds(entity, 'P161', 10);
  const genreIds = getWikidataItemIds(entity, 'P136', 8);
  const labels = await fetchWikidataEntities([...new Set([...directorIds, ...castIds, ...genreIds])]);
  const labelFor = (itemId) => labels[itemId]?.labels?.en?.value || '';
  const releaseClaim = getMovieClaims(entity, 'P577')
    .find((value) => typeof value.time === 'string' && /[+-]?\d{4}-\d{2}-\d{2}/.test(value.time));
  const releaseDate = releaseClaim?.time.match(/[+-]?(\d{4}-\d{2}-\d{2})/)?.[1] || '';
  const runtime = Number.parseFloat(String(getMovieClaims(entity, 'P2047')[0]?.amount || '').replace('+', ''));
  const wikipediaTitle = entity.sitelinks?.enwiki?.title;
  const summaryUrl = wikipediaTitle
    ? `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikipediaTitle.replace(/ /g, '_'))}`
    : '';
  const summary = summaryUrl
    ? await fetchPublicJson(summaryUrl, 'Wikipedia', true)
    : null;
  const title = wikidataTitle || summary?.title || wikipediaTitle?.replace(/_/g, ' ') || id;
  const wikidataFile = getMovieClaims(entity, 'P18')[0];
  const wikidataImage = getWikidataImageUrl(wikidataFile);
  const poster = summary?.originalimage?.source || summary?.thumbnail?.source || wikidataImage || '';
  const posterSourceUrl = summary?.originalimage?.source || summary?.thumbnail?.source
    ? summary?.content_urls?.desktop?.page || ''
    : wikidataFile
      ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(String(wikidataFile).replace(/ /g, '_'))}`
      : '';
  const tmdbValue = getMovieClaims(entity, 'P4947')[0];
  const imdb = getMovieClaims(entity, 'P345')[0] || '';
  const trailer = getMovieClaims(entity, 'P1651')[0] || '';

  return res.json({
    success: true,
    source: 'Wikidata and Wikipedia',
    data: {
      wikidataId: id,
      metadataSource: 'wikidata',
      sourceUrl: summary?.content_urls?.desktop?.page || '',
      posterSourceUrl,
      tmdbId: /^\d+$/.test(String(tmdbValue || '')) ? Number(tmdbValue) : null,
      imdb: typeof imdb === 'string' ? imdb : '',
      title,
      description: summary?.extract || wikidataDescription,
      releaseDate,
      release: formatReleaseDate(releaseDate),
      year: releaseDate.slice(0, 4),
      genre: genreIds.map(labelFor).filter(Boolean).join(' · '),
      duration: runtime > 0 ? `${Math.floor(runtime / 60)}h ${String(Math.round(runtime % 60)).padStart(2, '0')}m` : '',
      director: directorIds.map(labelFor).filter(Boolean).join(' · '),
      cast: castIds.map(labelFor).filter(Boolean),
      poster,
      backdrop: summary?.originalimage?.source || wikidataImage || '',
      trailer: typeof trailer === 'string' ? trailer : '',
      rating: '',
      published: false,
      featured: false,
    },
  });
});

export const listReviews = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const { page, limit, skip } = pageOptions(req.query);
  const q = queryText(req.query.q);
  const filter = {};
  if (['approved', 'hidden'].includes(req.query.status)) filter.status = req.query.status;
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ movieTitle: regex }, { author: regex }, { text: regex }];
  }
  const [data, total] = await Promise.all([
    Review.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments(filter),
  ]);
  return res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const moderateReview = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const { status } = req.body;
  if (!['approved', 'hidden'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Review status must be approved or hidden' });
  }
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  review.status = status;
  await review.save();
  await writeAdminAction(req, status, 'review', review._id, { movieTitle: review.movieTitle });
  return res.json({ success: true, data: review, message: `Review ${status}` });
});

export const removeReview = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  const movieTitle = review.movieTitle;
  await review.deleteOne();
  await writeAdminAction(req, 'removed', 'review', req.params.id, { movieTitle });
  return res.json({ success: true, message: 'Review removed' });
});

const normalizeSupportStatus = (status) => {
  if (status === 'new') return 'open';
  if (status === 'reviewed') return 'in_progress';
  return status;
};

export const listSupportRequests = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const { page, limit, skip } = pageOptions(req.query);
  const q = queryText(req.query.q);
  const filter = {};
  if (['support', 'feedback'].includes(req.query.kind)) filter.kind = req.query.kind;
  if (req.query.status === 'open') filter.status = { $in: ['open', 'new'] };
  if (req.query.status === 'in_progress') filter.status = { $in: ['in_progress', 'reviewed'] };
  if (req.query.status === 'resolved') filter.status = 'resolved';
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ email: regex }, { category: regex }, { note: regex }, { ticketCode: regex }, { userName: regex }];
  }
  const [requests, total] = await Promise.all([
    Feedback.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Feedback.countDocuments(filter),
  ]);
  const data = requests.map((request) => ({
    ...request.toObject(),
    status: normalizeSupportStatus(request.status),
  }));
  return res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const updateSupportStatus = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const { status } = req.body;
  if (!['open', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Support status must be open, in progress, or resolved' });
  }
  const request = await Feedback.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Support request not found' });
  request.status = status;
  await request.save();
  await writeAdminAction(req, status, 'support', request._id, { category: request.category });
  return res.json({
    success: true,
    data: { ...request.toObject(), status: normalizeSupportStatus(request.status) },
    message: 'Support request updated',
  });
});

export const listBookings = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const { page, limit, skip } = pageOptions(req.query);
  const q = queryText(req.query.q);
  const filter = {};
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [
      { bookingCode: regex },
      { movieTitle: regex },
      { userName: regex },
      { userEmail: regex },
      { theatre: regex },
    ];
  }
  if (['pending', 'paid', 'failed', 'refunded'].includes(req.query.paymentStatus)) {
    filter.paymentStatus = req.query.paymentStatus;
  } else if (req.query.paymentStatus === 'demo') {
    filter.paymentStatus = { $in: ['demo', 'completed'] };
  }
  if (['confirmed', 'cancelled'].includes(req.query.bookingStatus)) {
    filter.status = req.query.bookingStatus;
  }
  if (['requested', 'under_review', 'processed', 'rejected', 'not_applicable'].includes(req.query.refundStatus)) {
    filter.refundStatus = req.query.refundStatus;
  }

  if (req.query.from || req.query.to) {
    const createdAt = {};
    if (req.query.from) {
      const from = new Date(req.query.from);
      if (Number.isNaN(from.getTime())) return res.status(400).json({ success: false, message: 'Invalid start date' });
      createdAt.$gte = from;
    }
    if (req.query.to) {
      const to = new Date(req.query.to);
      if (Number.isNaN(to.getTime())) return res.status(400).json({ success: false, message: 'Invalid end date' });
      to.setHours(23, 59, 59, 999);
      createdAt.$lte = to;
    }
    filter.createdAt = createdAt;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('user', 'name email')
      .populate('movie', 'title poster')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);
  const data = bookings.map((booking) => {
    const item = booking.toObject();
    if (item.paymentStatus === 'completed') item.paymentStatus = 'demo';
    return item;
  });
  return res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const updateBookingRefundStatus = asyncHandler(async (req, res) => {
  if (!requireDatabase(res)) return;
  const { status } = req.body;
  if (!['under_review', 'processed', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Refund status must be under review, processed, or rejected',
    });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.status !== 'cancelled' || !['requested', 'under_review'].includes(booking.refundStatus)) {
    return res.status(409).json({ success: false, message: 'This booking has no active refund request' });
  }
  if (status === 'processed' && booking.paymentStatus !== 'paid') {
    return res.status(409).json({
      success: false,
      message: 'Only a confirmed paid transaction can be marked refunded; demo payments collected no money',
    });
  }

  booking.refundStatus = status;
  if (status === 'processed') booking.paymentStatus = 'refunded';
  await booking.save();
  await writeAdminAction(req, `refund_${status}`, 'booking', booking._id, {
    bookingCode: booking.bookingCode,
    paymentStatus: booking.paymentStatus,
  });
  return res.json({
    success: true,
    data: booking,
    message: status === 'processed'
      ? 'Refund marked as processed. Confirm that the payment was returned through the configured gateway.'
      : `Refund request moved to ${status.replace('_', ' ')}`,
  });
});
