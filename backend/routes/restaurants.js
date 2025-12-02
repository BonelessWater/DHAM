const express = require("express");
const router = express.Router();

// Use Firebase-based Restaurant model directly
const Restaurant = require("../models/Restaurant");

// Helper: normalize query param to array
function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

// Helper: price range order for sorting
const PRICE_ORDER = { "$": 1, "$$": 2, "$$$": 3, "$$$$": 4 };

// GET all restaurants with advanced filtering
router.get("/", async (req, res) => {
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
      offset = 0,
    } = req.query;

    const limitNum = parseInt(limit, 10) || 50;
    const offsetNum = parseInt(offset, 10) || 0;

    // Fetch all active restaurants from Firebase
    let restaurants = await Restaurant.findAll();
    restaurants = restaurants.filter((r) => r.isActive !== false);

    // Build filters (done in JS instead of SQL)
    const priceRanges = asArray(priceRange);
    const cuisineTypes = asArray(cuisineType);
    const atmospheres = asArray(atmosphere);

    if (priceRanges.length > 0) {
      restaurants = restaurants.filter((r) =>
        priceRanges.includes(r.priceRange)
      );
    }

    if (cuisineTypes.length > 0) {
      restaurants = restaurants.filter((r) => {
        const arr = Array.isArray(r.cuisineType) ? r.cuisineType : [];
        return arr.some((c) => cuisineTypes.includes(c));
      });
    }

    if (atmospheres.length > 0) {
      restaurants = restaurants.filter((r) => {
        const arr = Array.isArray(r.atmosphere) ? r.atmosphere : [];
        return arr.some((a) => atmospheres.includes(a));
      });
    }

    if (isStudyFriendly === "true") {
      restaurants = restaurants.filter((r) => r.isStudyFriendly === true);
    }
    if (hasWifi === "true") {
      restaurants = restaurants.filter((r) => r.hasWifi === true);
    }
    if (hasOutdoorSeating === "true") {
      restaurants = restaurants.filter((r) => r.hasOutdoorSeating === true);
    }
    if (hasParking === "true") {
      restaurants = restaurants.filter((r) => r.hasParking === true);
    }
    if (isVegetarianFriendly === "true") {
      restaurants = restaurants.filter(
        (r) => r.isVegetarianFriendly === true
      );
    }
    if (isVeganFriendly === "true") {
      restaurants = restaurants.filter((r) => r.isVeganFriendly === true);
    }
    if (isGlutenFreeFriendly === "true") {
      restaurants = restaurants.filter(
        (r) => r.isGlutenFreeFriendly === true
      );
    }

    if (minRating) {
      const min = parseFloat(minRating);
      restaurants = restaurants.filter(
        (r) => (Number(r.averageRating) || 0) >= min
      );
    }

    if (search) {
      const q = String(search).toLowerCase();
      restaurants = restaurants.filter((r) => {
        const name = (r.name || "").toLowerCase();
        const desc = (r.description || "").toLowerCase();
        const addr = (r.address || "").toLowerCase();
        return (
          name.includes(q) || desc.includes(q) || addr.includes(q)
        );
      });
    }

    // Sorting
    restaurants.sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortBy === "price_low") {
        return (
          (PRICE_ORDER[a.priceRange] || 0) -
          (PRICE_ORDER[b.priceRange] || 0)
        );
      }

      if (sortBy === "price_high") {
        return (
          (PRICE_ORDER[b.priceRange] || 0) -
          (PRICE_ORDER[a.priceRange] || 0)
        );
      }

      if (sortBy === "rating") {
        const ra = Number(a.averageRating) || 0;
        const rb = Number(b.averageRating) || 0;
        return rb - ra;
      }

      if (sortBy === "popular") {
        const la = Number(a.totalLikes) || 0;
        const lb = Number(b.totalLikes) || 0;
        if (lb !== la) return lb - la;

        const ta = Number(a.totalReviews) || 0;
        const tb = Number(b.totalReviews) || 0;
        return tb - ta;
      }

      // default: rating desc, then totalReviews desc
      const ra = Number(a.averageRating) || 0;
      const rb = Number(b.averageRating) || 0;
      if (rb !== ra) return rb - ra;

      const ta = Number(a.totalReviews) || 0;
      const tb = Number(b.totalReviews) || 0;
      return tb - ta;
    });

    const total = restaurants.length;
    const paged = restaurants
      .slice(offsetNum, offsetNum + limitNum)
      .map((r) => r.toSafeObject());

    res.json({
      success: true,
      data: paged,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + paged.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch restaurants",
      message: error.message,
    });
  }
});

// GET single restaurant by ID
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    res.json({
      success: true,
      data: restaurant.toSafeObject(),
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch restaurant",
      message: error.message,
    });
  }
});

// GET filter options (for UI dropdowns)
router.get("/meta/filters", async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    const active = restaurants.filter((r) => r.isActive !== false);

    const cuisineTypes = new Set();
    const atmospheres = new Set();

    active.forEach((r) => {
      (Array.isArray(r.cuisineType) ? r.cuisineType : []).forEach((c) =>
        cuisineTypes.add(c)
      );
      (Array.isArray(r.atmosphere) ? r.atmosphere : []).forEach((a) =>
        atmospheres.add(a)
      );
    });

    res.json({
      success: true,
      data: {
        priceRanges: ["$", "$$", "$$$", "$$$$"],
        cuisineTypes: Array.from(cuisineTypes).sort(),
        atmospheres: Array.from(atmospheres).sort(),
        features: [
          "isStudyFriendly",
          "hasWifi",
          "hasOutdoorSeating",
          "hasParking",
          "isVegetarianFriendly",
          "isVeganFriendly",
          "isGlutenFreeFriendly",
        ],
      },
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch filter options",
      message: error.message,
    });
  }
});

module.exports = router;
