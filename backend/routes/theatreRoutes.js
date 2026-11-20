import express from 'express';
import {
  getTheatres,
  getTheatreById,
  createTheatre,
} from '../controllers/theatreController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTheatres)
  .post(protect, admin, createTheatre);

router.route('/:id')
  .get(getTheatreById);

export default router;
