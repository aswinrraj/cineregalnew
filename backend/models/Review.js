import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    movieTitle: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    movieId: {
      type: Number,
      default: null,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      default: 'Movie fan',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
      default: 5,
    },
    text: {
      type: String,
      required: [true, 'Review text is required'],
      maxlength: [500, 'Review cannot exceed 500 characters'],
      trim: true,
    },
    source: {
      type: String,
      default: 'AUDIENCE REVIEW',
    },
    isCritic: {
      type: Boolean,
      default: false,
    },
    isSample: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['approved', 'hidden'],
      default: 'approved',
      index: true,
    },
    date: {
      type: String,
      default: () => 'Just now',
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
