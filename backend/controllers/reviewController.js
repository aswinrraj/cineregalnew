import Review from '../models/Review.js';
import { initialReviews } from '../data/seedData.js';
import { getDBStatus } from '../config/db.js';

// In-memory fallback review storage
const mockReviews = [...initialReviews];

// @desc    Get all reviews with optional movie filter
// @route   GET /api/reviews
// @access  Public
export const getAllReviews = async (req, res, next) => {
  try {
    const { movie } = req.query;

    if (getDBStatus()) {
      const query = { status: { $ne: 'hidden' } };
      if (movie && movie !== 'All films') query.movieTitle = movie;
      const reviews = await Review.find(query).sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    }

    // Fallback data
    let list = [...mockReviews];
    if (movie && movie !== 'All films') {
      list = list.filter((r) => r.movieTitle.toLowerCase() === movie.toLowerCase());
    }

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a new review
// @route   POST /api/reviews
// @access  Public / Optional Auth
export const createReview = async (req, res, next) => {
  try {
    const { movieTitle, movieId, rating, text, author } = req.body;

    if (!movieTitle || !text) {
      return res.status(400).json({
        success: false,
        message: 'Movie title and review text are required',
      });
    }

    const reviewAuthor = req.user?.name || author || 'Movie fan';
    const parsedRating = Number(rating) || 5;

    if (getDBStatus()) {
      const newReview = await Review.create({
        movieTitle,
        movieId: movieId || null,
        author: reviewAuthor,
        user: req.user?._id || null,
        rating: Math.min(5, Math.max(1, parsedRating)),
        text: text.trim(),
        source: req.user ? 'AUDIENCE REVIEW' : 'COMMUNITY REVIEW',
        date: 'Just now',
      });

      return res.status(201).json({
        success: true,
        message: 'Review published successfully',
        data: newReview,
      });
    }

    // In-memory fallback
    const fallbackReview = {
      _id: 'rev_' + Date.now(),
      movieTitle,
      movieId: movieId || null,
      author: reviewAuthor,
      rating: Math.min(5, Math.max(1, parsedRating)),
      text: text.trim(),
      source: 'AUDIENCE REVIEW',
      date: 'Just now',
      createdAt: new Date().toISOString(),
    };
    mockReviews.unshift(fallbackReview);

    res.status(201).json({
      success: true,
      message: 'Review published successfully (in-memory mode)',
      data: fallbackReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus() && id.match(/^[0-9a-fA-F]{24}$/)) {
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      await review.deleteOne();
      return res.json({ success: true, message: 'Review deleted successfully' });
    }

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
