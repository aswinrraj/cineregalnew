import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  toggleWatchlist,
  forgotPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/watchlist/toggle', protect, toggleWatchlist);
router.post('/forgot-password', forgotPassword);

export default router;
