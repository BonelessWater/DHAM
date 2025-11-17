const express = require('express');
const router = express.Router();
const { Review, Restaurant, User } = require('../models');
const { Op } = require('sequelize');

// GET reviews for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { rating, sortBy, limit = 20, offset = 0 } = req.query;

    const where = { restaurantId: req.params.restaurantId };

    // Filter by rating if specified
    if (rating) {
      where.rating = parseInt(rating);
    }

    // Determine sorting
    let order = [['createdAt', 'DESC']];
    if (sortBy === 'rating_high') {
      order = [['rating', 'DESC'], ['createdAt', 'DESC']];
    } else if (sortBy === 'rating_low') {
      order = [['rating', 'ASC'], ['createdAt', 'DESC']];
    } else if (sortBy === 'helpful') {
      order = [['helpfulCount', 'DESC'], ['createdAt', 'DESC']];
    }

    const reviews = await Review.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Review.count({ where });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + reviews.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews',
      message: error.message
    });
  }
});

// GET reviews by user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.params.userId },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'imageUrl', 'priceRange', 'cuisineType']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user reviews',
      message: error.message
    });
  }
});

// POST - Create a review
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      restaurantId,
      rating,
      title,
      content,
      foodQuality,
      serviceQuality,
      atmosphereRating,
      valueRating,
      visitDate,
      dishesOrdered
    } = req.body;

    // Validation
    if (!userId || !restaurantId || !rating || !content) {
      return res.status(400).json({
        success: false,
        error: 'userId, restaurantId, rating, and content are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if user already reviewed this restaurant
    const existingReview = await Review.findOne({
      where: { userId, restaurantId }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this restaurant'
      });
    }

    const review = await Review.create({
      userId,
      restaurantId,
      rating,
      title,
      content,
      foodQuality,
      serviceQuality,
      atmosphereRating,
      valueRating,
      visitDate,
      dishesOrdered
    });

    // Update restaurant average rating
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (restaurant) {
      const allReviews = await Review.findAll({
        where: { restaurantId },
        attributes: ['rating']
      });

      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await restaurant.update({
        averageRating: avgRating.toFixed(2),
        totalReviews: allReviews.length
      });
    }

    // Fetch the created review with user data
    const createdReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdReview
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create review',
      message: error.message
    });
  }
});

// PUT - Update a review
router.put('/:id', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const {
      rating,
      title,
      content,
      foodQuality,
      serviceQuality,
      atmosphereRating,
      valueRating,
      dishesOrdered
    } = req.body;

    await review.update({
      rating,
      title,
      content,
      foodQuality,
      serviceQuality,
      atmosphereRating,
      valueRating,
      dishesOrdered
    });

    // Update restaurant average rating
    const allReviews = await Review.findAll({
      where: { restaurantId: review.restaurantId },
      attributes: ['rating']
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Restaurant.update(
      { averageRating: avgRating.toFixed(2) },
      { where: { id: review.restaurantId } }
    );

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review',
      message: error.message
    });
  }
});

// DELETE - Delete a review
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const restaurantId = review.restaurantId;
    await review.destroy();

    // Update restaurant ratings
    const allReviews = await Review.findAll({
      where: { restaurantId },
      attributes: ['rating']
    });

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Restaurant.update(
        {
          averageRating: avgRating.toFixed(2),
          totalReviews: allReviews.length
        },
        { where: { id: restaurantId } }
      );
    } else {
      await Restaurant.update(
        {
          averageRating: 0,
          totalReviews: 0
        },
        { where: { id: restaurantId } }
      );
    }

    res.json({
      success: true,
      message: 'Review deleted'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review',
      message: error.message
    });
  }
});

// POST - Mark review as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    await review.update({
      helpfulCount: review.helpfulCount + 1
    });

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark review as helpful',
      message: error.message
    });
  }
});

module.exports = router;
