import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  adminLogin,
  createMovie,
  deleteMovie,
  getAdminMe,
  getOpenMovie,
  getOverview,
  listBookings,
  listMovies,
  listReviews,
  listSupportRequests,
  moderateReview,
  removeReview,
  searchOpenMovies,
  updateMovie,
  updateBookingRefundStatus,
  updateSupportStatus,
} from '../controllers/adminController.js';

const router = express.Router();

router.post('/auth/login', adminLogin);
router.use(protect, admin);
router.get('/auth/me', getAdminMe);
router.get('/overview', getOverview);

router.get('/movies', listMovies);
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

router.get('/import/search', searchOpenMovies);
router.get('/import/:id', getOpenMovie);

router.get('/reviews', listReviews);
router.patch('/reviews/:id', moderateReview);
router.delete('/reviews/:id', removeReview);

router.get('/support', listSupportRequests);
router.patch('/support/:id', updateSupportStatus);

router.get('/bookings', listBookings);
router.patch('/bookings/:id/refund', updateBookingRefundStatus);

export default router;
