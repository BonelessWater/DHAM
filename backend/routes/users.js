const express = require('express');
const router = express.Router();
const { User, Review, Favorite, Restaurant } = require('../models');
const jwt = require('jsonwebtoken');

// POST - Register a new user
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      bio,
      interests,
      foodPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      priceRange,
      atmospherePreferences,
      studySpotPreference,
      socialPreference,
      openToMatching
    } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    // Create user (password will be hashed by the model hook)
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      bio,
      interests: interests || [],
      foodPreferences: foodPreferences || [],
      dietaryRestrictions: dietaryRestrictions || [],
      cuisinePreferences: cuisinePreferences || [],
      priceRange: priceRange || '$$',
      atmospherePreferences: atmospherePreferences || [],
      studySpotPreference: studySpotPreference || false,
      socialPreference: socialPreference !== undefined ? socialPreference : true,
      openToMatching: openToMatching !== undefined ? openToMatching : true
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user',
      message: error.message
    });
  }
});

// POST - Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login',
      message: error.message
    });
  }
});

// GET - Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Review,
          as: 'reviews',
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name', 'imageUrl']
            }
          ]
        },
        {
          model: Favorite,
          as: 'favorites',
          limit: 10,
          include: [
            {
              model: Restaurant,
              as: 'restaurant'
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

// PUT - Update user profile
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const {
      firstName,
      lastName,
      bio,
      profilePicture,
      interests,
      foodPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      priceRange,
      atmospherePreferences,
      studySpotPreference,
      socialPreference,
      location,
      latitude,
      longitude,
      openToMatching
    } = req.body;

    // Update user
    await user.update({
      firstName,
      lastName,
      bio,
      profilePicture,
      interests,
      foodPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      priceRange,
      atmospherePreferences,
      studySpotPreference,
      socialPreference,
      location,
      latitude,
      longitude,
      openToMatching
    });

    res.json({
      success: true,
      data: user.toSafeObject()
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// PUT - Update user preferences
router.put('/:id/preferences', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const {
      interests,
      foodPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      priceRange,
      atmospherePreferences,
      studySpotPreference,
      socialPreference
    } = req.body;

    await user.update({
      interests,
      foodPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      priceRange,
      atmospherePreferences,
      studySpotPreference,
      socialPreference
    });

    res.json({
      success: true,
      data: user.toSafeObject()
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
      message: error.message
    });
  }
});

// GET - Get all users (for admin or matching)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, openToMatching } = req.query;

    const where = { isActive: true };

    if (openToMatching === 'true') {
      where.openToMatching = true;
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const total = await User.count({ where });

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + users.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

module.exports = router;
