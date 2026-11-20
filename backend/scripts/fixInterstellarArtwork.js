import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import { initialMovies } from '../data/seedData.js';

dotenv.config();

const interstellar = initialMovies.find((movie) => movie.imdb === 'tt0816692');
if (!interstellar) throw new Error('Interstellar artwork is missing from the canonical seed data.');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cineregal';

try {
  await mongoose.connect(mongoUri);
  const result = await Movie.updateMany(
    {
      $or: [
        { imdb: 'tt0816692' },
        { title: /^interstellar$/i, year: '2014' },
      ],
    },
    {
      $set: {
        poster: interstellar.poster,
        backdrop: interstellar.backdrop,
      },
    }
  );
  console.log(`[Artwork] Interstellar records matched: ${result.matchedCount}; updated: ${result.modifiedCount}.`);
} catch (error) {
  console.error(`[Artwork] Could not update Interstellar records: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}
