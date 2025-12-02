const express = require("express");
const router = express.Router();

// Firebase-based models
const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

// GET reviews for a restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const { rating, sortBy, limit = 20, offset = 0 } = req.query;
    const restaurantId = req.params.restaurantId;

    const limitNum = parseInt(limit, 10) || 20;
    const offsetNum = parseInt(offset, 10) || 0;

    // All reviews for this restaurant from Firebase
    let reviews = await Review.findByRestaurantId(restaurantId);

    // Filter by rating if specified
    if (rating) {
      const ratingInt = parseInt(rating, 10);
      reviews = reviews.filter((r) => Number(r.rating) === ratingInt);
    }

    // Sorting
    reviews.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(0);

      if (sortBy === "rating_high") {
        const ra = Number(a.rating) || 0;
        const rb = Number(b.rating) || 0;
        if (rb !== ra) return rb - ra;
        return db - da;
      }

      if (sortBy === "rating_low") {
        const ra = Number(a.rating) || 0;
        const rb = Number(b.rating) || 0;
        if (ra !== rb) return ra - rb;
        return db - da;
      }

      if (sortBy === "helpful") {
        const ha = Number(a.helpfulCount) || 0;
        const hb = Number(b.helpfulCount) || 0;
        if (hb !== ha) return hb - ha;
        return db - da;
      }

      // default: createdAt DESC
      return db - da;
    });

    const total = reviews.length;

    const paged = reviews.slice(offsetNum, offsetNum + limitNum);

    // Attach user info similar to original
    const result = [];
    for (const r of paged) {
      const user = await User.findById(r.userId);
      result.push({
        ...r.toSafeObject(),
        user: user ? user.toSafeObject() : null,
      });
    }

    res.json({
      success: true,
      data: result,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + paged.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews",
      message: error.message,
    });
  }
});

// GET reviews by user
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    let reviews = await Review.findByUserId(userId);

    // Newest first
    reviews.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return db - da;
    });

    // Attach restaurant info similar to original
    const result = [];
    for (const r of reviews) {
      const restaurant = await Restaurant.findById(r.restaurantId);
      result.push({
        ...r.toSafeObject(),
        restaurant: restaurant
          ? restaurant.toSafeObject()
          : null,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user reviews",
      message: error.message,
    });
  }
});

// POST - Create a review
router.post("/", async (req, res) => {
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
      dishesOrdered,
      images,
    } = req.body;

    // Validation
    if (!userId || !restaurantId || !rating || !content) {
      return res.status(400).json({
        success: false,
        error:
          "userId, restaurantId, rating, and content are required",
      });
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5",
      });
    }

    // Check if user already reviewed this restaurant
    const existing = await Review.findByUserId(userId);
    const already = existing.find(
      (r) => r.restaurantId === restaurantId
    );
    if (already) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this restaurant",
      });
    }

    // Create review in Firebase (model handles restaurant rating updates)
    const review = await Review.create({
      userId,
      restaurantId,
      rating: ratingNum,
      title,
      content,
      foodQuality,
      serviceQuality,
      atmosphereRating,
      valueRating,
      visitDate,
      dishesOrdered,
      images,
    });

    // Attach user info like original
    const user = await User.findById(userId);

    res.status(201).json({
      success: true,
      data: {
        ...review.toSafeObject(),
        user: user ? user.toSafeObject() : null,
      },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create review",
      message: error.message,
    });
  }
});

// PUT - Update a review
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const existing = await Review.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
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
      dishesOrdered,
      images,
    } = req.body;

    const updated = await Review.update(id, {
      rating,
      title,
      content,
      foodQuality,
      serviceQuality,
      atmosphereRating,
      valueRating,
      dishesOrdered,
      images,
    });

    res.json({
      success: true,
      data: updated.toSafeObject(),
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update review",
      message: error.message,
    });
  }
});

// DELETE - Delete a review
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const existing = await Review.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    await Review.delete(id);

    res.json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete review",
      message: error.message,
    });
  }
});

// POST - Mark review as helpful
router.post("/:id/helpful", async (req, res) => {
  try {
    const id = req.params.id;

    const existing = await Review.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    await Review.incrementHelpfulCount(id, 1);
    const updated = await Review.findById(id);

    res.json({
      success: true,
      data: updated.toSafeObject(),
    });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark review as helpful",
      message: error.message,
    });
  }
});

module.exports = router;
