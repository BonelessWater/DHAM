const express = require("express");
const router = express.Router();

const Favorite = require("../models/Favorite");
const Restaurant = require("../models/Restaurant");

// GET user's favorite restaurants
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get favorites from Firebase
    let favorites = await Favorite.findByUserId(userId);

    // Sort by createdAt DESC
    favorites.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return db - da;
    });

    // Attach restaurant object
    const result = [];
    for (const fav of favorites) {
      const restaurant = await Restaurant.findById(fav.restaurantId);
      result.push({
        ...fav.toSafeObject(),
        restaurant: restaurant ? restaurant.toSafeObject() : null,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch favorites",
      message: error.message,
    });
  }
});

// POST - Add restaurant to favorites
router.post("/", async (req, res) => {
  try {
    const { userId, restaurantId, notes } = req.body;

    if (!userId || !restaurantId) {
      return res.status(400).json({
        success: false,
        error: "userId and restaurantId are required",
      });
    }

    // Create favorite in Firebase (model prevents duplicates)
    let favorite;
    try {
      favorite = await Favorite.create({ userId, restaurantId, notes });
    } catch (err) {
      if (err.message.includes("already in favorites")) {
        return res.status(400).json({
          success: false,
          error: "Restaurant already in favorites",
        });
      }
      throw err;
    }

    // Update restaurant totalLikes (Firebase Restaurant model)
    await Restaurant.incrementCounters(restaurantId, { totalLikes: 1 });

    res.status(201).json({
      success: true,
      data: favorite.toSafeObject(),
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add favorite",
      message: error.message,
    });
  }
});

// DELETE - Remove restaurant from favorites
router.delete("/", async (req, res) => {
  try {
    const { userId, restaurantId } = req.body;

    if (!userId || !restaurantId) {
      return res.status(400).json({
        success: false,
        error: "userId and restaurantId are required",
      });
    }

    // Find the favorite row first
    const favorite = await Favorite.findByUserAndRestaurant(
      userId,
      restaurantId
    );

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: "Favorite not found",
      });
    }

    await Favorite.delete(favorite.id);

    // Decrement restaurant totalLikes
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) {
      const newLikes = Math.max(
        0,
        Number(restaurant.totalLikes || 0) - 1
      );
      await Restaurant.update(restaurantId, {
        totalLikes: newLikes,
      });
    }

    res.json({
      success: true,
      message: "Favorite removed",
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove favorite",
      message: error.message,
    });
  }
});

// GET - Check if restaurant is favorited by user
router.get("/check/:userId/:restaurantId", async (req, res) => {
  try {
    const { userId, restaurantId } = req.params;

    const favorite = await Favorite.findByUserAndRestaurant(
      userId,
      restaurantId
    );

    res.json({
      success: true,
      isFavorited: !!favorite,
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check favorite",
      message: error.message,
    });
  }
});

module.exports = router;
