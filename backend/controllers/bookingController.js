import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import { getDBStatus } from '../config/db.js';

// In-memory fallback booking storage
const mockBookings = [];

// Helper to generate unique booking code
const generateBookingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CINÉ-${new Date().getFullYear()}-${code}`;
};

const isISODate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const screeningHasStarted = (booking) => {
  if (!isISODate(booking.date)) return false;
  const screeningTime = new Date(`${booking.date}T00:00:00`);
  const time = String(booking.showtime || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (time) {
    let hours = Number(time[1]) % 12;
    if (time[3].toUpperCase() === 'PM') hours += 12;
    screeningTime.setHours(hours, Number(time[2]), 0, 0);
  }
  return screeningTime.getTime() <= Date.now();
};

const ownsBooking = (booking, user) => {
  const userId = user?._id ? String(user._id) : '';
  const bookingUserId = booking.user ? String(booking.user._id || booking.user) : '';
  const userEmail = user?.email?.trim().toLowerCase();
  return Boolean(
    (userId && bookingUserId && userId === bookingUserId) ||
    (userEmail && booking.userEmail?.trim().toLowerCase() === userEmail)
  );
};

// @desc    Create a new movie booking
// @route   POST /api/bookings
// @access  Public / Optional Auth
export const createBooking = async (req, res, next) => {
  try {
    const {
      movieTitle,
      movieId,
      theatre = 'Regal PVR ICON',
      city = 'Mumbai',
      date,
      showtime,
      screenLayout = 'standard',
      seats,
      userName,
      userEmail,
    } = req.body;

    if (!movieTitle || !date || !showtime) {
      return res.status(400).json({
        success: false,
        message: 'Movie title, date, and showtime are required',
      });
    }
    if (!isISODate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Choose a valid screening date',
      });
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat',
      });
    }

    // Pricing calculation
    const pricePerTicket = screenLayout === 'luxe' ? 450 : screenLayout === 'imax' ? 380 : 320;
    const ticketTotal = seats.length * pricePerTicket;
    const convenienceFee = seats.length ? 36 : 0;
    const total = ticketTotal + convenienceFee;
    const bookingCode = generateBookingCode();

    if (getDBStatus()) {
      // 1. Conflict detection: Check if any seat is already booked for this session
      const existingBookings = await Booking.find({
        movieTitle,
        city,
        theatre,
        date,
        showtime,
        screenLayout,
        status: { $ne: 'cancelled' },
      });

      const alreadyTakenSeats = existingBookings.flatMap((b) => b.seats);
      const conflictSeats = seats.filter((seat) => alreadyTakenSeats.includes(seat));

      if (conflictSeats.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Seat(s) ${conflictSeats.join(', ')} are already booked. Please choose other seats.`,
          conflictSeats,
        });
      }

      // 2. Link Movie model if available
      let movieRef = null;
      if (movieId) {
        const foundMovie = await Movie.findOne({ id: Number(movieId) });
        if (foundMovie) movieRef = foundMovie._id;
      }

      // 3. Create booking
      const newBooking = await Booking.create({
        user: req.user?._id || null,
        userName: req.user?.name || userName || 'Alex Morgan',
        userEmail: (req.user?.email || userEmail || '').toLowerCase(),
        movie: movieRef,
        movieId: movieId || null,
        movieTitle,
        theatre,
        city,
        date,
        showtime,
        screenLayout,
        seats,
        ticketPrice: pricePerTicket,
        convenienceFee,
        total,
        paymentMethod: 'demo',
        paymentStatus: 'demo',
        status: 'confirmed',
        refundStatus: 'not_requested',
        bookingCode,
      });

      return res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: newBooking,
      });
    }

    // In-memory fallback
    const alreadyTaken = mockBookings
      .filter((b) => b.status !== 'cancelled' && b.movieTitle === movieTitle && b.city === city && b.theatre === theatre && b.date === date && b.showtime === showtime && b.screenLayout === screenLayout)
      .flatMap((b) => b.seats);

    const conflict = seats.filter((s) => alreadyTaken.includes(s));
    if (conflict.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${conflict.join(', ')} already taken`,
        conflictSeats: conflict,
      });
    }

    const fallbackBooking = {
      _id: 'bkg_' + Date.now(),
      id: Date.now(),
      user: req.user?._id || null,
      userName: req.user?.name || userName || 'Alex Morgan',
      userEmail: (req.user?.email || userEmail || '').toLowerCase(),
      movieTitle,
      movieId,
      theatre,
      city,
      date,
      showtime,
      screenLayout,
      seats,
      ticketPrice: pricePerTicket,
      convenienceFee,
      total,
      paymentMethod: 'demo',
      paymentStatus: 'demo',
      status: 'confirmed',
      refundStatus: 'not_requested',
      bookingCode,
      createdAt: new Date().toISOString(),
    };
    mockBookings.unshift(fallbackBooking);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully (in-memory mode)',
      data: fallbackBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's booking history
// @route   GET /api/bookings/my
// @access  Private
export const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email?.toLowerCase();

    if (!userId && !userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required to view booking history',
      });
    }

    if (getDBStatus()) {
      const ownershipConditions = [];
      if (userId) ownershipConditions.push({ user: userId });
      if (userEmail) ownershipConditions.push({ userEmail });
      const query = ownershipConditions.length === 1
        ? ownershipConditions[0]
        : { $or: ownershipConditions };

      const bookings = await Booking.find(query).sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    }

    const bookings = mockBookings.filter((booking) => (
      (userId && booking.user === userId) ||
      (userEmail && booking.userEmail?.toLowerCase() === userEmail)
    ));

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a customer's booking and create a refund request when payment was collected
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim().slice(0, 500) : '';
    let booking;

    if (getDBStatus()) {
      const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { bookingCode: id };
      booking = await Booking.findOne(query);
    } else {
      booking = mockBookings.find((item) => item._id === id || item.bookingCode === id);
    }

    if (!booking || !ownsBooking(booking, req.user)) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.status === 'cancelled') {
      return res.status(409).json({ success: false, message: 'This booking has already been cancelled' });
    }
    if (screeningHasStarted(booking)) {
      return res.status(409).json({ success: false, message: 'A screening cannot be cancelled after it has started' });
    }

    const now = new Date();
    const paymentStatus = booking.paymentStatus === 'completed' ? 'demo' : booking.paymentStatus;
    booking.paymentStatus = paymentStatus;
    booking.status = 'cancelled';
    booking.cancelledAt = now;
    booking.cancellationReason = reason;
    booking.refundReason = reason;
    booking.refundStatus = paymentStatus === 'paid' ? 'requested' : 'not_applicable';
    booking.refundRequestedAt = paymentStatus === 'paid' ? now : null;

    if (getDBStatus()) await booking.save();

    return res.json({
      success: true,
      message: paymentStatus === 'paid'
        ? 'Booking cancelled. Your refund request has been sent for review.'
        : 'Booking cancelled. This was a demo or unpaid booking, so no payment was collected and no refund is due.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all booked seats for a particular movie session
// @route   GET /api/bookings/seats
// @access  Public
export const getBookedSeats = async (req, res, next) => {
  try {
    const { movieTitle, city, theatre, date, showtime, screenLayout } = req.query;

    if (!movieTitle || !date || !showtime) {
      return res.status(400).json({
        success: false,
        message: 'movieTitle, date, and showtime query parameters are required',
      });
    }

    if (getDBStatus()) {
      const query = {
        movieTitle,
        date,
        showtime,
        status: { $ne: 'cancelled' },
      };
      if (city) query.city = city;
      if (theatre) query.theatre = theatre;
      if (screenLayout) query.screenLayout = screenLayout;

      const bookings = await Booking.find(query).select('seats');
      const bookedSeats = [...new Set(bookings.flatMap((b) => b.seats))];

      return res.json({
        success: true,
        count: bookedSeats.length,
        data: bookedSeats,
      });
    }

    // In-memory lookup
    const booked = mockBookings
        .filter((b) => b.status !== 'cancelled' && b.movieTitle === movieTitle && b.date === date && b.showtime === showtime && (!city || b.city === city) && (!theatre || b.theatre === theatre) && (!screenLayout || b.screenLayout === screenLayout))
      .flatMap((b) => b.seats);

    res.json({
      success: true,
      count: booked.length,
      data: booked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID or code
// @route   GET /api/bookings/:id
// @access  Public
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
      const query = isObjectId ? { _id: id } : { bookingCode: id };
      const booking = await Booking.findOne(query);

      if (booking) {
        return res.json({ success: true, data: booking });
      }
    }

    const found = mockBookings.find((b) => b._id === id || b.bookingCode === id);
    if (found) {
      return res.json({ success: true, data: found });
    }

    res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  } catch (error) {
    next(error);
  }
};
