import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'Alex Morgan',
    },
    userEmail: {
      type: String,
      default: '',
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      default: null,
    },
    movieId: {
      type: Number,
      default: null,
    },
    movieTitle: {
      type: String,
      required: [true, 'Movie title is required'],
    },
    theatre: {
      type: String,
      default: 'Regal PVR ICON',
    },
    city: {
      type: String,
      required: true,
      default: 'Mumbai',
    },
    date: {
      type: String,
      required: true,
    },
    showtime: {
      type: String,
      required: true,
    },
    screenLayout: {
      type: String,
      enum: ['standard', 'imax', 'luxe'],
      default: 'standard',
    },
    seats: {
      type: [String],
      required: [true, 'At least one seat must be selected'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Seats array cannot be empty',
      },
    },
    ticketPrice: {
      type: Number,
      default: 320,
    },
    convenienceFee: {
      type: Number,
      default: 36,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'demo'],
      default: 'demo',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'demo'],
      default: 'demo',
      index: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
    },
    refundStatus: {
      type: String,
      enum: ['not_requested', 'requested', 'under_review', 'processed', 'rejected', 'not_applicable'],
      default: 'not_requested',
      index: true,
    },
    refundRequestedAt: {
      type: Date,
      default: null,
    },
    refundReason: {
      type: String,
      trim: true,
      default: '',
    },
    bookingCode: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly check booked seats for a movie showtime
bookingSchema.index({ movieTitle: 1, city: 1, date: 1, showtime: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
