import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { seedLocalDemoAdmin } from './seedAdmin.js';
import {
  initialMovies,
  initialTheatres,
  initialReviews,
  initialDemoUser,
} from './seedData.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Clearing existing collections...');
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } });

    console.log('[Seed] Seeding Movies...');
    await Movie.insertMany(initialMovies);

    console.log('[Seed] Seeding Theatres...');
    await Theatre.insertMany(initialTheatres);

    console.log('[Seed] Seeding Reviews...');
    await Review.insertMany(initialReviews);

    console.log('[Seed] Seeding Demo User...');
    await User.create(initialDemoUser);

    await seedLocalDemoAdmin();
    console.log('✓ [Seed] Database seeded successfully!');
  } catch (error) {
    console.error('✗ [Seed] Failed to seed database:', error.message);
  }
};

// If run directly from CLI (e.g., node data/seed.js or npm run seed)
if (process.argv[1]?.endsWith('seed.js')) {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/cineregal';
  console.log(`[Seed] Connecting to MongoDB at ${uri}...`);
  mongoose
    .connect(uri)
    .then(async () => {
      await seedDatabase();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Database connection error:', err.message);
      process.exit(1);
    });
}
