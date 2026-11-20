import { randomBytes } from 'node:crypto';
import Feedback from '../models/Feedback.js';
import { getDBStatus } from '../config/db.js';

const mockFeedbacks = [];
const supportCategories = new Set([
  'Booking issue',
  'Refund request',
  'Account access',
  'Technical issue',
  'Other',
]);

const makeTicketCode = () => (
  `CR-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`
);

// @desc    Submit user feedback or note
// @route   POST /api/feedback
// @access  Public
export const submitFeedback = async (req, res, next) => {
  try {
    const { email, category, note } = req.body;

    if (!email || !note) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your email address and feedback note',
      });
    }

    if (getDBStatus()) {
      const feedback = await Feedback.create({
        kind: 'feedback',
        email: email.trim().toLowerCase(),
        category: category || 'A little feedback',
        note: note.trim(),
      });

      return res.status(201).json({
        success: true,
        message: 'Feedback received. Thank you for helping us improve CinéRegal.',
        data: feedback,
      });
    }

    // In-memory fallback
    const entry = {
      _id: 'fb_' + Date.now(),
      kind: 'feedback',
      email: email.trim().toLowerCase(),
      category: category || 'A little feedback',
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    mockFeedbacks.push(entry);

    res.status(201).json({
      success: true,
      message: 'Feedback received. Thank you! (in-memory mode)',
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a trackable support request for the signed-in customer
// @route   POST /api/feedback/tickets
// @access  Private
export const createSupportTicket = async (req, res, next) => {
  try {
    const note = typeof req.body.note === 'string' ? req.body.note.trim() : '';
    const category = supportCategories.has(req.body.category) ? req.body.category : 'Other';
    const email = req.user?.email?.trim().toLowerCase();

    if (!email || note.length < 10 || note.length > 5000) {
      return res.status(400).json({
        success: false,
        message: !email
          ? 'A verified account email is required to open a support ticket'
          : 'Describe the issue in 10 to 5,000 characters',
      });
    }

    const ticketData = {
      kind: 'support',
      user: req.user?._id || null,
      userName: req.user?.name || '',
      ticketCode: makeTicketCode(),
      email,
      category,
      note,
      status: 'open',
    };

    if (getDBStatus()) {
      const ticket = await Feedback.create(ticketData);
      return res.status(201).json({
        success: true,
        message: 'Support ticket created',
        data: ticket,
      });
    }

    const ticket = {
      ...ticketData,
      _id: `support_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockFeedbacks.unshift(ticket);
    return res.status(201).json({
      success: true,
      message: 'Support ticket created',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List the signed-in customer's support tickets
// @route   GET /api/feedback/tickets/my
// @access  Private
export const getMySupportTickets = async (req, res, next) => {
  try {
    const userId = req.user?._id ? String(req.user._id) : '';
    const email = req.user?.email?.trim().toLowerCase();
    const ownership = [];
    if (/^[0-9a-fA-F]{24}$/.test(userId)) ownership.push({ user: userId });
    if (email) ownership.push({ email });
    if (!ownership.length) {
      return res.status(401).json({ success: false, message: 'A signed-in account is required' });
    }

    if (getDBStatus()) {
      const tickets = await Feedback.find({
        kind: 'support',
        $or: ownership,
      }).sort({ createdAt: -1 }).limit(100);
      return res.json({ success: true, count: tickets.length, data: tickets });
    }

    const tickets = mockFeedbacks.filter((ticket) => (
      ticket.kind === 'support' &&
      ((userId && String(ticket.user) === userId) || (email && ticket.email === email))
    ));
    return res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback entries
// @route   GET /api/feedback
// @access  Private/Admin
export const getAllFeedback = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const feedbacks = await Feedback.find().sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: feedbacks.length,
        data: feedbacks,
      });
    }

    res.json({
      success: true,
      count: mockFeedbacks.length,
      data: mockFeedbacks,
    });
  } catch (error) {
    next(error);
  }
};
