import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Armchair, ArrowDown, ArrowLeft, ArrowRight, Bell, Bookmark, CalendarDays, Check, ChevronDown, CircleHelp, Clapperboard, Clock3, Film, Headphones, Heart, LogIn, MapPin, Menu, Play, Printer, Search, Settings, ShieldCheck, Star, Ticket, User, Users, X } from 'lucide-react';
import api from './api.js';

const initialMoviesList = [
  { id: 1, imdb: 'tt15239678', title: 'Dune: Part Two', genre: 'Sci-Fi · Adventure', year: '2024', release: '1 March 2024', rating: '8.5', duration: '2h 46m', format: 'IMAX', poster: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCNx7s5hj0PX.jpg', trailer: 'Way9Dexny3w', cast: ['Timothée Chalamet','Zendaya','Rebecca Ferguson','Javier Bardem','Austin Butler'], director: 'Denis Villeneuve', description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.' },
  { id: 2, imdb: 'tt0816692', title: 'Interstellar', genre: 'Sci-Fi · Drama', year: '2014', release: '7 November 2014', rating: '8.7', duration: '2h 49m', format: 'IMAX', poster: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', backdrop: 'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg', trailer: 'zSWdZVtXT7E', cast: ['Matthew McConaughey','Anne Hathaway','Jessica Chastain','Michael Caine'], director: 'Christopher Nolan', description: 'A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.' },
  { id: 3, imdb: 'tt15398776', title: 'Oppenheimer', genre: 'Biography · Drama', year: '2023', release: '21 July 2023', rating: '8.3', duration: '3h 00m', format: '4K', poster: 'https://image.tmdb.org/t/p/w780/ptpr0kGAckfQkJeJIt8st5dglvd.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', trailer: 'uYPbbksJxIg', cast: ['Cillian Murphy','Emily Blunt','Matt Damon','Robert Downey Jr.'], director: 'Christopher Nolan', description: 'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.' },
  { id: 4, imdb: 'tt1375666', title: 'Inception', genre: 'Sci-Fi · Thriller', year: '2010', release: '16 July 2010', rating: '8.8', duration: '2h 28m', format: '4K', poster: 'https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', backdrop: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', trailer: 'YoHD9XEInc0', cast: ['Leonardo DiCaprio','Joseph Gordon-Levitt','Elliot Page','Tom Hardy'], director: 'Christopher Nolan', description: 'A skilled thief is offered a chance to have his past crimes forgiven if he can plant an idea in a target’s mind.' },
  { id: 5, imdb: 'tt1877830', title: 'The Batman', genre: 'Action · Crime', year: '2022', release: '4 March 2022', rating: '7.8', duration: '2h 56m', format: 'Dolby Atmos', poster: 'https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg', backdrop: 'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg', trailer: 'mqqft2x_Aa4', cast: ['Robert Pattinson','Zoë Kravitz','Paul Dano','Jeffrey Wright'], director: 'Matt Reeves', description: 'Batman ventures into Gotham City’s underworld when a sadistic killer leaves behind a trail of clues.' },
  { id: 6, imdb: 'tt1630029', title: 'Avatar: The Way of Water', genre: 'Sci-Fi · Adventure', year: '2022', release: '16 December 2022', rating: '7.5', duration: '3h 12m', format: 'IMAX 3D', poster: 'https://image.tmdb.org/t/p/w780/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', backdrop: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg', trailer: 'd9MyW72ELq0', cast: ['Sam Worthington','Zoe Saldaña','Sigourney Weaver','Kate Winslet'], director: 'James Cameron', description: 'Jake Sully and Neytiri fight to protect their family as a familiar threat returns to Pandora.' },
  { id: 7, imdb: 'tt0468569', title: 'The Dark Knight', genre: 'Action · Crime', year: '2008', release: '18 July 2008', rating: '9.0', duration: '2h 32m', format: '4K', poster: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg', backdrop: 'https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg', trailer: 'EXeTwQWrcwY', cast: ['Christian Bale','Heath Ledger','Aaron Eckhart','Gary Oldman'], director: 'Christopher Nolan', description: 'Batman raises the stakes in his war on crime, facing a criminal mastermind known as the Joker.' },
  { id: 8, imdb: 'tt0110912', title: 'Pulp Fiction', genre: 'Crime · Drama', year: '1994', release: '14 October 1994', rating: '8.9', duration: '2h 34m', format: '4K', poster: 'https://image.tmdb.org/t/p/w780/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg', trailer: 's7EdQ4FqbhY', cast: ['John Travolta','Uma Thurman','Samuel L. Jackson','Bruce Willis'], director: 'Quentin Tarantino', description: 'The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine in Los Angeles.' },
  { id: 9, imdb: 'tt0109830', title: 'Forrest Gump', genre: 'Drama · Romance', year: '1994', release: '6 July 1994', rating: '8.8', duration: '2h 22m', format: '4K', poster: 'https://image.tmdb.org/t/p/w780/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', backdrop: 'https://image.tmdb.org/t/p/original/qdIMHd4sEfJSckfVJfKQvisL02a.jpg', trailer: 'bLvqoHBptjg', cast: ['Tom Hanks','Robin Wright','Gary Sinise','Sally Field'], director: 'Robert Zemeckis', description: 'The story of a kind-hearted man whose life connects with several defining moments in modern American history.' },
  { id: 10, imdb: 'tt0133093', title: 'The Matrix', genre: 'Sci-Fi · Action', year: '1999', release: '31 March 1999', rating: '8.7', duration: '2h 16m', format: '4K', poster: 'https://image.tmdb.org/t/p/w780/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg', trailer: 'vKQi3bBA1y8', cast: ['Keanu Reeves','Laurence Fishburne','Carrie-Anne Moss','Hugo Weaving'], director: 'Lana Wachowski · Lilly Wachowski', description: 'A computer hacker discovers that reality is a simulation and joins a rebellion against its controllers.' },
  { id: 11, imdb: 'tt6751668', title: 'Parasite', genre: 'Thriller · Drama', year: '2019', release: '30 May 2019', rating: '8.5', duration: '2h 12m', format: '4K', poster: 'https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', backdrop: 'https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkBcQXrJ.jpg', trailer: '5xH0HfJHsaY', cast: ['Song Kang-ho','Lee Sun-kyun','Cho Yeo-jeong','Choi Woo-shik'], director: 'Bong Joon Ho', description: 'A poor family schemes to become employed by a wealthy household, with unexpected consequences.' },
  { id: 12, imdb: 'tt4154796', title: 'Avengers: Endgame', genre: 'Action · Adventure', year: '2019', release: '26 April 2019', rating: '8.4', duration: '3h 01m', format: 'IMAX', poster: 'https://image.tmdb.org/t/p/w780/or06FN3Dka5tukK1e9sl16pB3iy.jpg', backdrop: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg', trailer: 'TcMBFSGVi1c', cast: ['Robert Downey Jr.','Chris Evans','Mark Ruffalo','Scarlett Johansson'], director: 'Anthony Russo · Joe Russo', description: 'The remaining Avengers gather for one final stand to restore balance to the universe.' },
];

const getHeroBackground = (movie) => [
  'linear-gradient(90deg, rgba(8,24,48,.91) 0%, rgba(8,24,48,.58) 43%, rgba(8,24,48,.05) 100%)',
  'linear-gradient(0deg, rgba(8,24,48,.34), transparent 60%)',
  movie.backdrop && `url("${movie.backdrop}")`,
  'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80")',
].filter(Boolean).join(', ');

const getScrollBehavior = () => (
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
);

const getLocalDateString = (value = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatScreeningDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return value || 'Date to be confirmed';
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
};

const isScreeningInFuture = (booking) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(booking.date || ''))) return true;
  const startsAt = new Date(`${booking.date}T00:00:00`);
  const match = String(booking.showtime || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === 'PM') hours += 12;
    startsAt.setHours(hours, Number(match[2]), 0, 0);
  }
  return startsAt.getTime() > Date.now();
};

const formatActivityDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? 'Recently'
    : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
};

const formatNotificationTime = (value) => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Recently';
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(timestamp);
};

const nav = [
  { id: 'home', label: 'Discover', icon: Clapperboard },
  { id: 'booking', label: 'Tickets', icon: Ticket },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'history', label: 'My history', icon: Clock3 },
  { id: 'support', label: 'Help', icon: Headphones },
];

