import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    imdb: {
      type: String,
      default: '',
      trim: true,
    },
    tmdbId: {
      type: Number,
      default: undefined,
      index: { sparse: true },
    },
    wikidataId: {
      type: String,
      trim: true,
      default: undefined,
      unique: true,
      sparse: true,
    },
    metadataSource: {
      type: String,
      enum: ['wikidata', 'wikipedia', 'tmdb'],
      default: undefined,
    },
    sourceUrl: {
      type: String,
      default: '',
      trim: true,
    },
    posterSourceUrl: {
      type: String,
      default: '',
      trim: true,
    },
    wikipediaPageId: {
      type: Number,
      default: undefined,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide movie title'],
      trim: true,
    },
    genre: {
      type: String,
      default: '',
    },
    year: {
      type: String,
      default: '',
    },
    release: {
      type: String,
      default: '',
    },
    releaseDate: {
      type: Date,
      default: null,
    },
    rating: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    format: {
      type: String,
      default: '4K',
    },
    poster: {
      type: String,
      default: '',
    },
    backdrop: {
      type: String,
      default: '',
    },
    trailer: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add text search index on title and genre
movieSchema.index({ title: 'text', genre: 'text' });

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
