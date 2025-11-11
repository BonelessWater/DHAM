const express = require('express');
const router = express.Router();
const { Restaurant, Review, User, Favorite } = require('../models');
const { Op } = require('sequelize');

// GET all restaurants with advanced filtering
router.get('/', async (req, res) => {
  try {
    const {
      priceRange,
      cuisineType,
      atmosphere,
      isStudyFriendly,
      hasWifi,
      hasOutdoorSeating,
      hasParking,
      isVegetarianFriendly,
      isVeganFriendly,
      isGlutenFreeFriendly,
      minRating,
      search,
      sortBy,
      limit = 50,
      offset = 0
    } = req.query;

    // Build filter conditions
    const where = { isActive: true };

    if (priceRange) {
      const prices = Array.isArray(priceRange) ? priceRange : [priceRange];
      where.priceRange = { [Op.in]: prices };
    }

    if (cuisineType) {
      const cuisines = Array.isArray(cuisineType) ? cuisineType : [cuisineType];
      where.cuisineType = { [Op.overlap]: cuisines };
    }

    if (atmosphere) {
      const atmospheres = Array.isArray(atmosphere) ? atmosphere : [atmosphere];
      where.atmosphere = { [Op.overlap]: atmospheres };
    }

    if (isStudyFriendly === 'true') {
      where.isStudyFriendly = true;
    }

    if (hasWifi === 'true') {
      where.hasWifi = true;
    }

    if (hasOutdoorSeating === 'true') {
      where.hasOutdoorSeating = true;
    }

    if (hasParking === 'true') {
      where.hasParking = true;
    }

    if (isVegetarianFriendly === 'true') {
      where.isVegetarianFriendly = true;
    }

    if (isVeganFriendly === 'true') {
      where.isVeganFriendly = true;
    }

    if (isGlutenFreeFriendly === 'true') {
      where.isGlutenFreeFriendly = true;
    }

    if (minRating) {
      where.averageRating = { [Op.gte]: parseFloat(minRating) };
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Determine sorting
    let order = [['averageRating', 'DESC'], ['totalReviews', 'DESC']];
    if (sortBy === 'name') {
      order = [['name', 'ASC']];
    } else if (sortBy === 'price_low') {
      order = [['priceRange', 'ASC']];
    } else if (sortBy === 'price_high') {
      order = [['priceRange', 'DESC']];
    } else if (sortBy === 'rating') {
      order = [['averageRating', 'DESC']];
    } else if (sortBy === 'popular') {
      order = [['totalLikes', 'DESC'], ['totalReviews', 'DESC']];
    }

    const restaurants = await Restaurant.findAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Review,
          as: 'reviews',
          limit: 3,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        }
      ]
    });

    const total = await Restaurant.count({ where });

    res.json({
      success: true,
      data: restaurants,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + restaurants.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurants',
      message: error.message
    });
  }
});

// GET single restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });

  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant',
      message: error.message
    });
  }
});

// GET filter options (for UI dropdowns)
router.get('/meta/filters', async (req, res) => {
  try {
    const cuisineTypes = await Restaurant.findAll({
      attributes: ['cuisineType'],
      where: { isActive: true }
    });

    const atmospheres = await Restaurant.findAll({
      attributes: ['atmosphere'],
      where: { isActive: true }
    });

    // Extract unique values from arrays
    const uniqueCuisines = [...new Set(
      cuisineTypes.flatMap(r => r.cuisineType || [])
    )].sort();

    const uniqueAtmospheres = [...new Set(
      atmospheres.flatMap(r => r.atmosphere || [])
    )].sort();

    res.json({
      success: true,
      data: {
        priceRanges: ['$', '$$', '$$$', '$$$$'],
        cuisineTypes: uniqueCuisines,
        atmospheres: uniqueAtmospheres,
        features: [
          'isStudyFriendly',
          'hasWifi',
          'hasOutdoorSeating',
          'hasParking',
          'isVegetarianFriendly',
          'isVeganFriendly',
          'isGlutenFreeFriendly'
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch filter options',
      message: error.message
    });
  }
});

module.exports = router;
