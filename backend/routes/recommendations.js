const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Favorite = require("../models/Favorite");

// Helper: normalize instance/plain object
const asPlain = (obj) => (obj && obj.toSafeObject ? obj.toSafeObject() : obj || {});

// Helper function to calculate restaurant score for a user
const calculateRestaurantScore = (restaurant, user) => {
  let score = 0;

  // Match cuisine preferences (40% weight)
  const userCuisines = user.cuisinePreferences || [];
  const restaurantCuisines = restaurant.cuisineType || [];
  const matchingCuisines = userCuisines.filter((c) =>
    restaurantCuisines.some((rc) =>
      rc.toLowerCase().includes(c.toLowerCase())
    )
  );
  if (userCuisines.length > 0) {
    score += (matchingCuisines.length / userCuisines.length) * 40;
  }

  // Match atmosphere preferences (25% weight)
  const userAtmospheres = user.atmospherePreferences || [];
  const restaurantAtmospheres = restaurant.atmosphere || [];
  const matchingAtmospheres = userAtmospheres.filter((a) =>
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
    const priceMap = { "$": 1, "$$": 2, "$$$": 3, "$$$$": 4 };
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
  const avg = Number(restaurant.averageRating || 0);
  score += (avg / 5) * 10;

  return Math.round(score);
};

// Helper function to explain why a restaurant was recommended
const getMatchReasons = (restaurant, user) => {
  const reasons = [];

  // Check cuisine match
  const userCuisines = user.cuisinePreferences || [];
  const restaurantCuisines = restaurant.cuisineType || [];
  const matchingCuisines = userCuisines.filter((c) =>
    restaurantCuisines.some((rc) =>
      rc.toLowerCase().includes(c.toLowerCase())
    )
  );
  if (matchingCuisines.length > 0) {
    reasons.push(
      `Matches your cuisine preferences: ${matchingCuisines.join(", ")}`
    );
  }

  // Check atmosphere match
  const userAtmospheres = user.atmospherePreferences || [];
  const restaurantAtmospheres = restaurant.atmosphere || [];
  const matchingAtmospheres = userAtmospheres.filter((a) =>
    restaurantAtmospheres.includes(a)
  );
  if (matchingAtmospheres.length > 0) {
    reasons.push(`${matchingAtmospheres.join(", ")} atmosphere`);
  }

  // Check price range
  if (restaurant.priceRange === user.priceRange) {
    reasons.push(`Within your price range (${restaurant.priceRange})`);
  }

  // Check study spot
  if (user.studySpotPreference && restaurant.isStudyFriendly) {
    reasons.push("Great for studying");
  }

  // Check dietary preferences
  const userFood = user.foodPreferences || [];
  if (userFood.includes("vegetarian") && restaurant.isVegetarianFriendly) {
    reasons.push("Vegetarian-friendly");
  }
  if (userFood.includes("vegan") && restaurant.isVeganFriendly) {
    reasons.push("Vegan options available");
  }

  // Check features
  if (restaurant.hasWifi) {
    reasons.push("Has WiFi");
  }

  // High rating
  const avg = Number(restaurant.averageRating || 0);
  if (avg >= 4.5) {
    reasons.push(`Highly rated (${avg} stars)`);
  }

  return reasons;
};

// GET recommended restaurants for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { limit = 10, minScore = 40, excludeFavorites = false } = req.query;
    const userId = req.params.userId;

    const userInstance = await User.findById(userId);
    if (!userInstance) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    const user = asPlain(userInstance);

    // Get user's favorite restaurants if we need to exclude them
    let excludedIds = [];
    if (excludeFavorites === "true") {
      const favorites = await Favorite.findByUserId(userId);
      excludedIds = favorites.map((f) => f.restaurantId);
    }

    // Get all active restaurants from Firebase
    const allRestaurants = await Restaurant.findAll(); // assumes this exists
    const activeRestaurants = allRestaurants
      .map(asPlain)
      .filter(
        (r) =>
          r.isActive !== false &&
          (!excludedIds.length || !excludedIds.includes(r.id))
      );

    const minScoreInt = parseInt(minScore, 10) || 0;
    const limitInt = parseInt(limit, 10) || 10;

    // Calculate scores and sort
    const recommendations = activeRestaurants
      .map((restaurant) => {
        const recommendationScore = calculateRestaurantScore(
          restaurant,
          user
        );
        return {
          restaurant,
          recommendationScore,
          matchReasons: getMatchReasons(restaurant, user),
        };
      })
      .filter((r) => r.recommendationScore >= minScoreInt)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limitInt);

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get recommendations",
      message: error.message,
    });
  }
});

// GET similar restaurants (based on a specific restaurant)
router.get("/similar/:restaurantId", async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const restaurantId = req.params.restaurantId;

    const baseInstance = await Restaurant.findById(restaurantId);
    if (!baseInstance) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }
    const baseRestaurant = asPlain(baseInstance);

    const allRestaurants = await Restaurant.findAll();
    const candidates = allRestaurants
      .map(asPlain)
      .filter((r) => r.id !== restaurantId && r.isActive !== false);

    const limitInt = parseInt(limit, 10) || 5;

    const baseCuisines = baseRestaurant.cuisineType || [];
    const baseAtmosphere = baseRestaurant.atmosphere || [];
    const basePrice = baseRestaurant.priceRange;

    const similar = candidates
      .filter((r) => {
        const samePrice = r.priceRange === basePrice;

        const cuisines = r.cuisineType || [];
        const atmos = r.atmosphere || [];

        const cuisineOverlap = baseCuisines.some((c) =>
          cuisines.includes(c)
        );
        const atmosphereOverlap = baseAtmosphere.some((a) =>
          atmos.includes(a)
        );

        return samePrice || cuisineOverlap || atmosphereOverlap;
      })
      .sort((a, b) => {
        const ra = Number(a.averageRating || 0);
        const rb = Number(b.averageRating || 0);
        return rb - ra;
      })
      .slice(0, limitInt);

    res.json({
      success: true,
      data: similar,
    });
  } catch (error) {
    console.error("Error getting similar restaurants:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get similar restaurants",
      message: error.message,
    });
  }
});

module.exports = router;
