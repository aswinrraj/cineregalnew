import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB, { getDBStatus } from './config/db.js';
import Movie from './models/Movie.js';
import { seedDatabase } from './data/seed.js';
import { seedLocalDemoAdmin } from './data/seedAdmin.js';
import Booking from './models/Booking.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import theatreRoutes from './routes/theatreRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB safely
connectDB()
  .then(async () => {
    if (getDBStatus()) {
      try {
        const movieCount = await Movie.countDocuments();
        if (movieCount === 0) {
          console.log('[Auto-Seed] Database is empty. Seeding initial data...');
          await seedDatabase();
        }
        await seedLocalDemoAdmin();
        const legacyDemoPayments = await Booking.updateMany(
          { paymentStatus: 'completed' },
          { $set: { paymentStatus: 'demo' } }
        );
        if (legacyDemoPayments.modifiedCount > 0) {
          console.log(`[Payments] Marked ${legacyDemoPayments.modifiedCount} legacy checkout records as demo transactions.`);
        }
      } catch (err) {
        console.warn('[Bootstrap] Could not seed admin or migrate legacy demo payments:', err.message);
      }
    }
  })
  .catch((err) => {
    console.warn('[MongoDB] Init warning:', err.message);
  });

// Middleware configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local development
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health and Status Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'CinéRegal MERN Backend API',
    version: '1.0.0',
    database: getDBStatus() ? 'connected (MongoDB)' : 'in-memory / disconnected fallback',
    endpoints: {
      auth: '/api/auth (login, register, me, profile, watchlist)',
      movies: '/api/movies (browse, filter, search, details)',
      theatres: '/api/theatres (city-based cinema halls & showtimes)',
      bookings: '/api/bookings (seat reservation & user history)',
      reviews: '/api/reviews (film reviews & critic quotes)',
      feedback: '/api/feedback (contact notes & inquiries)',
      health: '/api/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: getDBStatus() ? 'connected' : 'disconnected_fallback',
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Prevent crashes from unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err.message);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🎬 CinéRegal Backend API is running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================================\n`);
});

// Graceful error handling for port collision
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server Error] Port ${PORT} is already in use. Stop the process using it or set PORT to another available port.`);
  } else {
    console.error('[Server Error]', err.message);
  }
  process.exit(1);
});

// Clean shutdown listeners for nodemon and OS signals
const gracefulShutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.once('SIGUSR2', () => {
  server.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});
