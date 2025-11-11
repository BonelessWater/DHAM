const express = require('express');
const router = express.Router();
const { Restaurant, User, Review, Favorite } = require('../models');
const { Op } = require('sequelize');

// Helper function to calculate restaurant score for a user
const calculateRestaurantScore = (restaurant, user) => {
  let score = 0;

  // Match cuisine preferences (40% weight)
  const userCuisines = user.cuisinePreferences || [];
  const restaurantCuisines = restaurant.cuisineType || [];
  const matchingCuisines = userCuisines.filter(c =>
    restaurantCuisines.some(rc => rc.toLowerCase().includes(c.toLowerCase()))
  );
  if (userCuisines.length > 0) {
    score += (matchingCuisines.length / userCuisines.length) * 40;
  }

  // Match atmosphere preferences (25% weight)
  const userAtmospheres = user.atmospherePreferences || [];
  const restaurantAtmospheres = restaurant.atmosphere || [];
  const matchingAtmospheres = userAtmospheres.filter(a =>
    restaurantAtmospheres.includes(a)
  );
  if (userAtmospheres.length > 0) {
    score += (matchingAtmospheres.length / userAtmospheres.length) * 25;
  }

  // Match price range (15% weight)
  if (restaurant.priceRange === user.priceRange) {
    score += 15;
  } else {
    // Partial score for adjacent price ranges
    const priceMap = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
    const userPrice = priceMap[user.priceRange] || 2;
    const restPrice = priceMap[restaurant.priceRange] || 2;
    const diff = Math.abs(userPrice - restPrice);
    if (diff === 1) score += 7.5;
  }

  // Match study spot preference (10% weight)
  if (user.studySpotPreference && restaurant.isStudyFriendly) {
    score += 10;
  }

  // Average rating bonus (10% weight)
  score += (restaurant.averageRating / 5) * 10;

  return Math.round(score);
};

// GET recommended restaurants for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { limit = 10, minScore = 40, excludeFavorites = false } = req.query;
    const userId = req.params.userId;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's favorite restaurants if we need to exclude them
    let excludedIds = [];
    if (excludeFavorites === 'true') {
      const favorites = await Favorite.findAll({
        where: { userId },
        attributes: ['restaurantId']
      });
      excludedIds = favorites.map(f => f.restaurantId);
    }

    // Get all active restaurants
    const where = { isActive: true };
    if (excludedIds.length > 0) {
      where.id = { [Op.notIn]: excludedIds };
    }

    const restaurants = await Restaurant.findAll({
      where,
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
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ]
        }
      ]
    });

    // Calculate scores and sort
    const recommendations = restaurants
      .map(restaurant => {
        const score = calculateRestaurantScore(restaurant, user);
        return {
          restaurant,
          recommendationScore: score,
          matchReasons: getMatchReasons(restaurant, user)
        };
      })
      .filter(r => r.recommendationScore >= parseInt(minScore))
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
});

// Helper function to explain why a restaurant was recommended
const getMatchReasons = (restaurant, user) => {
  const reasons = [];

  // Check cuisine match
  const userCuisines = user.cuisinePreferences || [];
  const restaurantCuisines = restaurant.cuisineType || [];
  const matchingCuisines = userCuisines.filter(c =>
    restaurantCuisines.some(rc => rc.toLowerCase().includes(c.toLowerCase()))
  );
  if (matchingCuisines.length > 0) {
    reasons.push(`Matches your cuisine preferences: ${matchingCuisines.join(', ')}`);
  }

  // Check atmosphere match
  const userAtmospheres = user.atmospherePreferences || [];
  const restaurantAtmospheres = restaurant.atmosphere || [];
  const matchingAtmospheres = userAtmospheres.filter(a =>
    restaurantAtmospheres.includes(a)
  );
  if (matchingAtmospheres.length > 0) {
    reasons.push(`${matchingAtmospheres.join(', ')} atmosphere`);
  }

  // Check price range
  if (restaurant.priceRange === user.priceRange) {
    reasons.push(`Within your price range (${restaurant.priceRange})`);
  }

  // Check study spot
  if (user.studySpotPreference && restaurant.isStudyFriendly) {
    reasons.push('Great for studying');
  }

  // Check dietary preferences
  const userFood = user.foodPreferences || [];
  if (userFood.includes('vegetarian') && restaurant.isVegetarianFriendly) {
    reasons.push('Vegetarian-friendly');
  }
  if (userFood.includes('vegan') && restaurant.isVeganFriendly) {
    reasons.push('Vegan options available');
  }

  // Check features
  if (restaurant.hasWifi) {
    reasons.push('Has WiFi');
  }

  // High rating
  if (restaurant.averageRating >= 4.5) {
    reasons.push(`Highly rated (${restaurant.averageRating} stars)`);
  }

  return reasons;
};

// GET similar restaurants (based on a specific restaurant)
router.get('/similar/:restaurantId', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const restaurantId = req.params.restaurantId;

    const baseRestaurant = await Restaurant.findByPk(restaurantId);

    if (!baseRestaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Find restaurants with similar attributes
    const where = {
      isActive: true,
      id: { [Op.ne]: restaurantId }
    };

    // Try to match price range and cuisine
    const similar = await Restaurant.findAll({
      where: {
        ...where,
        [Op.or]: [
          { priceRange: baseRestaurant.priceRange },
          { cuisineType: { [Op.overlap]: baseRestaurant.cuisineType } },
          { atmosphere: { [Op.overlap]: baseRestaurant.atmosphere } }
        ]
      },
      order: [['averageRating', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: similar
    });

  } catch (error) {
    console.error('Error getting similar restaurants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get similar restaurants',
      message: error.message
    });
  }
});

module.exports = router;
