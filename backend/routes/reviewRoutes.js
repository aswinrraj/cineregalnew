import express from 'express';
import {
  getAllReviews,
  createReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { optionalAuth, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllReviews)
  .post(optionalAuth, createReview);

router.route('/:id')
  .delete(protect, deleteReview);

export default router;
