import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getDBStatus } from '../config/db.js';

// Protect routes - requires valid JWT
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'cineregal_jwt_super_secret_production_key_2026'
      );

      // Try finding user in database
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      } else {
        // Fallback user if running without persistent database or user was mock-generated
        req.user = {
          _id: decoded.id,
          name: decoded.name || 'User',
          email: decoded.email || '',
          city: decoded.city || 'Mumbai',
          role: decoded.role || 'user',
        };
      }

      return next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

// Optional auth - attaches user if valid token present, but doesn't block if not
export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'cineregal_jwt_super_secret_production_key_2026'
      );
      const user = await User.findById(decoded.id).select('-password');
      req.user = user || {
        _id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email || '',
      };
    } catch (error) {
      // Ignored for optional auth
    }
  }
  next();
};

// Admin privileges must be confirmed against the persisted account, never JWT claims alone.
export const admin = async (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'JWT_SECRET must be configured before administrator access is enabled',
    });
  }

  if (!getDBStatus()) {
    return res.status(503).json({
      success: false,
      message: 'Admin access requires a connected MongoDB database',
    });
  }

  try {
    const user = req.user?._id
      ? await User.findById(req.user._id).select('name email loginId role')
      : null;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Admin account is no longer available' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges are required' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
