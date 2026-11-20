import React, { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clapperboard,
  CreditCard,
  Eye,
  EyeOff,
  Film,
  Headphones,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquareText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import adminApi from './adminApi.js';
import './admin.css';

const adminSections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'reviews', label: 'Reviews', icon: MessageSquareText },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'bookings', label: 'Bookings & payments', icon: Ticket },
];

const emptyMovie = {
  title: '',
  year: '',
  release: '',
  releaseDate: '',
  genre: '',
  duration: '',
  director: '',
  cast: '',
  description: '',
  poster: '',
  backdrop: '',
  trailer: '',
  rating: '',
  format: '4K',
  tmdbId: '',
  wikidataId: '',
  metadataSource: 'wikidata',
  sourceUrl: '',
  posterSourceUrl: '',
  wikipediaPageId: '',
  published: false,
  featured: false,
};

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
};

const formatCurrency = (value) => new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

const statusLabel = (status) => String(status || 'unknown').replaceAll('_', ' ');

const readableError = (error) => error?.message || 'Something went wrong. Please try again.';

const navigateTo = (navigate, path) => {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  navigate(path);
};

export default function AdminApp({ path, navigate }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(adminApi.tokenKey) || '');
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(Boolean(sessionStorage.getItem(adminApi.tokenKey)));
  const [sessionError, setSessionError] = useState('');
  const loginPage = path === '/admin/login';

  useEffect(() => {
    let active = true;
    if (!token) {
      setAdmin(null);
      setChecking(false);
      if (!loginPage) navigateTo(navigate, '/admin/login');
      return () => { active = false; };
    }

    if (loginPage) {
      navigateTo(navigate, '/admin');
      return () => { active = false; };
    }

    setChecking(true);
    setSessionError('');
    adminApi.me()
      .then((result) => {
        if (active) setAdmin(result.user);
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401 || error.status === 403) {
          sessionStorage.removeItem(adminApi.tokenKey);
          setToken('');
          navigateTo(navigate, '/admin/login');
        } else {
          setSessionError(readableError(error));
        }
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [token, path, loginPage, navigate]);

  const signIn = (profile) => {
    setAdmin(profile);
    setToken(sessionStorage.getItem(adminApi.tokenKey) || 'signed-in');
    navigateTo(navigate, '/admin');
  };

  const signOut = () => {
    sessionStorage.removeItem(adminApi.tokenKey);
    setToken('');
    setAdmin(null);
    navigateTo(navigate, '/admin/login');
  };

  if (loginPage && !token) return <AdminLogin onSuccess={signIn} onCustomerSite={() => navigateTo(navigate, '/')}/>;
  if (checking) return <AdminLoading label="Checking administrator access"/>;
  if (!token || !admin) {
    return (
      <AdminLoading
        label={sessionError || 'Administrator access is required'}
        action={sessionError ? () => window.location.reload() : null}
      />
    );
  }

  return <AdminDashboard admin={admin} onSignOut={signOut} onUnauthorized={signOut}/>;
}

function AdminLoading({ label, action }) {
  return (
    <div className="admin-boot" role="status">
      {action ? <CircleAlert size={22}/> : <LoaderCircle className="admin-spin" size={22}/>}
      <span>{label}</span>
      {action && <button type="button" className="admin-button secondary" onClick={action}>Retry</button>}
    </div>
  );
}

function AdminLogin({ onSuccess, onCustomerSite }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await adminApi.login(loginId, password);
      onSuccess(profile);
    } catch (requestError) {
      setError(readableError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-art">
        <button type="button" className="admin-login-brand" onClick={onCustomerSite} aria-label="Return to CinéRegal">
          <span className="admin-brand-mark"><Film size={19}/></span>
          <span>CINÉ<span>REGAL</span></span>
        </button>
        <div className="admin-login-copy">
          <span className="admin-overline">CINÉREGAL · OPERATIONS</span>
          <h1>Keep the<br/><em>programme</em><br/>in motion.</h1>
          <p>A considered workspace for the films, people, and screenings behind CinéRegal.</p>
        </div>
        <div className="admin-login-foot"><span>ADMINISTRATOR ACCESS</span><span>01 — PRIVATE</span></div>
      </section>
      <section className="admin-login-panel">
        <form className="admin-login-card" onSubmit={submit}>
          <button type="button" className="admin-back-link" onClick={onCustomerSite}><ArrowLeft size={15}/> Customer site</button>
          <div className="admin-login-heading">
            <span className="admin-overline">SECURE WORKSPACE</span>
            <h2>Administrator sign in</h2>
            <p>Use your administrator login ID and password to continue.</p>
          </div>
          <label className="admin-field">
            <span>Login ID</span>
            <input autoComplete="username" value={loginId} onChange={(event) => setLoginId(event.target.value)} placeholder="Enter your login ID" required/>
          </label>
          <label className="admin-field">
            <span>Password</span>
            <span className="admin-password-field">
              <input autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" required/>
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
            </span>
          </label>
          {error && <div className="admin-alert error" role="alert"><CircleAlert size={17}/><span>{error}</span></div>}
          <button type="submit" className="admin-button primary admin-login-submit" disabled={loading}>
            {loading ? <LoaderCircle className="admin-spin" size={17}/> : <ShieldCheck size={17}/>}
            {loading ? 'Verifying access…' : 'Sign in to admin'}
            {!loading && <ArrowRight size={16}/>}
          </button>
          <div className="admin-demo-note">
            <BadgeCheck size={17}/>
            <div><b>Local demo access</b><span>Credentials are configured on the backend. See <code>backend/.env.example</code>; change them before deployment.</span></div>
          </div>
        </form>
        <div className="admin-login-footer">CinéRegal · Private operations area</div>
      </section>
    </main>
  );
}

function AdminDashboard({ admin, onSignOut, onUnauthorized }) {
  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supportKindFilter, setSupportKindFilter] = useState('all');
  const [timingFilter, setTimingFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [refundFilter, setRefundFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);
  const [overview, setOverview] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [movieEditor, setMovieEditor] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const request = section === 'overview'
      ? adminApi.overview()
      : adminApi.list(section, {
        page,
        limit: 10,
        q: debouncedQuery,
        status: ['reviews', 'support', 'movies'].includes(section) && statusFilter !== 'all' ? statusFilter : '',
        kind: section === 'support' && supportKindFilter !== 'all' ? supportKindFilter : '',
        timing: section === 'movies' && timingFilter !== 'all' ? timingFilter : '',
        paymentStatus: section === 'bookings' && statusFilter !== 'all' ? statusFilter : '',
        bookingStatus: section === 'bookings' && bookingStatusFilter !== 'all' ? bookingStatusFilter : '',
        refundStatus: section === 'bookings' && refundFilter !== 'all' ? refundFilter : '',
        from: section === 'bookings' ? fromDate : '',
        to: section === 'bookings' ? toDate : '',
      });

    request
      .then((result) => {
        if (!active) return;
        if (section === 'overview') setOverview(result.data);
        else {
          setRecords(result.data || []);
          setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
        }
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401 || requestError.status === 403) onUnauthorized();
        else setError(readableError(requestError));
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [section, page, debouncedQuery, statusFilter, supportKindFilter, timingFilter, bookingStatusFilter, refundFilter, fromDate, toDate, refreshKey, onUnauthorized]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const heading = adminSections.find((item) => item.id === section)?.label || 'Overview';
  const searchPlaceholder = section === 'overview' ? 'Search management records' : `Search ${heading.toLowerCase()}`;
  const resetFilters = (nextSection) => {
    setSection(nextSection);
    setStatusFilter('all');
    setSupportKindFilter('all');
    setTimingFilter('all');
    setBookingStatusFilter('all');
    setRefundFilter('all');
    setQuery('');
    setFromDate('');
    setToDate('');
    setPage(1);
    setSidebarOpen(false);
    setActionError('');
  };

  const mutate = async (operation, successMessage) => {
    setBusy(true);
    setActionError('');
    try {
      await operation();
      setNotice(successMessage);
      setRefreshKey((value) => value + 1);
      return true;
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) onUnauthorized();
      else setActionError(readableError(requestError));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const deleteSelectedMovie = async (movie) => {
    if (!window.confirm(`Remove "${movie.title}" from the catalogue? This cannot be undone.`)) return;
    await mutate(() => adminApi.deleteMovie(movie.id), 'Movie removed from the catalogue');
  };

  const removeSelectedReview = async (review) => {
    if (!window.confirm('Permanently remove this review? This cannot be undone.')) return;
    await mutate(() => adminApi.deleteReview(review._id), 'Review removed');
  };

  const updateRefundStatus = async (booking, status) => {
    if (status === 'processed' && !window.confirm(
      'Only continue after the payment has actually been refunded through your payment provider. Mark this refund as processed?'
    )) return;
    await mutate(
      () => adminApi.setBookingRefundStatus(booking._id, status),
      status === 'processed' ? 'Refund marked as processed' : `Refund moved to ${statusLabel(status)}`
    );
  };

  const saveMovie = async (movie, data) => {
    const saved = movie
      ? await mutate(() => adminApi.updateMovie(movie.id, data), 'Movie changes saved')
      : await mutate(() => adminApi.createMovie(data), 'Movie added to the catalogue');
    if (saved) setMovieEditor(null);
  };

  const onListAction = () => setRefreshKey((value) => value + 1);
  return (
    <div className="admin-app">
      {sidebarOpen && <button type="button" className="admin-sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close admin menu"/>}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <button type="button" className="admin-sidebar-brand" onClick={() => resetFilters('overview')}>
          <span className="admin-brand-mark"><Film size={18}/></span>
          <span>CINÉ<span>REGAL</span><small>ADMINISTRATION</small></span>
        </button>
        <div className="admin-side-label">WORKSPACE</div>
        <nav className="admin-side-nav" aria-label="Admin sections">
          {adminSections.map(({ id, label, icon: Icon }) => (
            <button type="button" className={section === id ? 'active' : ''} key={id} onClick={() => resetFilters(id)} aria-current={section === id ? 'page' : undefined}>
              <Icon size={17}/><span>{label}</span>{section === id && <span className="admin-nav-marker"/>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-status"><span/> MongoDB-backed data</div>
          <button type="button" className="admin-signout" onClick={onSignOut}><LogOut size={16}/> Sign out</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open admin menu"><Menu size={19}/></button>
          <div className="admin-crumb"><span>ADMIN</span><span>/</span><b>{heading}</b></div>
          <label className={`admin-global-search ${section === 'overview' ? 'overview-search' : ''}`}>
            <Search size={16}/>
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && section === 'overview' && query.trim()) {
                  setSection('movies');
                  setStatusFilter('all');
                  setPage(1);
                }
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
            <kbd>⌕</kbd>
          </label>
          <div className="admin-top-user">
            <span className="admin-user-avatar">{admin.name?.[0] || 'A'}</span>
            <span><b>{admin.name}</b><small>Administrator</small></span>
            <button type="button" onClick={onSignOut} aria-label="Sign out"><LogOut size={16}/></button>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-page-heading">
            <div>
              <span className="admin-overline">CINÉREGAL · OPERATIONS</span>
              <h1>{section === 'overview' ? 'Overview' : heading}<span>.</span></h1>
              <p>{pageDescription(section)}</p>
            </div>
            {section === 'movies' && (
              <button type="button" className="admin-button primary" onClick={() => setMovieEditor({ movie: null })}><Plus size={17}/> Add a film</button>
            )}
          </div>

          {notice && <div className="admin-alert success" role="status"><Check size={17}/><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
          {actionError && <div className="admin-alert error" role="alert"><CircleAlert size={17}/><span>{actionError}</span><button type="button" onClick={() => setActionError('')} aria-label="Dismiss"><X size={15}/></button></div>}

          {section !== 'overview' && (
            <div className="admin-list-toolbar">
              <div className="admin-filter-group">
                {section === 'movies' && <>
                  <label><span>Publication</span><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="all">All films</option><option value="published">Published</option><option value="draft">Drafts</option></select></label>
                  <label><span>Release</span><select value={timingFilter} onChange={(event) => { setTimingFilter(event.target.value); setPage(1); }}><option value="all">Any date</option><option value="current">Released</option><option value="upcoming">Upcoming</option></select></label>
                </>}
                {section === 'reviews' && <label><span>Moderation</span><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="all">All reviews</option><option value="approved">Approved</option><option value="hidden">Hidden</option></select></label>}
                {section === 'support' && <>
                  <label><span>Request type</span><select value={supportKindFilter} onChange={(event) => { setSupportKindFilter(event.target.value); setPage(1); }}><option value="all">All requests</option><option value="support">Support tickets</option><option value="feedback">Feedback</option></select></label>
                  <label><span>Request status</span><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="all">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></label>
                </>}
                {section === 'bookings' && <>
                  <label><span>Payment status</span><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="all">All payments</option><option value="demo">Demo</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></label>
                  <label><span>Booking status</span><select value={bookingStatusFilter} onChange={(event) => { setBookingStatusFilter(event.target.value); setPage(1); }}><option value="all">All bookings</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></label>
                  <label><span>Refund status</span><select value={refundFilter} onChange={(event) => { setRefundFilter(event.target.value); setPage(1); }}><option value="all">All refunds</option><option value="requested">Requested</option><option value="under_review">Under review</option><option value="processed">Processed</option><option value="rejected">Rejected</option><option value="not_applicable">Not applicable</option></select></label>
                  <label><span>From</span><input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1); }}/></label>
                  <label><span>To</span><input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1); }}/></label>
                </>}
              </div>
              <div className="admin-results-count">{pagination.total || 0} records</div>
            </div>
          )}

          {loading && <div className="admin-loading"><LoaderCircle className="admin-spin" size={19}/> Loading {section === 'overview' ? 'overview' : heading.toLowerCase()}…</div>}
          {!loading && error && (
            <div className="admin-state-card error-state">
              <CircleAlert size={22}/><h2>Couldn’t load this view</h2><p>{error}</p>
              <button type="button" className="admin-button secondary" onClick={onListAction}><RefreshCw size={15}/> Try again</button>
            </div>
          )}
          {!loading && !error && section === 'overview' && <OverviewPanel data={overview}/>}
          {!loading && !error && section !== 'overview' && records.length === 0 && (
            <div className="admin-state-card"><Clapperboard size={23}/><h2>No records found</h2><p>Try changing the search or filters, or check back when the database has new activity.</p></div>
          )}
          {!loading && !error && records.length > 0 && (
            <>
              {section === 'movies' && <MoviesTable rows={records} onEdit={(movie) => setMovieEditor({ movie })} onToggle={(movie) => mutate(() => adminApi.updateMovie(movie.id, { published: !movie.published }), movie.published ? 'Film unpublished' : 'Film published')} onDelete={deleteSelectedMovie} busy={busy}/>}
              {section === 'reviews' && <ReviewsTable rows={records} onStatus={(review, status) => mutate(() => adminApi.setReviewStatus(review._id, status), `Review ${status}`)} onDelete={removeSelectedReview} busy={busy}/>}
              {section === 'support' && <SupportTable rows={records} onStatus={(request, status) => mutate(() => adminApi.setSupportStatus(request._id, status), 'Support status updated')} busy={busy}/>}
              {section === 'bookings' && <BookingsTable rows={records} onDetails={setBookingDetails} onRefundStatus={updateRefundStatus} busy={busy}/>}
              <AdminPagination page={pagination.page || page} pages={pagination.pages || 1} total={pagination.total || 0} onPage={setPage}/>
            </>
          )}
        </main>
      </div>

      {movieEditor && <MovieEditor key={movieEditor.movie?._id || 'new-movie'} movie={movieEditor.movie} onClose={() => setMovieEditor(null)} onSave={saveMovie} saving={busy}/>}
      {bookingDetails && <BookingDetails booking={bookingDetails} onClose={() => setBookingDetails(null)}/>}
    </div>
  );
}

function pageDescription(section) {
  return {
    overview: 'A clear view of CinéRegal’s catalogue, audience activity, support queue, and payment records.',
    movies: 'Review the catalogue, import verified metadata, and decide what is ready to publish.',
    reviews: 'Keep customer notes visible, useful, and connected to the right film.',
    support: 'Read each customer message and keep the follow-up status up to date.',
    bookings: 'Review screening reservations and distinguish demo records from actual payment states.',
  }[section];
}

function OverviewPanel({ data }) {
  if (!data) return <div className="admin-loading">Waiting for overview data…</div>;
  const stats = [
    { label: 'Current films', value: data.movies?.current ?? 0, hint: `${data.movies?.total ?? 0} in catalogue`, icon: Film },
    { label: 'Upcoming films', value: data.movies?.upcoming ?? 0, hint: 'With a future release date', icon: CalendarDays },
    { label: 'Bookings', value: data.bookings ?? 0, hint: 'All recorded reservations', icon: Ticket },
    { label: 'Customer reviews', value: data.reviewCount ?? 0, hint: 'Approved and hidden', icon: MessageSquareText },
    { label: 'Open support', value: data.openSupportRequests ?? 0, hint: 'Awaiting or in progress', icon: Headphones },
  ];
  const payments = data.payments || {};

  return (
    <div className="admin-overview">
      <section className="admin-stat-grid" aria-label="CinéRegal summary">
        {stats.map(({ label, value, hint, icon: Icon }, index) => (
          <article className={`admin-stat-card ${index === 0 ? 'primary-stat' : ''}`} key={label}>
            <div className="admin-stat-top"><span>{label}</span><Icon size={18}/></div>
            <strong>{value}</strong><small>{hint}</small>
          </article>
        ))}
      </section>
      <section className="admin-payment-panel">
        <div className="admin-section-title">
          <div><span className="admin-overline">BOOKING LEDGER</span><h2>Payments & totals</h2></div>
          <span className="admin-ledger-note"><ShieldCheck size={15}/> Totals reflect explicit payment status</span>
        </div>
        <div className="admin-payment-grid">
          <PaymentMetric status="paid" title="Paid" amount={payments.paid?.total} count={payments.paid?.count} note="Only confirmed gateway payments"/>
          <PaymentMetric status="demo" title="Demo transactions" amount={payments.demo?.total} count={payments.demo?.count} note="No payment was processed"/>
          <PaymentMetric status="pending" title="Pending" amount={payments.pending?.total} count={payments.pending?.count}/>
          <PaymentMetric status="failed" title="Failed / refunded" amount={(payments.failed?.total || 0) + (payments.refunded?.total || 0)} count={(payments.failed?.count || 0) + (payments.refunded?.count || 0)} note="Separated in booking filters"/>
        </div>
      </section>
      <div className="admin-demo-warning"><ArrowDownRight size={17}/><span><b>Demo checkout only.</b> This project does not connect to a payment gateway; demo booking values are not real revenue.</span></div>
    </div>
  );
}

function PaymentMetric({ status, title, amount, count, note }) {
  return (
    <article className={`admin-payment-metric ${status}`}>
      <div><span className={`admin-status ${status}`}>{title}</span><b>{count || 0}</b></div>
      <strong>{formatCurrency(amount)}</strong>
      <small>{note || 'Recorded transactions'}</small>
    </article>
  );
}

function MoviesTable({ rows, onEdit, onToggle, onDelete, busy }) {
  return (
    <div className="admin-table-frame">
      <table className="admin-table admin-movies-table">
        <thead><tr><th>Film</th><th>Release</th><th>Format</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>
          {rows.map((movie) => (
            <tr key={movie._id || movie.id}>
              <td data-label="Film"><div className="admin-movie-cell">
                <AdminPoster movie={movie}/>
                <span><b>{movie.title}</b><small>{[movie.year, movie.genre].filter(Boolean).join(' · ') || 'Details not set'}</small></span>
              </div></td>
              <td data-label="Release">{formatDate(movie.releaseDate || movie.release)}</td>
              <td data-label="Format">{movie.format || '—'}</td>
              <td data-label="Status"><span className={`admin-status ${movie.published === false ? 'draft' : 'approved'}`}>{movie.published === false ? 'Draft' : 'Published'}</span></td>
              <td data-label="Actions"><div className="admin-row-actions">
                <button type="button" title="Edit film" aria-label={`Edit ${movie.title}`} onClick={() => onEdit(movie)}><Pencil size={15}/></button>
                <button type="button" title={movie.published === false ? 'Publish film' : 'Unpublish film'} aria-label={movie.published === false ? `Publish ${movie.title}` : `Unpublish ${movie.title}`} disabled={busy} onClick={() => onToggle(movie)}>{movie.published === false ? <Eye size={15}/> : <EyeOff size={15}/>}</button>
                <button type="button" className="danger-action" title="Remove film" aria-label={`Remove ${movie.title}`} disabled={busy} onClick={() => onDelete(movie)}><Trash2 size={15}/></button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminPoster({ movie }) {
  const [failed, setFailed] = useState(false);
  if (!movie.poster || failed) {
    return <span className="admin-poster-fallback" role="img" aria-label={`${movie.title} poster unavailable`}><Film size={18}/></span>;
  }
  return <img src={movie.poster} alt="" loading="lazy" onError={() => setFailed(true)}/>;
}

function ReviewsTable({ rows, onStatus, onDelete, busy }) {
  return (
    <div className="admin-table-frame">
      <table className="admin-table admin-reviews-table">
        <thead><tr><th>Film & customer</th><th>Review</th><th>Rating</th><th>Date</th><th>Status</th><th>Moderate</th></tr></thead>
        <tbody>
          {rows.map((review) => (
            <tr key={review._id}>
              <td data-label="Film & customer"><b>{review.movieTitle}</b><small>{review.isSample ? 'Sample data · ' : ''}{review.user?.name || review.author || 'Customer'}{review.user?.email ? ` · ${review.user.email}` : ''}</small></td>
              <td data-label="Review"><p className="admin-review-copy">{review.text}</p></td>
              <td data-label="Rating"><span className="admin-rating">★ {review.rating}/5</span></td>
              <td data-label="Date">{formatDateTime(review.createdAt || review.date)}</td>
              <td data-label="Status"><span className={`admin-status ${review.status === 'hidden' ? 'hidden' : 'approved'}`}>{review.status || 'approved'}</span></td>
              <td data-label="Moderate"><div className="admin-row-actions">
                <button type="button" title={review.status === 'hidden' ? 'Approve review' : 'Hide review'} aria-label={review.status === 'hidden' ? 'Approve review' : 'Hide review'} disabled={busy} onClick={() => onStatus(review, review.status === 'hidden' ? 'approved' : 'hidden')}>{review.status === 'hidden' ? <Check size={15}/> : <EyeOff size={15}/>}</button>
                <button type="button" className="danger-action" title="Remove review" aria-label="Remove review" disabled={busy} onClick={() => onDelete(review)}><Trash2 size={15}/></button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SupportTable({ rows, onStatus, busy }) {
  return (
    <div className="admin-table-frame">
      <table className="admin-table admin-support-table">
        <thead><tr><th>Ticket & customer</th><th>Request</th><th>Received</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((request) => (
            <tr key={request._id}>
              <td data-label="Ticket & customer">
                <b>{request.ticketCode || request.user?.name || request.userName || request.email}</b>
                <small>{request.user?.email || request.email} · {request.kind === 'support' ? request.user?.name || request.userName || 'Support ticket' : 'Feedback'}</small>
              </td>
              <td data-label="Request">
                <span className="admin-request-category">{request.category}</span>
                <details className="admin-request-details"><summary>{request.note}</summary><p>{request.note}</p></details>
              </td>
              <td data-label="Received">{formatDateTime(request.createdAt)}</td>
              <td data-label="Status"><select aria-label={`Update support request from ${request.email}`} value={request.status} disabled={busy} onChange={(event) => onStatus(request, event.target.value)}>
                <option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option>
              </select></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingsTable({ rows, onDetails, onRefundStatus, busy }) {
  return (
    <div className="admin-table-frame">
      <table className="admin-table admin-bookings-table">
        <thead><tr><th>Booking</th><th>Customer</th><th>Screening</th><th>Seats</th><th>Amount</th><th>Payment</th><th>Booking status</th><th>Refund</th><th><span className="sr-only">Details</span></th></tr></thead>
        <tbody>
          {rows.map((booking) => (
            <tr key={booking._id || booking.bookingCode}>
              <td data-label="Booking"><b className="admin-code">{booking.bookingCode || String(booking._id).slice(-8)}</b><small>{formatDateTime(booking.createdAt)}</small></td>
              <td data-label="Customer"><b>{booking.user?.name || booking.userName || 'Guest'}</b><small>{booking.user?.email || booking.userEmail || 'No email provided'}</small></td>
              <td data-label="Screening"><b>{booking.movie?.title || booking.movieTitle}</b><small>{booking.theatre} · {booking.city} · {booking.date} · {booking.showtime}</small></td>
              <td data-label="Seats">{(booking.seats || []).join(', ') || '—'}</td>
              <td data-label="Amount"><b>{formatCurrency(booking.total)}</b></td>
              <td data-label="Payment"><span className={`admin-status ${booking.paymentStatus || 'demo'}`}>{statusLabel(booking.paymentStatus || 'demo')}</span></td>
              <td data-label="Booking status"><span className={`admin-status ${booking.status === 'cancelled' ? 'failed' : 'approved'}`}>{statusLabel(booking.status || 'confirmed')}</span></td>
              <td data-label="Refund">
                {booking.status === 'cancelled' && ['requested', 'under_review'].includes(booking.refundStatus) && booking.paymentStatus === 'paid' ? (
                  <select
                    aria-label={`Update refund for ${booking.bookingCode || booking.movieTitle}`}
                    value={booking.refundStatus}
                    disabled={busy}
                    onChange={(event) => onRefundStatus(booking, event.target.value)}
                  >
                    <option value="requested">Requested</option>
                    <option value="under_review">Under review</option>
                    <option value="processed">Mark refunded</option>
                    <option value="rejected">Reject request</option>
                  </select>
                ) : <span className={`admin-status ${booking.refundStatus || 'not_requested'}`}>{statusLabel(booking.refundStatus || 'not requested')}</span>}
              </td>
              <td data-label="Details"><button type="button" className="admin-detail-button" onClick={() => onDetails(booking)}>Details <ArrowRight size={14}/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminPagination({ page, pages, total, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="admin-pagination">
      <span>Page {page} of {pages} <i>·</i> {total} records</span>
      <div><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={17}/></button><button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={17}/></button></div>
    </div>
  );
}

function ArtworkPreview({ src, alt, fallback }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className="admin-artwork-empty">{fallback}</span>;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)}/>;
}

function MovieEditor({ movie, onClose, onSave, saving }) {
  const initial = movie ? {
    ...emptyMovie,
    ...movie,
    releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().slice(0, 10) : '',
    cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
    tmdbId: movie.tmdbId || '',
    wikidataId: movie.wikidataId || '',
  } : emptyMovie;
  const [form, setForm] = useState(initial);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [formError, setFormError] = useState('');

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const searchMovies = async (event) => {
    event.preventDefault();
    setSearching(true);
    setImportError('');
    setResults([]);
    try {
      const result = await adminApi.searchImport(search);
      setResults(result.data || []);
      if (!result.data?.length) setImportError('No matching titles were found. Try the film’s original or English title.');
    } catch (error) {
      setImportError(readableError(error));
    } finally {
      setSearching(false);
    }
  };

  const importMovie = async (result) => {
    setImporting(true);
    setImportError('');
    try {
      const imported = await adminApi.getImportedMovie(result.id);
      setForm((current) => ({
        ...current,
        ...emptyMovie,
        ...imported.data,
        cast: (imported.data.cast || []).join(', '),
        published: false,
        featured: false,
      }));
      setFormError('');
      setSearch('');
      setResults([]);
    } catch (error) {
      setImportError(readableError(error));
    } finally {
      setImporting(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setFormError('Add a movie title before saving.');
      return;
    }
    setFormError('');
    await onSave(movie, {
      ...form,
      title: form.title.trim(),
      year: form.year.trim(),
      release: form.release.trim(),
      tmdbId: form.tmdbId ? Number(form.tmdbId) : null,
      wikidataId: form.wikidataId || '',
      metadataSource: form.wikidataId ? 'wikidata' : form.metadataSource,
    });
  };

  return (
    <div className="admin-modal-shade" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="admin-editor-modal" role="dialog" aria-modal="true" aria-labelledby="admin-movie-editor-title">
        <div className="admin-modal-heading">
          <div><span className="admin-overline">{movie ? 'CATALOGUE EDITION' : 'NEW CATALOGUE ENTRY'}</span><h2 id="admin-movie-editor-title">{movie ? 'Edit film' : 'Add a film'}</h2></div>
          <button type="button" className="admin-icon-button" onClick={onClose} aria-label="Close editor"><X size={19}/></button>
        </div>

        {!movie && (
          <section className="admin-import-box">
            <div><Clapperboard size={17}/><b>Import from trusted sources</b><span>Search Wikipedia directly, with the backend metadata sources as a fallback. Original article artwork is preferred when available, with source links retained.</span></div>
            <form onSubmit={searchMovies}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search any film title" aria-label="Search open movie data"/><button type="submit" className="admin-button secondary" disabled={searching || search.trim().length < 2}>{searching ? <LoaderCircle className="admin-spin" size={16}/> : <Search size={15}/>} Search</button></form>
            {importError && <p className="admin-import-error" role="status">{importError}</p>}
            {importing && <p className="admin-import-loading" role="status">Loading open metadata and available artwork…</p>}
            {results.length > 0 && <div className="admin-import-results">{results.map((result) => <button type="button" key={result.id} disabled={importing} onClick={() => importMovie(result)}>
              <AdminPoster movie={result}/>
              <span><b>{result.title}</b><small>{result.source ? `${result.source} · ` : ''}{result.releaseDate || 'Release date unavailable'}{result.overview ? ` · ${result.overview}` : ''}</small></span>
              {importing ? <LoaderCircle className="admin-spin" size={16}/> : <ArrowRight size={15}/>}
            </button>)}</div>}
          </section>
        )}

        <form className="admin-movie-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <label className="wide"><span>Film title *</span><input value={form.title || ''} onChange={(event) => change('title', event.target.value)} required/></label>
            <label><span>Release date</span><input type="date" value={form.releaseDate || ''} onChange={(event) => change('releaseDate', event.target.value)}/></label>
            <label><span>Display date</span><input value={form.release || ''} onChange={(event) => change('release', event.target.value)} placeholder="For example, 12 June 2027"/></label>
            <label><span>Year</span><input value={form.year || ''} onChange={(event) => change('year', event.target.value)}/></label>
            <label><span>Runtime</span><input value={form.duration || ''} onChange={(event) => change('duration', event.target.value)} placeholder="For example, 2h 10m"/></label>
            <label><span>Genres</span><input value={form.genre || ''} onChange={(event) => change('genre', event.target.value)} placeholder="Drama · Thriller"/></label>
            <label><span>Director</span><input value={form.director || ''} onChange={(event) => change('director', event.target.value)}/></label>
            <label className="wide"><span>Cast (comma separated)</span><input value={form.cast || ''} onChange={(event) => change('cast', event.target.value)}/></label>
            <label className="wide"><span>Synopsis</span><textarea rows="3" value={form.description || ''} onChange={(event) => change('description', event.target.value)}/></label>
            <div className="admin-artwork-preview wide">
              <span>Poster images use the original source resolution when available. {form.sourceUrl && <>Details: <a href={form.sourceUrl} target="_blank" rel="noreferrer">{form.metadataSource === 'wikipedia' ? 'Wikipedia' : 'Wikimedia data'}</a>. </>}{form.posterSourceUrl && <>Poster: <a href={form.posterSourceUrl} target="_blank" rel="noreferrer">image source and attribution</a>.</>}</span>
              <div>
                <figure><ArtworkPreview src={form.poster} alt={`${form.title || 'Film'} poster`} fallback="Poster unavailable"/><figcaption>Poster</figcaption></figure>
                <figure><ArtworkPreview src={form.backdrop} alt={`${form.title || 'Film'} backdrop`} fallback="Backdrop unavailable"/><figcaption>Backdrop</figcaption></figure>
              </div>
            </div>
            <label><span>YouTube trailer ID</span><input value={form.trailer || ''} onChange={(event) => change('trailer', event.target.value)}/></label>
            <label><span>Screen format</span><input value={form.format || ''} onChange={(event) => change('format', event.target.value)}/></label>
            <input type="hidden" value={form.tmdbId || ''} readOnly/>
            <input type="hidden" value={form.wikidataId || ''} readOnly/>
          </div>
          <div className="admin-movie-toggles">
            <label><input type="checkbox" checked={Boolean(form.published)} onChange={(event) => change('published', event.target.checked)}/><span><b>Published</b><small>Visible on the customer site</small></span></label>
            <label><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => change('featured', event.target.checked)}/><span><b>Featured</b><small>Eligible for the home spotlight</small></span></label>
          </div>
          {formError && <div className="admin-alert error" role="alert"><CircleAlert size={16}/>{formError}</div>}
          <div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={onClose}>Cancel</button><button type="submit" className="admin-button primary" disabled={saving}>{saving ? <LoaderCircle className="admin-spin" size={16}/> : <Check size={16}/>} {movie ? 'Save changes' : 'Save film'}</button></div>
        </form>
      </section>
    </div>
  );
}

function BookingDetails({ booking, onClose }) {
  return (
    <div className="admin-modal-shade" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="admin-detail-modal" role="dialog" aria-modal="true" aria-labelledby="admin-booking-detail-title">
        <div className="admin-modal-heading"><div><span className="admin-overline">RESERVATION RECORD</span><h2 id="admin-booking-detail-title">Booking details</h2></div><button type="button" className="admin-icon-button" onClick={onClose} aria-label="Close details"><X size={19}/></button></div>
        <span className={`admin-status ${booking.paymentStatus || 'demo'}`}>{statusLabel(booking.paymentStatus || 'demo')} transaction</span>
        <h3>{booking.movie?.title || booking.movieTitle}</h3>
        <dl className="admin-booking-details">
          <div><dt>Booking reference</dt><dd>{booking.bookingCode || booking._id}</dd></div>
          <div><dt>Customer</dt><dd>{booking.user?.name || booking.userName || 'Guest'}{booking.user?.email || booking.userEmail ? ` · ${booking.user?.email || booking.userEmail}` : ''}</dd></div>
          <div><dt>Theatre</dt><dd>{booking.theatre || '—'} · {booking.city || '—'}</dd></div>
          <div><dt>Screening</dt><dd>{/^\d{4}-\d{2}-\d{2}$/.test(booking.date || '') ? formatDate(booking.date) : booking.date || '—'} · {booking.showtime || '—'} · {booking.screenLayout || 'standard'}</dd></div>
          <div><dt>Seats</dt><dd>{(booking.seats || []).join(', ') || '—'}</dd></div>
          <div><dt>Payment status</dt><dd>{statusLabel(booking.paymentStatus || 'demo')} · {booking.paymentMethod === 'demo' || booking.paymentStatus === 'demo' ? 'No gateway charge' : booking.paymentMethod || 'Not recorded'}</dd></div>
          <div><dt>Booking status</dt><dd>{statusLabel(booking.status || 'confirmed')}</dd></div>
          <div><dt>Refund status</dt><dd>{statusLabel(booking.refundStatus || 'not requested')}</dd></div>
          {booking.cancellationReason && <div><dt>Cancellation note</dt><dd>{booking.cancellationReason}</dd></div>}
          {booking.refundReason && <div><dt>Refund request note</dt><dd>{booking.refundReason}</dd></div>}
          <div><dt>Total</dt><dd>{formatCurrency(booking.total)}</dd></div>
        </dl>
        <p className="admin-demo-warning compact"><CreditCard size={16}/> No card number or security code is stored or displayed.</p>
        <div className="admin-modal-actions"><button type="button" className="admin-button primary" onClick={onClose}>Done</button></div>
      </section>
    </div>
  );
}
