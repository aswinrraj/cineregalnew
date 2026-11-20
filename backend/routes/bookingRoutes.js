import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookedSeats,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getUserBookings);
router.get('/seats', getBookedSeats);
router.patch('/:id/cancel', protect, cancelBooking);
router.get('/:id', getBookingById);

export default router;
