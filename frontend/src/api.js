const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const apiUnavailable = () => {
  const error = new Error('API unavailable. Start the backend with `npm run dev` and try again.');
  error.code = 'API_UNAVAILABLE';
  return error;
};

const parseLoginResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    if ([502, 503, 504].includes(response.status)) throw apiUnavailable();
    throw new Error('The server returned an invalid response. Please try again.');
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('cineregal-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Movies
  async getMovies(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/movies${query ? `?${query}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch movies');
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('API getMovies fallback:', err.message);
      return null;
    }
  },

  async getMovieById(id) {
    try {
      const res = await fetch(`${API_BASE}/movies/${id}`);
      if (!res.ok) throw new Error('Movie not found');
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('API getMovieById fallback:', err.message);
      return null;
    }
  },

  // Theatres
  async getTheatres(city = '') {
    try {
      const res = await fetch(`${API_BASE}/theatres${city ? `?city=${encodeURIComponent(city)}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch theatres');
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('API getTheatres fallback:', err.message);
      return null;
    }
  },

  // Auth
  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Registration failed');
    if (json.token) {
      localStorage.setItem('cineregal-token', json.token);
    }
    return json;
  },

  async login(data) {
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof TypeError) throw apiUnavailable();
      throw error;
    }
    const json = await parseLoginResponse(res);
    if (!res.ok) throw new Error(json.message || 'Login failed');
    if (json.token) {
      localStorage.setItem('cineregal-token', json.token);
    }
    return json;
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Unauthorized');
      const json = await res.json();
      return json.user;
    } catch {
      return null;
    }
  },

  async updateProfile(data) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Profile update failed');
    return json.user;
  },

  async toggleWatchlist(movieId) {
    const res = await fetch(`${API_BASE}/auth/watchlist/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ movieId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Watchlist update failed');
    return json.watchlist;
  },

  async requestPasswordReset(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Password reset request failed');
    return json;
  },

  // Reviews
  async getReviews(movie = '') {
    try {
      const query = movie && movie !== 'All films' ? `?movie=${encodeURIComponent(movie)}` : '';
      const res = await fetch(`${API_BASE}/reviews${query}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('API getReviews fallback:', err.message);
      return null;
    }
  },

  async createReview(data) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to submit review');
    return json.data;
  },

  // Bookings
  async createBooking(data) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to complete booking');
    return json.data;
  },

  async getMyBookings() {
    try {
      const res = await fetch(`${API_BASE}/bookings/my`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('API getMyBookings fallback:', err.message);
      return null;
    }
  },

  async cancelBooking(id, reason = '') {
    const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(id)}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Could not cancel this booking');
    return json;
  },

  async getBookedSeats(movieTitle, date, showtime, city = '', theatre = '', screenLayout = '') {
    const params = new URLSearchParams({ movieTitle, date, showtime });
    if (city) params.set('city', city);
    if (theatre) params.set('theatre', theatre);
    if (screenLayout) params.set('screenLayout', screenLayout);
    const res = await fetch(`${API_BASE}/bookings/seats?${params.toString()}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Could not load seat availability');
    return json.data || [];
  },

  // Feedback
  async submitFeedback(data) {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to submit feedback');
    return json;
  },

  async createSupportTicket(data) {
    const res = await fetch(`${API_BASE}/feedback/tickets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Could not create support ticket');
    return json.data;
  },

  async getMySupportTickets() {
    const res = await fetch(`${API_BASE}/feedback/tickets/my`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Could not load your support tickets');
    return json.data || [];
  },
};

export default api;
