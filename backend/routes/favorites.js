const express = require('express');
const router = express.Router();
const { Favorite, Restaurant, User } = require('../models');

// GET user's favorite restaurants
router.get('/user/:userId', async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.params.userId },
      include: [
        {
          model: Restaurant,
          as: 'restaurant'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: favorites
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorites',
      message: error.message
    });
  }
});

// POST - Add restaurant to favorites
router.post('/', async (req, res) => {
  try {
    const { userId, restaurantId, notes } = req.body;

    if (!userId || !restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'userId and restaurantId are required'
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      where: { userId, restaurantId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant already in favorites'
      });
    }

    const favorite = await Favorite.create({
      userId,
      restaurantId,
      notes
    });

    // Update restaurant total likes
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (restaurant) {
      await restaurant.update({
        totalLikes: restaurant.totalLikes + 1
      });
    }

    res.status(201).json({
      success: true,
      data: favorite
    });

  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add favorite',
      message: error.message
    });
  }
});

// DELETE - Remove restaurant from favorites
router.delete('/', async (req, res) => {
  try {
    const { userId, restaurantId } = req.body;

    if (!userId || !restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'userId and restaurantId are required'
      });
    }

    const deleted = await Favorite.destroy({
      where: { userId, restaurantId }
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found'
      });
    }

    // Update restaurant total likes
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (restaurant && restaurant.totalLikes > 0) {
      await restaurant.update({
        totalLikes: restaurant.totalLikes - 1
      });
    }

    res.json({
      success: true,
      message: 'Favorite removed'
    });

  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove favorite',
      message: error.message
    });
  }
});

// GET - Check if restaurant is favorited by user
router.get('/check/:userId/:restaurantId', async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: {
        userId: req.params.userId,
        restaurantId: req.params.restaurantId
      }
    });

    res.json({
      success: true,
      isFavorited: !!favorite
    });

  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check favorite',
      message: error.message
    });
  }
});

module.exports = router;
