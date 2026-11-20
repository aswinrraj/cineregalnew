import Theatre from '../models/Theatre.js';
import { initialTheatres } from '../data/seedData.js';
import { getDBStatus } from '../config/db.js';

// @desc    Get all theatres, optionally filtered by city
// @route   GET /api/theatres
// @access  Public
export const getTheatres = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (getDBStatus()) {
      const query = city ? { city: { $regex: new RegExp(`^${city}$`, 'i') } } : {};
      const theatres = await Theatre.find(query);
      if (theatres.length > 0) {
        return res.json({
          success: true,
          count: theatres.length,
          data: theatres,
        });
      }
    }

    // Fallback data
    let list = [...initialTheatres];
    if (city) {
      list = list.filter((t) => t.city.toLowerCase() === city.toLowerCase());
      // If none found for that specific city in the demo seed, return list with that city mapped
      if (list.length === 0) {
        list = initialTheatres.slice(0, 3).map((t) => ({ ...t, city }));
      }
    }

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
export const getTheatreById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus() && id.match(/^[0-9a-fA-F]{24}$/)) {
      const theatre = await Theatre.findById(id);
      if (theatre) {
        return res.json({ success: true, data: theatre });
      }
    }

    const found = initialTheatres.find((t) => t.name === decodeURIComponent(id));
    if (found) {
      return res.json({ success: true, data: found });
    }

    res.status(404).json({ success: false, message: 'Theatre not found' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a theatre
// @route   POST /api/theatres
// @access  Private/Admin
export const createTheatre = async (req, res, next) => {
  try {
    const { name, city, place, flag, amenities, times, formats } = req.body;

    if (!name || !city || !place) {
      return res.status(400).json({
        success: false,
        message: 'Name, city, and place are required',
      });
    }

    if (getDBStatus()) {
      const theatre = await Theatre.create({
        name,
        city,
        place,
        flag: flag || 'STANDARD',
        amenities: amenities || ['Recliner', 'Dolby Atmos'],
        times: times || ['10:30 AM', '1:45 PM', '5:20 PM', '9:10 PM'],
        formats: formats || ['4K', 'IMAX'],
      });

      return res.status(201).json({
        success: true,
        data: theatre,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Theatre created (in-memory mode)',
      data: req.body,
    });
  } catch (error) {
    next(error);
  }
};