export default function App() {
  const [movies, setMovies] = useState(initialMoviesList);
  const [page, setPage] = useState('home');
  const [active, setActive] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [previousHero, setPreviousHero] = useState(null);
  const displayedHeroRef = useRef(null);
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('cineregal-user') || 'null'); } catch { return null; } });
  const [watchlist, setWatchlist] = useState(user?.watchlist || []);
  const [genreFilter, setGenreFilter] = useState('All films');
  const [formatFilter, setFormatFilter] = useState('All formats');
  const [sortBy, setSortBy] = useState('curated');
  const [selectedMovie, setSelectedMovie] = useState(initialMoviesList[0]);
  const [modal, setModal] = useState('');
  const [modalClosing, setModalClosing] = useState(false);
  const modalCloseTimerRef = useRef(null);
  const [toast, setToast] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [reviewsStatus, setReviewsStatus] = useState('loading');
  const [reviewsRetry, setReviewsRetry] = useState(0);
  const [reviewFilter, setReviewFilter] = useState('All films');
  const [reviewText, setReviewText] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [date, setDate] = useState(() => getLocalDateString());
  const [format, setFormat] = useState('All formats');
  const [selectedTheatre, setSelectedTheatre] = useState('Regal PVR ICON');
  const [screenLayout, setScreenLayout] = useState('standard');
  const [mobileNav, setMobileNav] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cineregal-notifications') || '[]');
      return Array.isArray(saved)
        ? saved.filter((item) => item && typeof item.id === 'string' && typeof item.title === 'string').slice(0, 50)
        : [];
    } catch {
      return [];
    }
  });
  const supportStatusSnapshot = useRef(new Map());
  const [showtime, setShowtime] = useState('5:20 PM');
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [authAnimation, setAuthAnimation] = useState('');
  const [pendingPage, setPendingPage] = useState('home');
  const [bookingHistory, setBookingHistory] = useState([]);
  const [bookingHistoryStatus, setBookingHistoryStatus] = useState('idle');
  const [bookingHistoryRetry, setBookingHistoryRetry] = useState(0);
  const [bookingActionId, setBookingActionId] = useState('');
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportStatus, setSupportStatus] = useState('idle');
  const [supportRetry, setSupportRetry] = useState(0);

  useEffect(() => {
    let active = true;
    api.getMovies().then((data) => {
      if (!active || data === null) return;
      setMovies(data);
      setActive(0);
      setSelectedMovie(data[0] || null);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setReviewsStatus('loading');
    api.getReviews().then((revs) => {
      if (!active) return;
      if (revs === null) {
        setReviewsStatus('error');
        return;
      }
      setSubmittedReviews(revs);
      setReviewsStatus('ready');
    });
    return () => { active = false; };
  }, [reviewsRetry]);

  useEffect(() => {
    let active = true;
    setBookingHistory([]);

    if (!user) {
      setBookingHistoryStatus('idle');
      return () => { active = false; };
    }

    setBookingHistoryStatus('loading');
    api.getMyBookings().then((bookings) => {
      if (!active) return;
      if (bookings === null) {
        setBookingHistoryStatus('error');
        return;
      }
      setBookingHistory(bookings.map((booking) => ({
        id: booking._id || booking.id,
        movie: booking.movieTitle,
        seats: booking.seats,
        city: booking.city,
        date: booking.date,
        showtime: booking.showtime,
        theatre: booking.theatre,
        screenLayout: booking.screenLayout,
        total: booking.total,
        ticketPrice: booking.ticketPrice,
        convenienceFee: booking.convenienceFee,
        bookingCode: booking.bookingCode,
        status: booking.status || 'confirmed',
        paymentStatus: booking.paymentStatus === 'completed' ? 'demo' : booking.paymentStatus || 'demo',
        paymentMethod: booking.paymentMethod,
        refundStatus: booking.refundStatus || 'not_requested',
        cancelledAt: booking.cancelledAt,
        refundRequestedAt: booking.refundRequestedAt,
        createdAt: booking.createdAt,
      })));
      setBookingHistoryStatus('ready');
    });

    return () => { active = false; };
  }, [user?.id, user?._id, user?.email, bookingHistoryRetry]);

  useEffect(() => {
    let active = true;
    if (!user || page !== 'support') {
      if (!user) setSupportStatus('idle');
      return () => { active = false; };
    }

    setSupportStatus('loading');
    api.getMySupportTickets()
      .then((tickets) => {
        if (!active) return;
        const previousStatuses = supportStatusSnapshot.current;
        tickets.forEach((ticket) => {
          const id = String(ticket._id || ticket.ticketCode || '');
          const status = ticket.status === 'new' ? 'open' : ticket.status === 'reviewed' ? 'in_progress' : ticket.status;
          if (id && previousStatuses.has(id) && previousStatuses.get(id) !== status) {
            addNotification({
              title: 'Support request updated',
              detail: `${ticket.ticketCode || 'Your ticket'} · ${String(status).replaceAll('_', ' ')}`,
              action: 'support',
            });
          }
          if (id) previousStatuses.set(id, status);
        });
        setSupportTickets(tickets);
        setSupportStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setSupportStatus('error');
      });

    return () => { active = false; };
  }, [page, user?.id, user?._id, user?.email, supportRetry]);

  useEffect(() => {
    setWatchlist(user?.watchlist || []);
  }, [user?.id, user?._id]);

  useEffect(() => {
    if (page !== 'home' || !movies.length || heroPaused || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setActive((a) => (a + 1) % movies.length), 5000);
    return () => clearTimeout(timer);
  }, [active, movies.length, page, heroPaused]);

  useEffect(() => {
    if (page !== 'home') setHeroPaused(false);
  }, [page]);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { if (user) localStorage.setItem('cineregal-user', JSON.stringify(user)); else localStorage.removeItem('cineregal-user'); }, [user]);
  useEffect(() => { localStorage.setItem('cineregal-notifications', JSON.stringify(notifications)); }, [notifications]);

  useEffect(() => {
    if (modal !== 'trailer') return;
    const closeOnEscape = (event) => { if (event.key === 'Escape') closeTrailer(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [modal, modalClosing]);

  useEffect(() => () => window.clearTimeout(modalCloseTimerRef.current), []);

  const closeTrailer = () => {
    if (modal !== 'trailer' || modalClosing) return;
    setModalClosing(true);
    modalCloseTimerRef.current = window.setTimeout(() => {
      setModal('');
      setModalClosing(false);
      modalCloseTimerRef.current = null;
    }, 180);
  };

  const openTrailer = (movie = null) => {
    window.clearTimeout(modalCloseTimerRef.current);
    modalCloseTimerRef.current = null;
    if (movie) setSelectedMovie(movie);
    setModalClosing(false);
    setModal('trailer');
  };

  const activeNavigationItem = page === 'details'
    ? 'home'
    : page === 'checkout'
      ? 'booking'
      : ['auth', 'settings', 'feedback'].includes(page)
        ? ''
        : page;

  const go = (p) => { setPage(p); setMobileNav(false); window.scrollTo({ top: 0, behavior: getScrollBehavior() }); };
  const notify = (m) => setToast(m);
  const addNotification = ({ title, detail, action }) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      detail,
      action,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((current) => [item, ...current].slice(0, 50));
  };

  const toggleWatch = async (id) => {
    if (!needSignIn('home')) return;
    const exists = watchlist.includes(id);
    const updatedWatchlist = exists ? watchlist.filter((x) => x !== id) : [...watchlist, id];
    setWatchlist(updatedWatchlist);
    setUser((current) => current ? { ...current, watchlist: updatedWatchlist } : current);
    try {
      await api.toggleWatchlist(id);
      notify(exists ? 'Removed from your watchlist' : 'Saved to your watchlist');
    } catch {
      notify('Watchlist updated on this device; account sync is unavailable');
    }
  };

  const openBooking = (movie) => {
    setSelectedMovie(movie);
    if (!needSignIn('booking')) return;
    setSelectedSeats([]);
    setCheckoutDone(false);
    setConfirmationCode('');
    setConfirmedBooking(null);
    go('booking');
  };
  const openDetails = (movie) => { setSelectedMovie(movie); go('details'); };

  const cancelUserBooking = async (booking) => {
    const requestRefund = booking.paymentStatus === 'paid';
    const prompt = requestRefund
      ? `Cancel ${booking.bookingCode || 'this booking'} and send a refund request for review?`
      : `Cancel ${booking.bookingCode || 'this booking'}? This demo booking did not collect a payment.`;
    if (!window.confirm(prompt)) return;

    setBookingActionId(String(booking.id));
    try {
      const result = await api.cancelBooking(booking.id);
      setBookingHistory((current) => current.map((item) => (
        String(item.id) === String(booking.id)
          ? {
            ...item,
            status: result.data.status,
            refundStatus: result.data.refundStatus,
            cancelledAt: result.data.cancelledAt,
            refundRequestedAt: result.data.refundRequestedAt,
          }
          : item
      )));
      addNotification({
        title: 'Ticket cancelled',
        detail: `${booking.bookingCode || booking.movie} · ${result.data.refundStatus === 'requested' ? 'refund request opened' : 'demo booking; no refund due'}`,
        action: 'history',
      });
      notify(result.message);
    } catch (error) {
      notify(error.message || 'This booking could not be cancelled');
    } finally {
      setBookingActionId('');
    }
  };

  const createSupportTicket = async (ticketData) => {
    const ticket = await api.createSupportTicket(ticketData);
    setSupportTickets((current) => [ticket, ...current]);
    setSupportStatus('ready');
    addNotification({
      title: 'Support ticket opened',
      detail: `${ticket.ticketCode} · ${ticket.category}`,
      action: 'support',
    });
    return ticket;
  };

  const needSignIn = (destination = 'home') => {
    if (user) return true;
    setPendingPage(destination);
    setModal('login');
    go('auth');
    notify('Please sign in or create an account to continue');
    return false;
  };

  const signOut = () => {
    setAuthAnimation('signing-out');
    localStorage.removeItem('cineregal-token');
    setNotifications([]);
    supportStatusSnapshot.current.clear();
    setUser(null);
    go('home');
    notify('You’re signed out');
    setTimeout(() => setAuthAnimation(''), 720);
  };

  const availableGenres = [...new Set(movies.flatMap((movie) =>
    String(movie.genre || '').split(/[·,|]/).map((genre) => genre.trim()).filter(Boolean)
  ))].sort((a, b) => a.localeCompare(b));
  const availableFormats = [...new Set(movies.map((movie) => String(movie.format || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const filtered = movies.filter((movie) => (
    `${movie.title} ${movie.genre} ${movie.director || ''} ${movie.cast || ''}`.toLowerCase().includes(query.trim().toLowerCase()) &&
    (genreFilter === 'All films' || String(movie.genre || '').toLowerCase().includes(genreFilter.toLowerCase())) &&
    (formatFilter === 'All formats' || movie.format === formatFilter)
  ));
  const visibleMovies = [...filtered].sort((a, b) => {
    if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'newest') return (Number(b.year) || 0) - (Number(a.year) || 0) || a.title.localeCompare(b.title);
    return 0;
  });
  const filtersActive = Boolean(query.trim()) || genreFilter !== 'All films' || formatFilter !== 'All formats' || sortBy !== 'curated';
  const highlightedReview = submittedReviews[0] || null;
  const hero = movies[active] || movies[0] || null;

  useLayoutEffect(() => {
    const previous = displayedHeroRef.current;
    displayedHeroRef.current = hero;
    if (!previous || !hero || previous.id === hero.id) return;

    setPreviousHero(previous);
    const timeout = setTimeout(() => setPreviousHero(null), 760);
    return () => clearTimeout(timeout);
  }, [hero]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => go('home')} aria-label="CinéRegal home">
          <span className="brand-mark"><Film size={20}/></span>
          <span>CINÉ<span>REGAL</span></span>
        </button>
        <button
          type="button"
          className="mobile-menu icon-btn"
          onClick={() => setMobileNav(!mobileNav)}
          aria-label={mobileNav ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileNav}
          aria-controls="primary-navigation"
        >
          {mobileNav ? <X size={20}/> : <Menu size={20}/>}
        </button>
        <nav id="primary-navigation" className={mobileNav ? 'main-nav show' : 'main-nav'}>
          {nav.map((n) => (
            <button
              type="button"
              key={n.id}
              className={`nav-link ${activeNavigationItem === n.id ? 'selected' : ''}`}
              aria-current={activeNavigationItem === n.id ? 'page' : undefined}
              onClick={() => n.id === 'history'
                ? (user ? go('history') : needSignIn('history'))
                : n.id === 'booking'
                  ? (user ? go('booking') : needSignIn('booking'))
                  : n.id === 'support'
                    ? (user ? go('support') : needSignIn('support'))
                    : go(n.id)}
            >
              <span className="nav-icon-shell" aria-hidden="true"><n.icon size={16}/></span>{n.label}
            </button>
          ))}
          <button
            type="button"
            className={`nav-link ${activeNavigationItem === 'about' ? 'selected' : ''}`}
            aria-current={activeNavigationItem === 'about' ? 'page' : undefined}
            onClick={() => go('about')}
          >
            <span className="nav-icon-shell" aria-hidden="true"><Film size={16}/></span>Our story
          </button>
        </nav>
        <div className="top-actions">
          <label className="search-box">
            <Search size={16}/>
            <input value={query} onChange={(e) => { setQuery(e.target.value); if (page !== 'home') go('home'); }} placeholder="Find a film"/>
            <kbd>⌘ K</kbd>
          </label>
          <div className="notification-wrap">
            <button
              className="icon-btn notification"
              aria-label={notifications.some((item) => !item.read)
                ? `Notifications, ${notifications.filter((item) => !item.read).length} unread`
                : 'Notifications'}
              title="Notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((v) => !v)}
            >
              <Bell size={18}/>
              {notifications.some((n) => !n.read) && <i/>}
            </button>
            {notificationsOpen && (
              <NotificationPanel
                items={notifications}
                onClose={() => setNotificationsOpen(false)}
                onRead={(id) => setNotifications((v) => v.map((n) => (n.id === id ? { ...n, read: true } : n)))}
                onClear={() => setNotifications([])}
                onOpen={(n) => {
                  setNotifications((v) => v.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                  setNotificationsOpen(false);
                  if (n.action === 'details') openDetails(movies.find((movie) => movie.id === n.movieId) || movies[0]);
                  else if (n.action) go(n.action);
                }}
              />
            )}
          </div>
          <button className="profile-button" onClick={() => (user ? go('settings') : needSignIn('home'))}>
            <span className="avatar">{user?.name?.[0] || <User size={15}/>}</span>
            <span className="profile-name">{user?.name || 'Sign in'}</span>
            <ChevronDown size={14}/>
          </button>
        </div>
      </header>

      <main>
        {page === 'home' && (
          <>
            {hero ? <section
              className="hero cinema-hero"
              role="region"
              aria-roledescription="carousel"
              aria-label="Featured films"
              onMouseEnter={() => setHeroPaused(true)}
              onMouseLeave={() => setHeroPaused(false)}
              onFocusCapture={() => setHeroPaused(true)}
              onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHeroPaused(false); }}
            >
              {previousHero && (
                <div
                  className="hero-backdrop hero-backdrop-previous"
                  key={`previous-backdrop-${previousHero.id}`}
                  style={{ backgroundImage: getHeroBackground(previousHero) }}
                />
              )}
              <div
                className="hero-backdrop"
                key={`backdrop-${hero.id}`}
                style={{ backgroundImage: getHeroBackground(hero) }}
              />
              <div className="hero-copy cinema-hero-copy hero-slide-in" key={`copy-${hero.id}`} aria-live="off">
                <div className="hero-edition-line">
                  <span className="live-dot"/> Now in the programme
                  <span>{String(active + 1).padStart(2, '0')} / {String(movies.length).padStart(2, '0')}</span>
                </div>
                <h1>{hero.title}</h1>
                <div className="hero-meta">
                  {hero.rating && <span className="rating"><Star size={14} fill="currentColor"/>{hero.rating}</span>}
                  {hero.year && <span>{hero.year}</span>}
                  {hero.duration && <span>{hero.duration}</span>}
                  {hero.format && <span className="tag">{hero.format}</span>}
                </div>
                <p className="hero-description">{hero.description}</p>
                <div className="hero-buttons">
                  <button className="button button-blue" onClick={() => openBooking(hero)}><Ticket size={17}/> Book tickets</button>
                  {hero.trailer && <button className="hero-text-action" onClick={() => openTrailer(hero)}><Play size={14} fill="currentColor"/> Trailer</button>}
                  <button className="hero-text-action" onClick={() => openDetails(hero)}>Film notes <ArrowRight size={14}/></button>
                </div>
              </div>

              <div className="hero-foot">
                <span>Explore the programme</span>
                <div className="slider-dots" role="group" aria-label="Choose featured film">
                  {movies.map((m, i) => (
                    <button aria-label={`Show ${m.title}`} aria-pressed={i === active} key={m.id} className={i === active ? 'dot active' : 'dot'} onClick={() => setActive(i)}/>
                  ))}
                </div>
                <div className="slider-arrows">
                  <button onClick={() => setActive((current) => (current + movies.length - 1) % movies.length)} aria-label="Previous film"><ArrowLeft size={15}/></button>
                  <button onClick={() => setActive((current) => (current + 1) % movies.length)} aria-label="Next film"><ArrowRight size={15}/></button>
                </div>
              </div>
            </section> : (
              <section className="hero hero-empty" aria-live="polite">
                <div className="hero-empty-copy">
                  <span className="hero-edition-line"><span className="live-dot"/> CinéRegal programme</span>
                  <h1>The next screening is being prepared.</h1>
                  <p>No films are currently published. Please check back soon.</p>
                </div>
              </section>
            )}

            <section className="content-section">
              <div className="section-heading">
                <div>
                  <h2>The programme<span className="serif-dot">.</span></h2>
                  <p className="section-sub">Films currently in the CinéRegal catalogue.</p>
                </div>
                <button className="text-link" onClick={() => document.getElementById('film-grid')?.scrollIntoView({ behavior: getScrollBehavior() })}>
                  Browse all <ArrowRight size={15}/>
                </button>
              </div>
              <div className="discovery-controls">
                <div className="movie-filters" role="group" aria-label="Filter films by genre">
                {['All films', ...availableGenres].map((genre) => (
                  <button
                    type="button"
                    key={genre}
                    className={genreFilter === genre ? 'active' : ''}
                    aria-pressed={genreFilter === genre}
                    onClick={() => setGenreFilter(genre)}
                  >
                    {genre}
                  </button>
                ))}
                </div>
                <div className="discovery-selects">
                  <label>
                    <span>Format</span>
                    <select aria-label="Filter by screen format" value={formatFilter} onChange={(event) => setFormatFilter(event.target.value)}>
                      <option>All formats</option>
                      {availableFormats.map((screenFormat) => <option key={screenFormat}>{screenFormat}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Sort</span>
                    <select aria-label="Sort films" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                      <option value="curated">Featured</option>
                      <option value="rating">Top rated</option>
                      <option value="newest">Newest</option>
                      <option value="title">A–Z</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="discovery-results" aria-live="polite">
                <span>{visibleMovies.length} {visibleMovies.length === 1 ? 'film' : 'films'}{filtersActive ? ' found' : ' in the programme'}</span>
                {filtersActive && <button type="button" onClick={() => { setQuery(''); setGenreFilter('All films'); setFormatFilter('All formats'); setSortBy('curated'); }}>Clear filters</button>}
              </div>
              <div className="movie-grid" id="film-grid">
                {visibleMovies.length ? visibleMovies.map((m, i) => (
                  <MovieCard key={m.id} movie={m} onDetails={openDetails} saved={watchlist.includes(m.id)} onSave={toggleWatch} index={i}/>
                )) : (
                  <div className="empty-state">
                    <Film size={24}/>
                    <b>{movies.length ? 'No films match those filters.' : 'No published films are available yet.'}</b>
                    {movies.length > 0 && <button type="button" className="text-link" onClick={() => { setQuery(''); setGenreFilter('All films'); setFormatFilter('All formats'); setSortBy('curated'); }}>
                      Clear filters <ArrowRight size={14}/>
                    </button>}
                  </div>
                )}
              </div>
            </section>

            <section className="lower-grid content-section">
              <div className="watchlist-panel">
                <div className="panel-heading">
                  <h3>Your watchlist</h3>
                  <Bookmark size={18}/>
                </div>
                {watchlist.length ? (
                  <div className="watchlist-items">
                    {watchlist
                      .slice(0, 3)
                      .map((id) => movies.find((m) => m.id === id))
                      .filter(Boolean)
                      .map((m) => (
                        <button className="watch-item" key={m.id} onClick={() => openDetails(m)}>
                          <MoviePoster movie={m} alt=""/>
                          <span><b>{m.title}</b><small>{m.genre}</small></span>
                          <Play size={15}/>
                        </button>
                      ))}
                  </div>
                ) : (
                  <p className="muted">Films you save will be kept here.</p>
                )}
              </div>

              <div className="critic-panel">
                <div className="panel-heading">
                  <h3>Review notes</h3>
                  <button className="text-link" onClick={() => go('reviews')}>All reviews <ArrowRight size={14}/></button>
                </div>
                {reviewsStatus === 'loading' && <p className="muted" role="status">Loading reviews…</p>}
                {reviewsStatus === 'error' && <p className="muted" role="status">Reader notes are unavailable right now.</p>}
                {reviewsStatus === 'ready' && !highlightedReview && <p className="muted">No reader notes yet.</p>}
                {reviewsStatus === 'ready' && highlightedReview && (
                  <article className="home-review-note">
                    <p>“{highlightedReview.text}”</p>
                    <span>{highlightedReview.movie || highlightedReview.movieTitle}</span>
                    <small>
                      {highlightedReview.isSample ? 'Sample data · ' : ''}
                      {highlightedReview.source || 'Audience review'} · {highlightedReview.author || 'Movie fan'}
                    </small>
                  </article>
                )}
              </div>
            </section>
          </>
        )}

        {page === 'booking' && (selectedMovie ? (
          <BookingPage
            movie={selectedMovie}
            city={city}
            setCity={setCity}
            date={date}
            setDate={setDate}
            format={format}
            setFormat={setFormat}
            selectedTheatre={selectedTheatre}
            setSelectedTheatre={setSelectedTheatre}
            screenLayout={screenLayout}
            setScreenLayout={setScreenLayout}
            seats={selectedSeats}
            setSeats={setSelectedSeats}
            showtime={showtime}
            setShowtime={setShowtime}
            onCheckout={() => {
              if (!needSignIn('checkout')) return;
              setCheckoutDone(false);
              setConfirmationCode('');
              setConfirmedBooking(null);
              go('checkout');
            }}
          />
        ) : <section className="content-section"><div className="empty-state"><Film size={24}/><b>No published films are available to book yet.</b></div></section>)}

        {page === 'details' && selectedMovie && (
            <DetailsPage
            key={selectedMovie.id}
            movie={selectedMovie}
            reviews={submittedReviews.filter((review) => (review.movie || review.movieTitle) === selectedMovie.title)}
            reviewsStatus={reviewsStatus}
            onBook={openBooking}
            onTrailer={() => openTrailer(selectedMovie)}
            onBack={() => go('home')}
            onReviews={() => { setReviewFilter(selectedMovie.title); go('reviews'); }}
          />
        )}
        {page === 'details' && !selectedMovie && (
          <section className="content-section"><div className="empty-state"><Film size={24}/><b>This film is no longer available.</b><button type="button" className="text-link" onClick={() => go('home')}>Back to Discover <ArrowRight size={14}/></button></div></section>
        )}

        {page === 'checkout' && selectedMovie && (
          <CheckoutPage
            movie={selectedMovie}
            seats={selectedSeats}
            city={city}
            date={date}
            showtime={showtime}
            theatre={selectedTheatre}
            screenLayout={screenLayout}
            confirmationCode={confirmationCode}
            done={checkoutDone}
            booking={confirmedBooking}
            onViewReceipt={() => confirmedBooking && setReceiptBooking(confirmedBooking)}
            user={user}
            onPay={async (paymentMethod) => {
              try {
                const res = await api.createBooking({
                  movieTitle: selectedMovie.title,
                  movieId: selectedMovie.id,
                  seats: [...selectedSeats],
                  city,
                  date,
                  showtime,
                  theatre: selectedTheatre,
                  screenLayout,
                  paymentMethod,
                  userName: user?.name,
                  userEmail: user?.email,
                });
                const entry = {
                  id: res?._id || Date.now(),
                  movie: selectedMovie.title,
                  seats: [...selectedSeats],
                  city,
                  date,
                  showtime,
                  theatre: selectedTheatre,
                  screenLayout,
                  total: res?.total ?? (selectedSeats.length * ({ standard: 320, imax: 380, luxe: 450 }[screenLayout] || 320) + (selectedSeats.length ? 36 : 0)),
                  ticketPrice: res?.ticketPrice ?? ({ standard: 320, imax: 380, luxe: 450 }[screenLayout] || 320),
                  convenienceFee: res?.convenienceFee ?? (selectedSeats.length ? 36 : 0),
                  bookingCode: res?.bookingCode,
                  status: res?.status || 'confirmed',
                  paymentStatus: res?.paymentStatus || 'demo',
                  paymentMethod: res?.paymentMethod || paymentMethod,
                  refundStatus: res?.refundStatus || 'not_requested',
                  createdAt: res?.createdAt || new Date().toISOString(),
                };
                setBookingHistory((h) => [entry, ...h]);
                setBookingHistoryStatus('ready');
                setConfirmationCode(res?.bookingCode || '');
                setConfirmedBooking(entry);
                setCheckoutDone(true);
                addNotification({
                  title: 'Booking confirmed',
                  detail: `${res?.bookingCode || selectedMovie.title} · ${selectedSeats.length} ${selectedSeats.length === 1 ? 'seat' : 'seats'}`,
                  action: 'history',
                });
                notify('Booking confirmed and saved to backend!');
              } catch (err) {
                notify(err.message || 'Error completing booking');
              }
            }}
            onBack={() => go('booking')}
          />
        )}
        {page === 'checkout' && !selectedMovie && (
          <section className="content-section"><div className="empty-state"><Film size={24}/><b>No published film is available for this checkout.</b><button type="button" className="text-link" onClick={() => go('home')}>Back to Discover <ArrowRight size={14}/></button></div></section>
        )}

        {page === 'reviews' && (
          <ReviewsPage
            movies={movies}
            reviews={submittedReviews}
            status={reviewsStatus}
            initialFilter={reviewFilter}
            onRetry={() => setReviewsRetry((retry) => retry + 1)}
            text={reviewText}
            setText={setReviewText}
            onRequireSignIn={() => needSignIn('reviews')}
            onSubmit={async (movieTitle, rating) => {
              if (!needSignIn('reviews')) return;
              if (!reviewText.trim()) return notify('Write a few words before posting');
              try {
                const created = await api.createReview({
                  movieId: movies.find((movie) => movie.title === movieTitle)?.id,
                  movieTitle,
                  rating,
                  text: reviewText.trim(),
                  author: user?.name || 'Movie fan',
                });
                if (!created) throw new Error('Review was not returned by the service');
                setSubmittedReviews((current) => [created, ...current]);
                setReviewsStatus('ready');
                setReviewText('');
                notify('Your review is live on CinéRegal');
              } catch (err) {
                notify(err.message || 'Failed to submit review');
              }
            }}
          />
        )}

        {page === 'history' && (
          <HistoryPage
            history={bookingHistory}
            status={bookingHistoryStatus}
            onRetry={() => setBookingHistoryRetry((retry) => retry + 1)}
            onBook={() => go('home')}
            onCancel={cancelUserBooking}
            bookingActionId={bookingActionId}
            onReceipt={setReceiptBooking}
          />
        )}

        {page === 'support' && (
          user ? (
            <SupportPage
              email={user.email}
              tickets={supportTickets}
              status={supportStatus}
              onRetry={() => setSupportRetry((retry) => retry + 1)}
              onCreate={createSupportTicket}
              onToast={notify}
            />
          ) : (
            <SignInPrompt
              title="Support follows your account"
              description="Sign in or create an account to open a support ticket and track its status."
              onSignIn={() => {
                setPendingPage('support');
                setModal('login');
                go('auth');
              }}
            />
          )
        )}

        {page === 'settings' && (
          user ? (
            <SettingsPage
              user={user}
              onSave={async (updated) => {
                try {
                  const saved = await api.updateProfile(updated);
                  setUser(saved || updated);
                  notify('Profile saved to backend');
                } catch {
                  setUser(updated);
                  notify('Profile saved on this device; account sync is unavailable');
                }
              }}
              onSignOut={signOut}
              onToast={notify}
              onPage={go}
            />
          ) : (
            <SignInPrompt
              onSignIn={() => {
                setPendingPage('settings');
                setModal('login');
                go('auth');
              }}
            />
          )
        )}

        {page === 'about' && <AboutPage onPage={go}/>}

        {page === 'feedback' && <FeedbackPage onToast={notify}/>}

        {page === 'auth' && (
          <AuthPage
            mode={modal || 'login'}
            onMode={setModal}
            onBack={() => {
              setModal('');
              go(pendingPage);
            }}
            onToast={notify}
            onSuccess={(profile) => {
              setAuthAnimation('signing-in');
              setUser(profile);
              setModal('');
              go(pendingPage);
              notify(`Welcome, ${profile.name}`);
              setTimeout(() => setAuthAnimation(''), 720);
            }}
          />
        )}
      </main>

      <footer className="footer">
        <button className="brand footer-brand" onClick={() => go('home')}>
          <span className="brand-mark"><Film size={17}/></span>
          <span>CINÉ<span>REGAL</span></span>
        </button>
        <span className="footer-note">Films, reviews, and screening plans.</span>
        <div className="footer-links">
          <button onClick={() => go('about')}>About</button>
          <button onClick={() => go('feedback')}>Share feedback</button>
          <button onClick={() => { setModal('login'); go('auth'); }}>Sign in</button>
          <button onClick={() => (user ? go('support') : needSignIn('support'))}>Help & support</button>
          <a href="/admin/login">Admin sign in</a>
        </div>
        <small>© 2026 CinéRegal</small>
      </footer>

      {authAnimation && (
        <div className={`auth-transition ${authAnimation}`}>
          <span className="transition-mark"><Film size={28}/></span>
          <b>{authAnimation === 'signing-in' ? 'Welcome to CinéRegal' : 'Until the next show.'}</b>
          <small>{authAnimation === 'signing-in' ? 'Your cinema evening is ready' : 'You have been safely signed out'}</small>
        </div>
      )}

      {modal === 'trailer' && (
        <div className={`modal-backdrop ${modalClosing ? 'is-closing' : ''}`} onClick={closeTrailer}>
          <div className={`trailer-modal ${modalClosing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-label={`${selectedMovie.title} trailer`} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" aria-label="Close trailer" onClick={closeTrailer}><X size={19}/></button>
            <div className="trailer-embed">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedMovie.trailer}?autoplay=1&rel=0`}
                title={`${selectedMovie.title} official trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <p className="trailer-caption">OFFICIAL TRAILER · {selectedMovie.title}</p>
          </div>
        </div>
      )}

      {receiptBooking && (
        <BookingReceipt booking={receiptBooking} onClose={() => setReceiptBooking(null)}/>
      )}

      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  );
}

function MovieCard({ movie, onDetails, onBook, saved, onSave, index }) {
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [observed, setObserved] = useState(false);
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      setObserved(true);
      if (entry.isIntersecting) { setVisible(true); observer.unobserve(node); }
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <article ref={cardRef} className={`movie-card motion-reveal ${observed ? 'is-observed' : ''} ${visible ? 'is-visible' : ''}`} style={{ '--delay': `${Math.min(index, 6) * 65}ms` }}>
      <div className="poster-wrap">
        <MoviePoster movie={movie} alt={`${movie.title} film poster`} loading="lazy"/>
        <button type="button" className="poster-overlay" aria-label={`See ${movie.title} film details`} onClick={() => onDetails(movie)}>
          <span><Film size={14}/> See film details</span>
        </button>
        {movie.rating && <span className="poster-rating"><Star size={12} fill="currentColor"/>{movie.rating}</span>}
        <button
          type="button"
          className={`save-button ${saved ? 'saved' : ''}`}
          aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
          aria-pressed={saved}
          onClick={(e) => { e.stopPropagation(); onSave(movie.id); }}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'}/>
        </button>
      </div>
      <div className="movie-info">
        <button type="button" className="movie-info-copy" onClick={() => onDetails(movie)}>
          <h3>{movie.title}</h3>
          <p>{[movie.genre, movie.year].filter(Boolean).join(' · ')}</p>
        </button>
        <button type="button" className="mini-book" onClick={() => onDetails(movie)} aria-label={`See ${movie.title} details`}>
          <ArrowRight size={16}/>
        </button>
      </div>
    </article>
  );
}

function MoviePoster({ movie, alt, className = '', loading }) {
  const [failed, setFailed] = useState(false);
  if (failed || !movie.poster) {
    return <div className={`poster-image-fallback ${className}`.trim()} role="img" aria-label={`${movie.title} poster unavailable`}><Film size={24}/><b>{movie.title}</b></div>;
  }
  return <img className={className || undefined} src={movie.poster} alt={alt} loading={loading} onError={() => setFailed(true)}/>;
}

function NotificationPanel({ items, onClose, onRead, onClear, onOpen }) {
  return (
    <div className="notification-panel" role="region" aria-label="Notifications">
      <div className="notification-panel-head">
        <div>
          <b>Notifications</b>
          <small>{items.filter((n) => !n.read).length} unread</small>
        </div>
        <div className="notification-panel-actions">
          {items.length > 0 && <button onClick={onClear}>Clear all</button>}
          <button type="button" className="notification-panel-close" onClick={onClose} aria-label="Close notifications"><X size={15}/></button>
        </div>
      </div>
      {items.length ? (
        items.map((n) => (
          <button key={n.id} className={`notification-item ${n.read ? 'read' : ''}`} onClick={() => onOpen(n)}>
            <span className="notification-dot"/>
            <span><b>{n.title}</b><small>{n.detail}</small><em>{formatNotificationTime(n.createdAt || n.time)}</em></span>
          </button>
        ))
      ) : (
        <div className="notification-empty">
          <Bell size={20}/>
          <span>No notifications yet. Booking confirmations and support updates will appear here.</span>
        </div>
      )}
      {items.length > 0 && <button className="mark-read" onClick={() => items.forEach((n) => onRead(n.id))}>Mark all as read</button>}
    </div>
  );
}

function DetailsPage({ movie, reviews, reviewsStatus, onBook, onTrailer, onBack, onReviews }) {
  const releaseDate = movie.release || (movie.releaseDate && !Number.isNaN(new Date(movie.releaseDate).getTime())
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(movie.releaseDate))
    : '') || movie.year || '';
  const hasRating = movie.rating !== undefined && movie.rating !== null && movie.rating !== '';
  const backdrop = movie.backdrop || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80';

  return (
    <div className="details-page">
      <section className="details-hero" aria-labelledby="details-title" style={{ backgroundImage: 'linear-gradient(90deg,#091d35f2,#0d2949c9 55%,#0c203b45),url("' + backdrop + '"),url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80")' }}>
        <button type="button" className="details-back" onClick={onBack}><ArrowLeft size={15}/> Back to films</button>
        <div className="details-hero-copy">
          <div className="eyebrow"><span className="live-dot"/> From the programme</div>
          <h1 id="details-title">{movie.title}</h1>
          <div className="hero-meta" aria-label="Movie information">
            {hasRating && <span className="rating"><Star size={14} fill="currentColor"/>{movie.rating} / 10</span>}
            {releaseDate && <span>{releaseDate}</span>}
            {movie.genre && <span>{movie.genre}</span>}
            {movie.duration && <span>{movie.duration}</span>}
            {movie.format && <span className="tag">{movie.format}</span>}
          </div>
          <p className="details-synopsis">{movie.description || 'Synopsis is not available for this film yet.'}</p>
          <div className="hero-buttons">
            <button type="button" className="button button-light" onClick={() => onBook(movie)}><Ticket size={16}/> Find tickets</button>
            {movie.trailer && <button type="button" className="button button-glass" onClick={onTrailer}><Play size={15} fill="currentColor"/> Play trailer</button>}
          </div>
        </div>
      </section>
      <div className="details-content">
        <section className="details-main" aria-label={movie.title + ' cast and reviews'}>
          <section className="details-block" aria-labelledby="details-cast-title">
            <div className="eyebrow blue">CAST & FILMMAKER</div>
            <h2 id="details-cast-title">People on screen</h2>
            <div className="cast-grid">
              {movie.cast?.length ? movie.cast.map((name) => (
                <div className="cast-member" key={name}>
                  <span className="cast-initial" aria-hidden="true">{name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</span>
                  <b>{name}</b>
                </div>
              )) : <p className="muted">Cast details are not available.</p>}
            </div>
            {movie.director && <div className="director-line">
              <span>DIRECTED BY</span>
              <b>{movie.director}</b>
            </div>}
          </section>
          <section className="details-block" aria-labelledby="details-reviews-title">
            <div className="eyebrow blue">REVIEWS & NOTES</div>
            <h2 id="details-reviews-title">Reviews</h2>
            {reviewsStatus === 'loading' && <p className="loading-state" role="status">Loading audience reviews...</p>}
            {reviewsStatus === 'error' && <p className="error-state" role="status">Audience reviews could not be loaded.</p>}
            {reviewsStatus === 'ready' && reviews.length === 0 && <p className="muted">No audience reviews for this film yet.</p>}
            {reviews.slice(0, 3).map((review, index) => (
              <article className="details-review" key={review._id || review.author + '-' + index}>
                <span className="stars-gold" aria-label={review.rating + ' out of 5 stars'}>{'\u2605'.repeat(Math.min(5, Number(review.rating) || 0))}</span>
                <p>&ldquo;{review.text}&rdquo;</p>
                <small>{review.source || 'AUDIENCE REVIEW'} <span aria-hidden="true">&middot;</span> {review.author || 'Movie fan'} <span aria-hidden="true">&middot;</span> {review.isSample ? 'Example' : review.date || 'Recently'}</small>
              </article>
            ))}
            <button type="button" className="imdb-link" onClick={onReviews}>Read reviews for {movie.title} <ArrowRight size={14}/></button>
            {movie.imdb && <a className="imdb-link" href={'https://www.imdb.com/title/' + movie.imdb + '/'} target="_blank" rel="noreferrer">
              View IMDb title page <ArrowRight size={14}/>
            </a>}
          </section>
        </section>
        <aside className="details-side" aria-label={movie.title + ' film information and booking'}>
          <div className="details-poster-frame">
            <MoviePoster key={movie.poster || movie.title} movie={movie} alt={movie.title + ' poster'} className="details-poster-image" loading="eager"/>
          </div>
          <dl className="details-side-meta">
            {releaseDate && <div><dt>Release date</dt><dd>{releaseDate}</dd></div>}
            {movie.genre && <div><dt>Genre</dt><dd>{movie.genre}</dd></div>}
            {movie.duration && <div><dt>Runtime</dt><dd>{movie.duration}</dd></div>}
            {hasRating && <div><dt>Rating</dt><dd><Star size={13} fill="currentColor"/> {movie.rating} / 10</dd></div>}
          </dl>
          <button type="button" className="button button-blue full-button" onClick={() => onBook(movie)}>
            Book a screening <Ticket size={15}/>
          </button>
        </aside>
      </div>
    </div>
  );
}

function CheckoutPage({ movie, seats, city, date, showtime, theatre, screenLayout, confirmationCode, done, booking, onViewReceipt, onPay, onBack, user }) {
  const [method, setMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const ticketPrice = { standard: 320, imax: 380, luxe: 450 }[screenLayout] || 320;
  const total = seats.length * ticketPrice + (seats.length ? 36 : 0);

  const handlePayClick = async () => {
    setSubmitting(true);
    try {
      await onPay(method);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrap checkout-page">
      <div className="eyebrow blue">DEMO CHECKOUT</div>
      <h1>One last step<span className="serif-dot">.</span></h1>
      <p className="section-sub">Review your cinema plans before confirming.</p>
      {done ? (
        <div className="success-card checkout-success">
          <span className="success-icon"><Check size={25}/></span>
          <h2>Your booking is confirmed.</h2>
          <p>{seats.length} seat{seats.length === 1 ? '' : 's'} for {movie.title} at {theatre} are saved to your CinéRegal history.</p>
          <div className="confirmation-code">{confirmationCode || 'Booking saved'}</div>
          <button type="button" className="button button-blue" onClick={onViewReceipt} disabled={!booking}>
            <Printer size={16}/> View / print receipt
          </button>
          <button className="button button-blue" onClick={() => window.scrollTo({ top: 0, behavior: getScrollBehavior() })}>Done</button>
        </div>
      ) : (
        <div className="checkout-layout">
          <section className="checkout-form">
            <button className="back-inline" onClick={onBack}><ArrowLeft size={14}/> Back to seats</button>
            <h2>Payment details</h2>
            <p>Demo checkout · no payment is processed or card data collected.</p>
            <div className="payment-tabs">
              <button className={method === 'card' ? 'active' : ''} aria-pressed={method === 'card'} onClick={() => setMethod('card')}>Card · demo</button>
              <button className={method === 'upi' ? 'active' : ''} aria-pressed={method === 'upi'} onClick={() => setMethod('upi')}>UPI · demo</button>
            </div>
            <div className="checkout-demo-note">
              <ShieldCheck size={18}/>
              <span>{user?.name ? `Reservation will be saved to ${user.name}’s account.` : 'Sign in is required to save this reservation.'}</span>
            </div>
            <button className="button button-blue full-button pay-button" disabled={submitting || !seats.length} onClick={handlePayClick}>
              {submitting ? 'Confirming reservation...' : 'Confirm booking'} <ArrowRight size={15}/>
            </button>
            <small className="demo-disclaimer"><ShieldCheck size={14}/> Cinema listings are sample data; this confirmation does not issue a real ticket.</small>
          </section>
          <aside className="order-summary">
            <div className="eyebrow blue">YOUR EVENING</div>
            <h2>{movie.title}</h2>
            <p>{theatre} · {city} · {formatScreeningDate(date)} · {showtime}</p>
            <div className="summary-divider"/>
            <div className="summary-line"><span>Seats</span><b>{seats.join(', ') || '—'}</b></div>
            <div className="summary-line"><span>{screenLayout} · tickets ({seats.length})</span><b>₹{seats.length * ticketPrice}</b></div>
            <div className="summary-line"><span>Convenience fee</span><b>₹{seats.length ? 36 : 0}</b></div>
            <div className="summary-divider"/>
            <div className="summary-line total"><span>Total</span><b>₹{total}</b></div>
          </aside>
        </div>
      )}
    </div>
  );
}

function BookingReceipt({ booking, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const paymentLabel = booking.paymentStatus === 'demo' || booking.paymentStatus === 'completed'
    ? 'Demo booking · no payment collected'
    : booking.paymentStatus || 'Not recorded';
  const isDemoBooking = booking.paymentStatus === 'demo' || booking.paymentStatus === 'completed' || !booking.paymentStatus;
  const refundLabel = booking.refundStatus && booking.refundStatus !== 'not_requested'
    ? booking.refundStatus.replaceAll('_', ' ')
    : '';

  return (
    <div className="receipt-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="receipt-dialog" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
        <div className="receipt-toolbar">
          <span className="eyebrow blue">BOOKING RECEIPT</span>
          <button type="button" className="modal-close" aria-label="Close receipt" onClick={onClose}><X size={19}/></button>
        </div>
        <article className="booking-receipt">
          <header className="receipt-brand">
            <span className="brand-mark"><Film size={19}/></span>
            <div>
              <b>CinéRegal</b>
              <span>SCREENING RESERVATION</span>
            </div>
            <span className={`receipt-status ${booking.status === 'cancelled' ? 'is-cancelled' : ''}`}>
              {booking.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
            </span>
          </header>
          <div className="receipt-divider"/>
          <p className="receipt-kicker">BOOKING REFERENCE</p>
          <h2 id="receipt-title">{booking.bookingCode || 'Reference unavailable'}</h2>
          <h3 className="receipt-movie">{booking.movie}</h3>
          <div className="receipt-details">
            <div><span>Cinema</span><b>{booking.theatre || 'Cinema to be confirmed'}</b></div>
            <div><span>City</span><b>{booking.city || '—'}</b></div>
            <div><span>Screening</span><b>{formatScreeningDate(booking.date)} · {booking.showtime || 'Time to be confirmed'}</b></div>
            <div><span>Screen format</span><b>{(booking.screenLayout || 'standard').toUpperCase()}</b></div>
            <div><span>Seats</span><b>{booking.seats?.join(', ') || '—'}</b></div>
            <div><span>Payment status</span><b>{paymentLabel}</b></div>
            {refundLabel && <div><span>Refund status</span><b>{refundLabel}</b></div>}
            {booking.createdAt && <div><span>Booked on</span><b>{formatActivityDate(booking.createdAt)}</b></div>}
          </div>
          <div className="receipt-total">
            <span>Reservation total</span>
            <b>₹{Number(booking.total || 0).toLocaleString('en-IN')}</b>
          </div>
          <p className="receipt-notice">
            {isDemoBooking
              ? 'This is a booking receipt for a demo reservation, not an admission ticket. No payment was collected.'
              : 'This booking receipt is not an admission ticket. Refer to the payment status above for the recorded transaction state.'}
          </p>
        </article>
        <div className="receipt-actions">
          <button type="button" className="button button-blue" onClick={() => window.print()}><Printer size={16}/> Print receipt</button>
          <button type="button" className="button button-light" onClick={onClose}>Close</button>
        </div>
      </section>
    </div>
  );
}

function BookingPage({ movie, city, setCity, date, setDate, format, setFormat, selectedTheatre, setSelectedTheatre, screenLayout, setScreenLayout, seats, setSeats, showtime, setShowtime, onCheckout }) {
  const [bookingStep, setBookingStep] = useState('screening');
  const lastBookingStepRef = useRef('screening');
  const screeningHeadingRef = useRef(null);
  const seatsHeadingRef = useRef(null);
  const [theatres, setTheatres] = useState([]);
  const [theatresStatus, setTheatresStatus] = useState('loading');
  const [theatreRetry, setTheatreRetry] = useState(0);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [seatStatus, setSeatStatus] = useState('idle');
  const [seatError, setSeatError] = useState('');
  const [seatRetry, setSeatRetry] = useState(0);

  const configs = {
    standard: { label: 'Standard · 7 rows', rows: 7, cols: 10 },
    imax: { label: 'IMAX · 9 rows', rows: 9, cols: 12 },
    luxe: { label: 'Luxe recliners · 5 rows', rows: 5, cols: 8 },
  };
  const config = configs[screenLayout];

  const visibleTheatres = theatres.filter((theatre) => (
    format === 'All formats' ||
    (theatre.formats || [theatre.flag]).some((theatreFormat) => theatreFormat?.toLowerCase() === format.toLowerCase())
  ));
  const currentTheatre = visibleTheatres.find((theatre) => theatre.name === selectedTheatre);
  const hasSelectedScreening = Boolean(currentTheatre && showtime);
  const bookingDates = Array.from({ length: 7 }, (_, offset) => {
    const screeningDate = new Date();
    screeningDate.setHours(12, 0, 0, 0);
    screeningDate.setDate(screeningDate.getDate() + offset);
    return {
      value: getLocalDateString(screeningDate),
      weekday: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(screeningDate),
      day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(screeningDate),
      month: new Intl.DateTimeFormat('en', { month: 'short' }).format(screeningDate),
    };
  });

  useEffect(() => {
    let active = true;
    setTheatresStatus('loading');
    setTheatres([]);
    setSelectedTheatre('');
    setSeats([]);
    api.getTheatres(city).then((list) => {
      if (!active) return;
      if (list === null) {
        setTheatresStatus('error');
        return;
      }
      setTheatres(list);
      setTheatresStatus('ready');
    });
    return () => { active = false; };
  }, [city, theatreRetry]);

  useEffect(() => {
    const availableTheatres = theatres.filter((theatre) => (
      format === 'All formats' ||
      (theatre.formats || [theatre.flag]).some((theatreFormat) => theatreFormat?.toLowerCase() === format.toLowerCase())
    ));
    if (!availableTheatres.length) {
      if (selectedTheatre) {
        setSelectedTheatre('');
        setSeats([]);
      }
      return;
    }
    if (!availableTheatres.some((theatre) => theatre.name === selectedTheatre)) {
      setSelectedTheatre(availableTheatres[0].name);
      setShowtime(availableTheatres[0].times?.[0] || '');
      setSeats([]);
    }
  }, [theatres, format, selectedTheatre, setSelectedTheatre, setShowtime, setSeats]);

  useEffect(() => {
    if (!currentTheatre || !showtime) {
      setBookedSeats([]);
      setSeatStatus('idle');
      return;
    }
    let active = true;
    setSeatStatus('loading');
    setSeatError('');
    api.getBookedSeats(movie.title, date, showtime, city, currentTheatre.name, screenLayout).then((list) => {
      if (!active) return;
      setBookedSeats(list);
      setSeatStatus('ready');
    }).catch((error) => {
      if (!active) return;
      setSeatError(error.message || 'Could not load seat availability');
      setSeatStatus('error');
    });
    return () => { active = false; };
  }, [movie.title, date, showtime, city, currentTheatre?.name, screenLayout, seatRetry]);

  const toggle = (n) => setSeats((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const ticketPrices = { standard: 320, imax: 380, luxe: 450 };
  const ticketPrice = ticketPrices[screenLayout] || ticketPrices.standard;
  const screenNames = { standard: 'Standard', imax: 'IMAX', luxe: 'Luxe recliner' };

  useEffect(() => {
    if (lastBookingStepRef.current === bookingStep) return;
    lastBookingStepRef.current = bookingStep;
    const heading = bookingStep === 'seats' ? seatsHeadingRef.current : screeningHeadingRef.current;
    if (!heading) return;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' });
  }, [bookingStep]);

  return (
    <div className="page-wrap booking-page">
      <section className="booking-film-banner" style={{ backgroundImage: getHeroBackground(movie) }} aria-label={`Booking ${movie.title}`}>
        <div className="booking-film-poster"><MoviePoster movie={movie} alt={`${movie.title} poster`} loading="lazy"/></div>
        <div className="booking-film-copy">
          <span className="booking-film-kicker"><Ticket size={13}/> CINÉREGAL SCREENINGS</span>
          <h2>{movie.title}</h2>
          <p>{[movie.genre, movie.year, movie.duration].filter(Boolean).join(' · ')}</p>
          {movie.rating && <span className="booking-film-rating"><Star size={13} fill="currentColor"/> {movie.rating} <i>audience rating</i></span>}
        </div>
        <span className="booking-film-note">Choose a showtime<br/>that works for you</span>
      </section>
      <header className="booking-title-row">
        <div className="booking-heading">
          <div className="eyebrow blue">YOUR CINEMA VISIT</div>
          <h1>Choose a show<span className="serif-dot">.</span></h1>
          <p className="section-sub">Select a date and cinema, then pick your seats.</p>
        </div>
        <label className="booking-city">
          <span className="booking-control-caption">City</span>
          <MapPin size={16}/>
          <select aria-label="City" value={city} onChange={(e) => { setCity(e.target.value); setSeats([]); }}>
            {INDIAN_CITIES.map((x) => (<option key={x}>{x}</option>))}
          </select>
        </label>
      </header>

      <ol className="booking-steps" aria-label="Booking steps">
        <li className={bookingStep === 'screening' ? 'booking-step is-current' : 'booking-step is-complete'} aria-current={bookingStep === 'screening' ? 'step' : undefined}>
          <span>01</span><b>Cinema & time</b>
        </li>
        <li className={`booking-step ${bookingStep === 'seats' ? 'is-current' : ''}`} aria-current={bookingStep === 'seats' ? 'step' : undefined}>
          <span>02</span><b>Seats</b>
        </li>
        <li className="booking-step"><span>03</span><b>Confirmation</b></li>
      </ol>

      {bookingStep === 'screening' && <>
      <div className="booking-date-strip" role="group" aria-label="Choose screening date">
        <div className="booking-date-label"><CalendarDays size={17}/><span>Screening date</span></div>
        <div className="booking-date-options">
          {bookingDates.map((screeningDate) => (
            <button key={screeningDate.value} type="button" className={date === screeningDate.value ? 'booking-date-option active' : 'booking-date-option'} aria-pressed={date === screeningDate.value} onClick={() => { setDate(screeningDate.value); setSeats([]); }}>
              <small>{screeningDate.weekday}</small><b>{screeningDate.day}</b><small>{screeningDate.month}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="booking-filters">
        <label className="booking-filter">
          <span className="booking-control-caption">Screening date</span>
          <span className="booking-filter-control">
            <CalendarDays size={16}/>
            <input
              aria-label="Screening date"
              type="date"
              min={getLocalDateString()}
              value={date}
              onChange={(e) => { setDate(e.target.value); setSeats([]); }}
            />
          </span>
        </label>
        <label className="booking-filter">
          <span className="booking-control-caption">Format</span>
          <span className="booking-filter-control">
            <Film size={16}/>
            <select aria-label="Screen format" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option>All formats</option>
              <option>IMAX</option>
              <option>4K</option>
              <option>Dolby Atmos</option>
            </select>
          </span>
        </label>
        <span className="booking-filter-count">
          {theatresStatus === 'loading' ? 'Finding cinemas…' : `${visibleTheatres.length} listings · ${city}`}
        </span>
      </div>
      </>}

      {bookingStep === 'screening' ? <div className="booking-stage screening-stage" key="screening-stage">
      <div className="booking-layout screening-layout">
        <section className="theater-list">
          <div className="list-head">
            <div>
              <span className="booking-step-kicker">01 / CINEMA & TIME</span>
              <h2 ref={screeningHeadingRef} tabIndex="-1">Choose your screening</h2>
            </div>
            <span>{theatresStatus === 'ready' ? `${visibleTheatres.length} options` : 'Cinema listings'}</span>
          </div>
          {theatresStatus === 'loading' && <div className="loading-state" role="status">Loading cinemas for {city}…</div>}
          {theatresStatus === 'error' && (
            <div className="error-state" role="alert">
              <b>Cinema listings are unavailable.</b>
              <span>Check your connection to the CinéRegal service and try again.</span>
              <button type="button" className="text-link" onClick={() => setTheatreRetry((retry) => retry + 1)}>Retry <ArrowRight size={14}/></button>
            </div>
          )}
          {theatresStatus === 'ready' && !visibleTheatres.length && (
            <div className="empty-state">No cinemas offer {format} in {city}. Try another format or city.</div>
          )}
          {visibleTheatres.map((t) => (
            <article className={`theater-card ${selectedTheatre === t.name ? 'active-theatre' : ''}`} key={t._id || t.name}>
              <div className="theater-top">
                <div>
                  <h3>{t.name}</h3>
                  <p><MapPin size={13}/>{t.place}</p>
                  {t.isSample && <small className="sample-listing-note">Sample listing · schedule and seats are for demonstration</small>}
                </div>
                <div className="theater-top-actions">
                  <span className="theater-format">{t.flag}</span>
                  <button
                    type="button"
                    className="theater-select"
                    aria-pressed={selectedTheatre === t.name}
                    onClick={() => {
                      setSelectedTheatre(t.name);
                      if (t.times?.length && !t.times.includes(showtime)) setShowtime(t.times[0]);
                      setSeats([]);
                    }}
                  >
                    {selectedTheatre === t.name ? 'Selected' : 'Choose'}
                  </button>
                </div>
              </div>
              <div className="showtimes">
                {t.times.map((time) => (
                  <button
                    type="button"
                    key={time}
                    className={`showtime ${selectedTheatre === t.name && showtime === time ? 'selected-showtime' : ''}`}
                    aria-pressed={selectedTheatre === t.name && showtime === time}
                    onClick={() => {
                      setSelectedTheatre(t.name);
                      setShowtime(time);
                      setSeats([]);
                    }}
                  >
                    <b>{time}</b>
                    <small>{(t.formats || [t.flag]).slice(0, 2).join(' · ')}</small>
                  </button>
                ))}
              </div>
              <div className="theater-amenities">
                {(t.amenities || []).filter((amenity) => !['Available', 'Few seats'].includes(amenity)).map((amenity) => <span key={amenity}><Armchair size={13}/>{amenity}</span>)}
              </div>
            </article>
          ))}
        </section>

      </div>
      <section className="screen-experience-picker" aria-labelledby="screen-experience-title">
        <div className="screen-experience-heading">
          <div>
            <span className="booking-step-kicker">SCREEN EXPERIENCE</span>
            <h2 id="screen-experience-title">Choose your screen</h2>
          </div>
          <p>Ticket price is shown per seat</p>
        </div>
        <div className="screen-experience-options">
          {Object.entries(configs).map(([layout, details]) => (
            <button key={layout} type="button" className={`screen-experience-option ${screenLayout === layout ? 'selected' : ''}`} aria-pressed={screenLayout === layout} onClick={() => { setScreenLayout(layout); setSeats([]); }}>
              <span className="screen-option-icon"><Film size={17}/></span>
              <span className="screen-option-copy"><b>{screenNames[layout]}</b><small>{details.label.split(' · ')[1]}</small></span>
              <strong>₹{ticketPrices[layout]}<small>/ seat</small></strong>
              <span className="screen-option-check"><Check size={13}/></span>
            </button>
          ))}
        </div>
      </section>
      <div className="screening-continue-bar">
        <div className="screening-continue-copy">
          <span className="booking-step-kicker">YOUR SCREENING</span>
          <b>{currentTheatre?.name || 'Choose a cinema and showtime'}</b>
          <small>{currentTheatre ? `${formatScreeningDate(date)} · ${showtime} · ${screenNames[screenLayout]}` : 'Select a showtime to continue'}</small>
        </div>
        <button type="button" className="button button-blue" disabled={!hasSelectedScreening || theatresStatus !== 'ready'} onClick={() => setBookingStep('seats')}>
          Choose seats <ArrowRight size={16}/>
        </button>
      </div>
      </div> : <div className="booking-stage seat-stage" key="seat-stage">
        <div className="seat-stage-heading" ref={seatsHeadingRef} tabIndex="-1">
          <div>
            <span className="booking-step-kicker">SCREENING SELECTED</span>
            <h2>Now, find your seats.</h2>
            <p>{currentTheatre?.name} · {city} · {formatScreeningDate(date)} · {showtime} · {screenNames[screenLayout]}</p>
          </div>
          <button type="button" className="change-screening-button" onClick={() => setBookingStep('screening')}><ArrowLeft size={14}/> Change screening</button>
        </div>
        <aside className="seat-card" id="seat-select">
          <div className="seat-head">
            <span className="booking-step-kicker">02 / SEATS</span>
            <h2>Choose your seats</h2>
            <p className="seat-selection-context">
              <b>{movie.title}</b>
              <span>{currentTheatre?.name || 'Choose a cinema'} · {formatScreeningDate(date)} · {showtime}</span>
            </p>
          </div>
          <div className="seat-legend">
            <span><i className="legend-seat"/> Available</span>
            <span><i className="legend-seat taken"/> Taken</span>
            <span><i className="legend-seat chosen"/> Yours</span>
          </div>
          {currentTheatre?.isSample && (
            <p className="sample-listing-note seat-sample-note">Sample theatre, schedule, seat and price data; none is live.</p>
          )}
          {seatStatus === 'loading' && <p className="seat-status" role="status">Checking seat availability…</p>}
          {seatStatus === 'error' && (
            <div className="error-state seat-error" role="alert">
              <span>{seatError}</span>
              <button type="button" className="text-link" onClick={() => setSeatRetry((retry) => retry + 1)}>Retry <ArrowRight size={14}/></button>
            </div>
          )}
          <div className="screen-area">
            <div className={`screen-shape screen-${screenLayout}`}/>
            <small>{screenLayout === 'imax' ? 'CURVED IMAX SCREEN' : screenLayout === 'luxe' ? 'LUXE SCREEN' : 'SCREEN THIS WAY'}</small>
          </div>
          <div className={`seat-map seat-map-${screenLayout}`}>
            {Array.from({ length: config.rows }, (_, ri) => {
              const row = String.fromCharCode(65 + ri);
              return (
                <div className="seat-row" key={row} style={{ gridTemplateColumns: `15px repeat(${config.cols},1fr) 15px` }}>
                  <span>{row}</span>
                  {Array.from({ length: config.cols }, (_, i) => {
                    const n = `${row}${i + 1}`;
                    const taken = bookedSeats.includes(n);
                    return (
                      <button
                        key={n}
                        disabled={taken || seatStatus !== 'ready'}
                        onClick={() => toggle(n)}
                        className={`seat ${screenLayout === 'luxe' ? 'recliner-seat' : ''} ${taken ? 'taken' : ''} ${seats.includes(n) ? 'chosen' : ''}`}
                        title={`${n}${taken ? ' · booked' : ''}`}
                        aria-label={`Seat ${n}${taken ? ', booked' : seatStatus === 'ready' ? ', available' : ', availability unconfirmed'}`}
                        aria-pressed={seats.includes(n)}
                      />
                    );
                  })}
                  <span>{row}</span>
                </div>
              );
            })}
          </div>
          <div className="seat-foot">
            <span>{seats.length} seats · ₹{ticketPrice} each</span>
            <button className="button button-blue" disabled={!seats.length || seatStatus !== 'ready'} onClick={onCheckout}>
              Continue · ₹{seats.length * ticketPrice + (seats.length ? 36 : 0)}<ArrowRight size={15}/>
            </button>
          </div>
        </aside>
      </div>}
    </div>
  );
}

function ReviewsPage({ movies, reviews, status, initialFilter, onRetry, text, setText, onSubmit, onRequireSignIn }) {
  const [rating, setRating] = useState(5);
  const [movieTitle, setMovieTitle] = useState(() => initialFilter !== 'All films' ? initialFilter : movies[0]?.title || '');
  const [filter, setFilter] = useState(initialFilter || 'All films');
  const hasMovies = movies.length > 0;

  useEffect(() => {
    if (!hasMovies) {
      setMovieTitle('');
      setFilter('All films');
      return;
    }
    if (!movies.some((movie) => movie.title === movieTitle)) setMovieTitle(movies[0].title);
    if (filter !== 'All films' && !movies.some((movie) => movie.title === filter)) setFilter('All films');
  }, [filter, hasMovies, movieTitle, movies]);

  const visible = reviews.filter((review) => filter === 'All films' || (review.movie || review.movieTitle) === filter);

  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <div>
          <div className="eyebrow blue">READER NOTES</div>
          <h1>Reviews & notes<span className="serif-dot">.</span></h1>
          <p className="section-sub">Each note is shown with the film it describes.</p>
        </div>
        <button className="button button-blue" onClick={() => { if (onRequireSignIn()) document.getElementById('write-review')?.scrollIntoView({ behavior: getScrollBehavior() }); }}>
          Write a review <ArrowRight size={15}/>
        </button>
      </div>
      <div className="review-toolbar">
        <label>
          Show reviews for
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All films</option>
            {movies.map((m) => (<option key={m.id}>{m.title}</option>))}
          </select>
        </label>
        <span>{visible.length} reviews</span>
      </div>
      <div className="reviews-layout">
        <section className="review-feed">
          {status === 'loading' && <div className="loading-state" role="status">Loading reviews…</div>}
          {status === 'error' && (
            <div className="error-state" role="alert">
              <b>Reviews are unavailable right now.</b>
              <span>Check your connection and try again.</span>
              <button type="button" className="text-link" onClick={onRetry}>Retry <ArrowRight size={14}/></button>
            </div>
          )}
          {status === 'ready' && !visible.length && <div className="empty-state">No reviews for this film yet. Be the first to share a note.</div>}
          {status === 'ready' && visible.map((r, i) => (
            <article className="review-card" key={`${r.movie || r.movieTitle}-${r.author}-${i}`}>
              <div className="review-movie-label">
                <Film size={14}/>
                <b>{r.movie || r.movieTitle}</b>
                {movies.find((m) => m.title === (r.movie || r.movieTitle))?.year && (
                  <span>{movies.find((m) => m.title === (r.movie || r.movieTitle)).year}</span>
                )}
              </div>
              <div className="review-meta">
                <span className="review-source">{r.isSample ? 'SAMPLE DATA · ' : ''}{r.source || 'AUDIENCE REVIEW'}</span>
                <span>{r.isSample ? 'Example' : r.date || 'Recently'}</span>
              </div>
              <p className="review-quote">“{r.text}”</p>
              <div className="review-person">
                <span className="avatar small-avatar">{r.author?.[0] || 'C'}</span>
                <b>{r.author}</b>
                <span className="stars-gold">{'★'.repeat(Math.min(5, Number(r.rating) || 5))}</span>
              </div>
            </article>
          ))}
        </section>
        <aside className="write-review-card" id="write-review">
          <span className="eyebrow blue">CONTRIBUTE</span>
          <h2>A note on the film.</h2>
          <p>Select a title so your review stays connected to the right film.</p>
          <label className="review-film-select">
            Film
            <select value={movieTitle} onChange={(e) => setMovieTitle(e.target.value)}>
              {hasMovies ? movies.map((m) => (<option key={m.id}>{m.title}</option>)) : <option value="">No published films</option>}
            </select>
          </label>
          <div className="rating-picker">
            <span>Your rating</span>
            <div>
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} type="button" aria-label={`Rate ${i + 1} stars`} disabled={!hasMovies} onClick={() => setRating(i + 1)}>
                  <Star size={22} fill={i < rating ? 'currentColor' : 'none'}/>
                </button>
              ))}
            </div>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={hasMovies ? `Your thoughts on ${movieTitle}…` : 'No published films are available to review yet.'} maxLength={500} disabled={!hasMovies}/>
          <div className="character-count">{text.length} / 500</div>
          <button className="button button-blue full-button" disabled={!hasMovies} onClick={() => onSubmit(movieTitle, rating)}>
            Publish review for {movieTitle} <ArrowRight size={15}/>
          </button>
          <small className="review-note"><ShieldCheck size={14}/> Your review appears with the film title and your profile name.</small>
        </aside>
      </div>
    </div>
  );
}

function SettingsPage({ user, onSave, onSignOut, onToast, onPage }) {
  const [first, setFirst] = useState(user.name.split(' ')[0] || '');
  const [last, setLast] = useState(user.name.split(' ').slice(1).join(' '));
  const [email, setEmail] = useState(user.email || '');
  const [homeCity, setHomeCity] = useState(user.city || 'Mumbai');
  const [toggles, setToggles] = useState(user.preferences || { email: true, push: false, public: true });
  const [saving, setSaving] = useState(false);

  const toggle = (k) => setToggles((v) => ({ ...v, [k]: !v[k] }));

  const save = async () => {
    if (saving) return;
    const updated = {
      ...user,
      name: `${first.trim()} ${last.trim()}`.trim() || 'Movie fan',
      email,
      city: homeCity,
      preferences: toggles,
    };
    setSaving(true);
    try {
      await onSave(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrap settings-page">
      <div className="page-title-row">
        <div>
          <div className="eyebrow blue">YOUR CINÉREGAL</div>
          <h1>Account & settings<span className="serif-dot">.</span></h1>
          <p className="section-sub">Changes here update your profile across the backend database.</p>
        </div>
      </div>
      <div className="settings-layout">
        <aside className="settings-nav">
          <div className="settings-user">
            <span className="avatar big-avatar">{user.name[0]}</span>
            <b>{user.name}</b>
            <small>Member profile</small>
          </div>
          <button type="button" className="settings-active" onClick={() => document.getElementById('personal-details')?.scrollIntoView({ behavior: getScrollBehavior() })}><User size={16}/> Personal details</button>
          <button type="button" onClick={() => document.getElementById('preferences')?.scrollIntoView({ behavior: getScrollBehavior() })}><Bell size={16}/> Notifications</button>
          <button type="button" onClick={() => document.getElementById('preferences')?.scrollIntoView({ behavior: getScrollBehavior() })}><ShieldCheck size={16}/> Privacy</button>
          <button type="button" onClick={() => onPage('history')}><Ticket size={16}/> Booking history</button>
        </aside>
        <section className="settings-content">
          <div className="settings-card" id="personal-details">
            <div className="settings-card-heading">
              <div>
                <h2>Personal details</h2>
                <p>Keep your account up to date.</p>
              </div>
              <button className="text-link settings-save" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
            <div className="form-grid">
              <label>First name<input value={first} onChange={(e) => setFirst(e.target.value)}/></label>
              <label>Last name<input value={last} onChange={(e) => setLast(e.target.value)}/></label>
              <label>Email address<input value={email} onChange={(e) => setEmail(e.target.value)} type="email"/></label>
              <label>Home city
                <select value={homeCity} onChange={(e) => setHomeCity(e.target.value)}>
                  {INDIAN_CITIES.map((c) => (<option key={c}>{c}</option>))}
                </select>
              </label>
            </div>
          </div>
          <div className="settings-card" id="preferences">
            <div className="settings-card-heading">
              <div>
                <h2>Your preferences</h2>
                <p>A few helpful updates, on your terms.</p>
              </div>
            </div>
            <SettingRow title="Cinema notes by email" detail="Monthly picks, new releases and a little inspiration." checked={toggles.email} onClick={() => toggle('email')}/>
            <SettingRow title="Booking reminders" detail="A gentle nudge before your show begins." checked={toggles.push} onClick={() => toggle('push')}/>
            <SettingRow title="Public watchlist" detail="Let friends see what you’re looking forward to." checked={toggles.public} onClick={() => toggle('public')}/>
          </div>
          <button className="text-link signout" onClick={onSignOut}>Sign out of CinéRegal <ArrowRight size={15}/></button>
        </section>
      </div>
    </div>
  );
}

const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi', 'Chandigarh', 'Lucknow', 'Indore', 'Goa', 'Surat', 'Nagpur', 'Coimbatore', 'Bhubaneswar', 'Visakhapatnam', 'Mysuru', 'Thiruvananthapuram', 'Patna', 'Dehradun', 'Noida', 'Gurugram'];

function SettingRow({ title, detail, checked, onClick }) {
  return (
    <div className="setting-row">
      <div><b>{title}</b><small>{detail}</small></div>
      <button className={`switch ${checked ? 'on' : ''}`} onClick={onClick} aria-label={`Toggle ${title}`}><i/></button>
    </div>
  );
}

function AboutPage({ onPage }) {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="eyebrow"><span className="live-dot"/> CINÉREGAL</div>
        <h1>A journal for<br/>the <em>big screen.</em></h1>
        <p>Explore the film catalogue, keep a watchlist, read movie notes, and plan a screening. One title at a time.</p>
        <button className="button button-light" onClick={() => onPage('booking')}>Find a screening <ArrowRight size={15}/></button>
        <div className="about-stamp"><Film size={22}/><span>FILMS<br/>NOTES<br/>SCREENINGS</span></div>
      </div>
      <div className="about-values">
        <div className="eyebrow blue">THE JOURNAL</div>
        <div className="value-grid">
          <article><span>01</span><h2>The catalogue.</h2><p>Browse films with their release details, synopsis, and credited cast.</p></article>
          <article><span>02</span><h2>Notes on film.</h2><p>Find reviews connected to a title, or add a note of your own.</p></article>
          <article><span>03</span><h2>Plan a screening.</h2><p>Explore the booking flow. Sample cinema listings and availability are marked clearly.</p></article>
        </div>
        <div className="about-cta">
          <span>Start with a film.</span>
          <button className="button button-blue" onClick={() => onPage('home')}>Browse films <ArrowRight size={15}/></button>
        </div>
      </div>
    </div>
  );
}

function FeedbackPage({ onToast }) {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('A little feedback');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !note.trim()) {
      setError('Please enter your email and note.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.submitFeedback({ email, category, note });
      setSent(true);
      onToast('Feedback sent directly to the team!');
    } catch (err) {
      setError(err.message || 'Feedback could not be sent. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap feedback-wrap">
      <div className="eyebrow blue">HELP US MAKE IT BETTER</div>
      <h1>A note to our team<span className="serif-dot">.</span></h1>
      <p className="section-sub">We’re listening. Tell us what made your visit lovely—or what we could do better.</p>
      {sent ? (
        <div className="success-card">
          <span className="success-icon"><Check size={25}/></span>
          <h2>Thank you for the note.</h2>
          <p>It’s made its way to our team. We’ll take it from here.</p>
          <button className="button button-blue" onClick={() => setSent(false)}>Send another</button>
        </div>
      ) : (
        <div className="feedback-card">
          <label>Your email<input value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@example.com" type="email"/></label>
          <label>
            What would you like to share?
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>A little feedback</option>
              <option>Something went well</option>
              <option>An idea for CinéRegal</option>
              <option>Help with a booking</option>
            </select>
          </label>
          <label>Your note<textarea value={note} onChange={(e) => { setNote(e.target.value); setError(''); }} placeholder="The more detail, the better—we're all ears." rows="5"/></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-blue" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Submitting note...' : 'Send your note'} <ArrowRight size={15}/>
          </button>
        </div>
      )}
    </div>
  );
}

function SignInPrompt({ onSignIn, title = 'Your CinéRegal account', description = 'Sign in or create an account to view your profile and saved bookings.' }) {
  return (
    <div className="auth-required">
      <span className="brand-mark"><LogIn size={20}/></span>
      <h1>{title}</h1>
      <p>{description}</p>
      <button className="button button-blue" onClick={onSignIn}>Sign in / sign up <ArrowRight size={15}/></button>
    </div>
  );
}

function HistoryPage({ history, status, onRetry, onBook, onCancel, bookingActionId, onReceipt }) {
  return (
    <div className="page-wrap history-page" id="booking-history">
      <div className="eyebrow blue">ACCOUNT</div>
      <h1>Your film history<span className="serif-dot">.</span></h1>
      <p className="section-sub">Your tickets, cancellations, and refund requests in one place.</p>
      {status === 'loading' && <div className="loading-state" role="status">Loading your saved bookings…</div>}
      {status === 'error' && (
        <div className="error-state" role="alert">
          <b>Booking history could not be loaded.</b>
          <span>Check your connection to your account and try again.</span>
          <button type="button" className="text-link" onClick={onRetry}>Retry <ArrowRight size={14}/></button>
        </div>
      )}
      {status === 'ready' && history.length > 0 ? (
        <div className="history-list">
          {history.map((item) => (
            <article className={`history-card ${item.status === 'cancelled' ? 'is-cancelled' : ''}`} key={item.id}>
              <div className="history-icon"><Ticket size={19}/></div>
              <div className="history-details">
                <span className="eyebrow blue">{item.bookingCode ? `${item.bookingCode} · ` : ''}{formatScreeningDate(item.date)}</span>
                <h2>{item.movie}</h2>
                <p>{item.theatre ? `${item.theatre} · ` : ''}{item.city} · {item.showtime} · {item.screenLayout || 'standard'} · Seats {item.seats.join(', ')}</p>
                <div className="history-statuses">
                  <span className={`history-state ${item.status === 'cancelled' ? 'cancelled' : 'confirmed'}`}>
                    {item.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                  </span>
                  {item.refundStatus && item.refundStatus !== 'not_requested' && (
                    <span className={`history-state refund-${item.refundStatus}`}>
                      {item.refundStatus === 'not_applicable' ? 'No refund due · demo' : `Refund ${item.refundStatus.replaceAll('_', ' ')}`}
                    </span>
                  )}
                  {item.paymentStatus === 'demo' && <small>Demo checkout · no payment collected</small>}
                </div>
              </div>
              <div className="history-card-actions">
                <b className="history-price">₹{item.total}</b>
                <button type="button" className="history-receipt-button" onClick={() => onReceipt(item)}>
                  <Printer size={14}/> View receipt
                </button>
                {item.status !== 'cancelled' && isScreeningInFuture(item) && (
                  <button
                    type="button"
                    className="history-cancel-button"
                    disabled={String(item.id) === bookingActionId}
                    onClick={() => onCancel(item)}
                  >
                    {String(item.id) === bookingActionId ? 'Cancelling…' : item.paymentStatus === 'paid' ? 'Cancel & request refund' : 'Cancel ticket'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : status === 'ready' ? (
        <div className="history-empty">
          <Clock3 size={24}/>
          <h2>No bookings just yet.</h2>
          <p>Your tickets and booking updates will appear here.</p>
          <button className="button button-blue" onClick={onBook}>Explore films <ArrowRight size={15}/></button>
        </div>
      ) : null}
    </div>
  );
}

function SupportPage({ email, tickets, status, onRetry, onCreate, onToast }) {
  const [category, setCategory] = useState('Booking issue');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (note.trim().length < 10) {
      setFormError('Add at least 10 characters so our team can understand the issue.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const ticket = await onCreate({ category, note: note.trim() });
      setNote('');
      onToast(`Ticket ${ticket.ticketCode} is now open`);
    } catch (error) {
      setFormError(error.message || 'Support ticket could not be created.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrap support-page">
      <div className="eyebrow blue">CUSTOMER CARE</div>
      <div className="support-page-heading">
        <div>
          <h1>Your support desk<span className="serif-dot">.</span></h1>
          <p className="section-sub">A direct line to the CinéRegal team. Your requests stay attached to {email}.</p>
        </div>
        <button type="button" className="text-link" onClick={onRetry} disabled={status === 'loading'}>
          {status === 'loading' ? 'Refreshing…' : 'Refresh ticket status'} <ArrowRight size={14}/>
        </button>
      </div>

      <div className="support-layout">
        <form className="support-form" onSubmit={submit}>
          <span className="booking-step-kicker">NEW REQUEST</span>
          <h2>How can we help?</h2>
          <label>
            Topic
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>Booking issue</option>
              <option>Refund request</option>
              <option>Account access</option>
              <option>Technical issue</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Tell us what happened
            <textarea
              value={note}
              onChange={(event) => { setNote(event.target.value); setFormError(''); }}
              rows="6"
              minLength={10}
              maxLength={5000}
              placeholder="Include the booking code if your request is about a ticket."
              required
            />
            <small>{note.length}/5000 characters</small>
          </label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button type="submit" className="button button-blue" disabled={submitting}>
            {submitting ? 'Opening ticket…' : 'Create support ticket'} <ArrowRight size={15}/>
          </button>
          <p className="support-demo-note">Refunds for demo checkouts are not applicable because no payment is collected.</p>
        </form>

        <section className="support-ticket-list" aria-labelledby="support-ticket-heading">
          <div className="support-ticket-list-heading">
            <div><span className="booking-step-kicker">YOUR REQUESTS</span><h2 id="support-ticket-heading">Ticket tracker</h2></div>
            <span>{tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}</span>
          </div>
          {status === 'loading' && <div className="loading-state" role="status">Loading your support tickets…</div>}
          {status === 'error' && (
            <div className="error-state" role="alert">
              <b>Your tickets could not be loaded.</b>
              <span>Try again to check the latest updates.</span>
              <button type="button" className="text-link" onClick={onRetry}>Retry <ArrowRight size={14}/></button>
            </div>
          )}
          {status === 'ready' && tickets.length === 0 && (
            <div className="support-empty"><Headphones size={22}/><b>No support tickets yet.</b><span>When you send a request, its status and reference will appear here.</span></div>
          )}
          {status === 'ready' && tickets.map((ticket) => {
            const ticketStatus = ticket.status === 'new' ? 'open' : ticket.status === 'reviewed' ? 'in_progress' : ticket.status;
            const activeStep = ticketStatus === 'resolved' ? 2 : ticketStatus === 'in_progress' ? 1 : 0;
            return (
              <article className="support-ticket-card" key={ticket._id || ticket.ticketCode}>
                <div className="support-ticket-meta">
                  <b>{ticket.ticketCode || 'Support request'}</b>
                  <span>{formatActivityDate(ticket.updatedAt || ticket.createdAt)}</span>
                </div>
                <h3>{ticket.category}</h3>
                <p>{ticket.note}</p>
                <ol className="support-progress" aria-label={`Ticket status: ${ticketStatus.replaceAll('_', ' ')}`}>
                  {['Open', 'In progress', 'Resolved'].map((step, index) => (
                    <li key={step} className={index <= activeStep ? 'is-active' : ''}>{step}</li>
                  ))}
                </ol>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function AuthPage({ mode, onMode, onBack, onSuccess, onToast }) {
  const signup = mode === 'signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (mode === 'reset') {
      if (!email.trim()) {
        onToast('Enter your email address to request a reset');
        return;
      }
      setLoading(true);
      try {
        const result = await api.requestPasswordReset(email.trim());
        onToast(result.message || 'Password reset request received');
        onMode('login');
      } catch (err) {
        onToast(err.message || 'Password reset request failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password || (signup && !name)) {
      return onToast('Please fill in all required fields');
    }

    setLoading(true);
    let profile;
    try {
      let res;
      if (signup) {
        res = await api.register({ name, email, password, city });
      } else {
        res = await api.login({ email, password });
      }
      profile = res.user;
    } catch (err) {
      onToast(err.message || 'Authentication failed');
      return;
    } finally {
      setLoading(false);
    }

    onSuccess(profile);
  };

  return (
    <div className="auth-page auth-enter">
      <section className="auth-art" aria-label="CinéRegal account">
        <div className="auth-art-overline">
          <span>CR / 01</span>
          <span>THE CINÉREGAL ACCOUNT</span>
        </div>
        <div className="auth-art-copy">
          <div className="eyebrow"><span className="live-dot"/> YOUR FILM JOURNAL</div>
          <h1>Keep a place<br/>for the <em>next story.</em></h1>
          <p>Save the films you love, keep track of your screenings, and pick up where your next cinema night begins.</p>
        </div>
        <div className="auth-art-foot">
          <span>FILMS</span><i/><span>REVIEWS</span><i/><span>BOOKINGS</span>
        </div>
      </section>

      <section className="auth-form-wrap" aria-label="Account access">
        <form className="auth-form" onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
          <button type="button" className="auth-back" onClick={onBack}><ArrowLeft size={15}/> Back to CinéRegal</button>
          <div className="auth-form-heading">
            <div className="eyebrow blue">YOUR CINÉREGAL ACCOUNT</div>
            <h2>{signup ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back.'}</h2>
            <p>{signup ? 'A home for your watchlist and upcoming screenings.' : mode === 'reset' ? 'Enter the email address linked to your account.' : 'Sign in to pick up where your film journal left off.'}</p>
          </div>

          {signup && (
            <label className="auth-field" htmlFor="auth-name">
              <span>Your name</span>
              <input id="auth-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" required/>
            </label>
          )}

          <label className="auth-field" htmlFor="auth-email">
            <span>Email address</span>
            <input id="auth-email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" required/>
          </label>

          {mode !== 'reset' && (
            <label className="auth-field" htmlFor="auth-password">
              <span>Password</span>
              <input id="auth-password" autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" type="password" required/>
            </label>
          )}

          {signup && (
            <label className="auth-field" htmlFor="auth-city">
              <span>Your city</span>
              <select id="auth-city" value={city} onChange={(e) => setCity(e.target.value)}>
                {INDIAN_CITIES.map((c) => (<option key={c}>{c}</option>))}
              </select>
            </label>
          )}

          {!signup && mode !== 'reset' && (
            <button type="button" className="forgot" onClick={() => onMode('reset')}>Forgot password?</button>
          )}

          <button type="submit" className="button button-blue full-button" disabled={loading}>
            {loading ? 'Please wait...' : signup ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'} <ArrowRight size={15}/>
          </button>

          <div className="auth-switch">
            {mode === 'reset' ? 'Remember your password?' : signup ? 'Already a member?' : 'New to CinéRegal?'}
            <button type="button" onClick={() => onMode(mode === 'reset' || signup ? 'login' : 'signup')}>
              {mode === 'reset' || signup ? 'Sign in' : 'Create an account'}
            </button>
          </div>

          <div className="auth-terms">
            <ShieldCheck size={15}/>
            <span>Your account details stay connected to CinéRegal.</span>
          </div>
        </form>
      </section>
    </div>
  );
}
