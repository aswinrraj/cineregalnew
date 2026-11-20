import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getDBStatus } from '../config/db.js';

// Helper to generate JWT
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'cineregal_jwt_super_secret_production_key_2026',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// In-memory mock store if running in dev without an active MongoDB connection
const mockUsers = new Map();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // If MongoDB is connected, use Mongoose
    if (getDBStatus()) {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        city: city || 'Mumbai',
        watchlist: [],
      });

      const token = generateToken({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          city: user.city,
          watchlist: user.watchlist,
          preferences: user.preferences,
          role: user.role,
        },
      });
    }

    // Fallback in-memory mode if DB not running
    if (mockUsers.has(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists (in-memory mode)',
      });
    }

    const mockId = 'usr_' + Date.now();
    const newUser = {
      _id: mockId,
      id: mockId,
      name: name.trim(),
      email: normalizedEmail,
      city: city || 'Mumbai',
      watchlist: [],
      preferences: { email: true, push: false, public: true },
      role: 'user',
      password,
    };
    mockUsers.set(normalizedEmail, newUser);

    const token = generateToken({
      id: mockId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully (in-memory fallback)',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        city: newUser.city,
        watchlist: newUser.watchlist,
        preferences: newUser.preferences,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (getDBStatus()) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Use the administrator sign-in page for this account',
        });
      }

      const token = generateToken({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          city: user.city,
          watchlist: user.watchlist,
          preferences: user.preferences,
          role: user.role,
        },
      });
    }

    // In-memory fallback
    const mockUser = mockUsers.get(normalizedEmail);
    if (!mockUser || mockUser.password !== password) {
      // Allow demo user login fallback
      if (
        normalizedEmail === 'alex@cineregal.com' &&
        password === 'password123'
      ) {
        const demoUser = {
          id: 'usr_demo_1',
          name: 'Alex Morgan',
          email: 'alex@cineregal.com',
          city: 'Mumbai',
          watchlist: [2, 4],
          preferences: { email: true, push: false, public: true },
          role: 'user',
        };
        const token = generateToken(demoUser);
        return res.json({
          success: true,
          message: 'Demo login successful',
          token,
          user: demoUser,
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
    });

    return res.json({
      success: true,
      message: 'Logged in successfully (in-memory mode)',
      token,
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        city: mockUser.city,
        watchlist: mockUser.watchlist,
        preferences: mockUser.preferences,
        role: mockUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    if (getDBStatus() && req.user?._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        return res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            city: user.city,
            watchlist: user.watchlist,
            preferences: user.preferences,
            role: user.role,
          },
        });
      }
    }

    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & preferences
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, city, preferences } = req.body;

    if (getDBStatus() && req.user?._id) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (name) user.name = name.trim();
      if (email) user.email = email.toLowerCase().trim();
      if (city) user.city = city;
      if (preferences) {
        user.preferences = {
          ...user.preferences,
          ...preferences,
        };
      }

      const updatedUser = await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          city: updatedUser.city,
          watchlist: updatedUser.watchlist,
          preferences: updatedUser.preferences,
          role: updatedUser.role,
        },
      });
    }

    // In-memory update
    const updated = {
      ...req.user,
      name: name ? name.trim() : req.user.name,
      email: email ? email.toLowerCase().trim() : req.user.email,
      city: city || req.user.city,
      preferences: preferences ? { ...req.user.preferences, ...preferences } : req.user.preferences,
    };

    res.json({
      success: true,
      message: 'Profile updated successfully (in-memory mode)',
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle movie in watchlist
// @route   POST /api/auth/watchlist/toggle
// @access  Private
export const toggleWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    if (movieId === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required',
      });
    }

    const numId = Number(movieId);

    if (getDBStatus() && req.user?._id) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const exists = user.watchlist.includes(numId);
      if (exists) {
        user.watchlist = user.watchlist.filter((id) => id !== numId);
      } else {
        user.watchlist.push(numId);
      }

      await user.save();

      return res.json({
        success: true,
        message: exists ? 'Removed from watchlist' : 'Added to watchlist',
        watchlist: user.watchlist,
      });
    }

    res.json({
      success: true,
      message: 'Watchlist updated (in-memory)',
      watchlist: [numId],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password request simulation
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required',
    });
  }

  res.json({
    success: true,
    message: `A password reset link has been dispatched to ${email}`,
  });
};
