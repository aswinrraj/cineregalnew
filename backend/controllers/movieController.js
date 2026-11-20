import Movie from '../models/Movie.js';
import { initialMovies } from '../data/seedData.js';
import { getDBStatus } from '../config/db.js';

// @desc    Get all movies with optional search, genre, or format filter
// @route   GET /api/movies
// @access  Public
export const getAllMovies = async (req, res, next) => {
  try {
    const { search, genre, format, featured } = req.query;

    if (getDBStatus()) {
      let query = { published: { $ne: false } };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { genre: { $regex: search, $options: 'i' } },
          { director: { $regex: search, $options: 'i' } },
        ];
      }

      if (genre && genre !== 'All') {
        query.genre = { $regex: genre, $options: 'i' };
      }

      if (format && format !== 'All formats') {
        query.format = format;
      }

      if (featured === 'true') {
        query.featured = true;
      }

      const movies = await Movie.find(query).sort({ id: 1 });
      return res.json({
        success: true,
        count: movies.length,
        data: movies,
      });
    }

    // Fallback data when DB has not yet been seeded or is disconnected
    let filtered = [...initialMovies];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q)
      );
    }

    if (genre && genre !== 'All') {
      filtered = filtered.filter((m) =>
        m.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }

    if (format && format !== 'All formats') {
      filtered = filtered.filter((m) => m.format === format);
    }

    if (featured === 'true') {
      filtered = filtered.filter((m) => m.featured);
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID (numeric or ObjectId)
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      let movie;
      if (!isNaN(id)) {
        movie = await Movie.findOne({ id: Number(id), published: { $ne: false } });
      }
      if (!movie && id.match(/^[0-9a-fA-F]{24}$/)) {
        movie = await Movie.findOne({ _id: id, published: { $ne: false } });
      }

      if (movie) {
        return res.json({
          success: true,
          data: movie,
        });
      }

      return res.status(404).json({
        success: false,
        message: `Movie with id ${id} not found`,
      });
    }

    // Fallback to initialMovies
    const found = initialMovies.find(
      (m) => String(m.id) === id || m.imdb === id
    );

    if (found) {
      return res.json({
        success: true,
        data: found,
      });
    }

    res.status(404).json({
      success: false,
      message: `Movie with id ${id} not found`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new movie (Admin)
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res, next) => {
  try {
    const movieData = req.body;

    if (!movieData.title || !movieData.genre) {
      return res.status(400).json({
        success: false,
        message: 'Title and genre are required',
      });
    }

    if (getDBStatus()) {
      // Auto-assign numeric id if not provided
      if (!movieData.id) {
        const lastMovie = await Movie.findOne().sort({ id: -1 });
        movieData.id = lastMovie ? lastMovie.id + 1 : 1;
      }

      const movie = await Movie.create(movieData);
      return res.status(201).json({
        success: true,
        message: 'Movie created successfully',
        data: movie,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Movie created (in-memory mode)',
      data: { ...movieData, id: Date.now() },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie by ID
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const movie = await Movie.findOneAndUpdate(
        { $or: [{ id: isNaN(id) ? null : Number(id) }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        req.body,
        { new: true, runValidators: true }
      );

      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }

      return res.json({
        success: true,
        data: movie,
      });
    }

    res.json({
      success: true,
      message: 'Movie updated (mock)',
      data: { id, ...req.body },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie by ID
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const movie = await Movie.findOneAndDelete({
        $or: [{ id: isNaN(id) ? null : Number(id) }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });

      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }

      return res.json({
        success: true,
        message: 'Movie deleted successfully',
      });
    }

    res.json({
      success: true,
      message: 'Movie deleted (mock)',
    });
  } catch (error) {
    next(error);
  }
};
