import express from 'express';
import {
  createSupportTicket,
  getMySupportTickets,
  submitFeedback,
  getAllFeedback,
} from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/tickets', protect, createSupportTicket);
router.get('/tickets/my', protect, getMySupportTickets);
router.route('/')
  .post(submitFeedback)
  .get(protect, admin, getAllFeedback);

export default router;
