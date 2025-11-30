const express = require("express");
const router = express.Router();

const UserMatch = require("../models/UserMatch");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");

// Helper function to calculate match score
const calculateMatchScore = (user1, user2) => {
  let score = 0;

  // Compare interests (30% weight)
  const interests1 = user1.interests || [];
  const interests2 = user2.interests || [];
  const sharedInterests = interests1.filter((i) =>
    interests2.includes(i)
  );
  if (interests1.length > 0 || interests2.length > 0) {
    const interestScore =
      (sharedInterests.length /
        Math.max(interests1.length, interests2.length)) *
      30;
    score += interestScore;
  }

  // Compare cuisine preferences (25% weight)
  const cuisine1 = user1.cuisinePreferences || [];
  const cuisine2 = user2.cuisinePreferences || [];
  const sharedCuisines = cuisine1.filter((c) =>
    cuisine2.includes(c)
  );
  if (cuisine1.length > 0 || cuisine2.length > 0) {
    const cuisineScore =
      (sharedCuisines.length /
        Math.max(cuisine1.length, cuisine2.length)) *
      25;
    score += cuisineScore;
  }

  // Compare atmosphere preferences (20% weight)
  const atmosphere1 = user1.atmospherePreferences || [];
  const atmosphere2 = user2.atmospherePreferences || [];
  const sharedAtmospheres = atmosphere1.filter((a) =>
    atmosphere2.includes(a)
  );
  if (atmosphere1.length > 0 || atmosphere2.length > 0) {
    const atmosphereScore =
      (sharedAtmospheres.length /
        Math.max(atmosphere1.length, atmosphere2.length)) *
      20;
    score += atmosphereScore;
  }

  // Compare food preferences (15% weight)
  const food1 = user1.foodPreferences || [];
  const food2 = user2.foodPreferences || [];
  const sharedFood = food1.filter((f) => food2.includes(f));
  if (food1.length > 0 || food2.length > 0) {
    const foodScore =
      (sharedFood.length /
        Math.max(food1.length, food2.length)) *
      15;
    score += foodScore;
  }

  // Compare price range (10% weight)
  if (user1.priceRange && user1.priceRange === user2.priceRange) {
    score += 10;
  }

  return {
    score: Math.round(score),
    sharedInterests,
    sharedCuisines,
    sharedAtmospheres,
  };
};

// GET potential matches for a user
router.get("/user/:userId/potential", async (req, res) => {
  try {
    const { minScore = 40, limit = 20 } = req.query;
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const userObj = user.toSafeObject ? user.toSafeObject() : user;

    if (!userObj.openToMatching) {
      return res.json({
        success: true,
        data: [],
        message: "User is not open to matching",
      });
    }

    // Find all users who are open to matching (excluding current user)
    const allUsers = await User.findAll();
    const potentialMatches = allUsers.filter((u) => {
      const uObj = u.toSafeObject ? u.toSafeObject() : u;
      return (
        uObj.id !== userId &&
        uObj.openToMatching &&
        uObj.isActive !== false
      );
    });

    // Calculate match scores
    const matches = potentialMatches.map((otherUser) => {
      const otherObj = otherUser.toSafeObject
        ? otherUser.toSafeObject()
        : otherUser;
      const matchData = calculateMatchScore(userObj, otherObj);
      return {
        user: otherObj,
        matchScore: matchData.score,
        sharedInterests: matchData.sharedInterests,
        sharedCuisinePreferences: matchData.sharedCuisines,
        sharedAtmospherePreferences: matchData.sharedAtmospheres,
      };
    });

    const minScoreInt = parseInt(minScore, 10) || 0;
    const limitInt = parseInt(limit, 10) || 20;

    // Filter by minimum score and sort
    const filteredMatches = matches
      .filter((m) => m.matchScore >= minScoreInt)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limitInt);

    res.json({
      success: true,
      data: filteredMatches,
    });
  } catch (error) {
    console.error("Error finding potential matches:", error);
    res.status(500).json({
      success: false,
      error: "Failed to find potential matches",
      message: error.message,
    });
  }
});

// POST - Create a match request
router.post("/", async (req, res) => {
  try {
    const { user1Id, user2Id, suggestedRestaurantId, meetupNotes } =
      req.body;

    if (!user1Id || !user2Id) {
      return res.status(400).json({
        success: false,
        error: "user1Id and user2Id are required",
      });
    }

    if (user1Id === user2Id) {
      return res.status(400).json({
        success: false,
        error: "Cannot create a match with yourself",
      });
    }

    // Check if match already exists in either direction
    const existing1 = await UserMatch.findBetweenUsers(
      user1Id,
      user2Id
    );
    const existing2 = await UserMatch.findBetweenUsers(
      user2Id,
      user1Id
    );
    if (existing1 || existing2) {
      return res.status(400).json({
        success: false,
        error: "Match already exists between these users",
      });
    }

    // Get users and calculate match score
    const user1 = await User.findById(user1Id);
    const user2 = await User.findById(user2Id);

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        error: "One or both users not found",
      });
    }

    const user1Obj = user1.toSafeObject ? user1.toSafeObject() : user1;
    const user2Obj = user2.toSafeObject ? user2.toSafeObject() : user2;

    const matchData = calculateMatchScore(user1Obj, user2Obj);

    const match = await UserMatch.create({
      user1Id,
      user2Id,
      matchScore: matchData.score,
      sharedInterests: matchData.sharedInterests,
      sharedCuisinePreferences: matchData.sharedCuisines,
      sharedAtmospherePreferences: matchData.sharedAtmospheres,
      suggestedRestaurantId: suggestedRestaurantId || null,
      meetupNotes: meetupNotes || null,
      status: "pending",
      user2Status: "pending",
    });

    // Attach full related data like the old include
    let suggestedRestaurant = null;
    if (suggestedRestaurantId) {
      const rest = await Restaurant.findById(suggestedRestaurantId);
      suggestedRestaurant = rest
        ? rest.toSafeObject
          ? rest.toSafeObject()
          : rest
        : null;
    }

    res.status(201).json({
      success: true,
      data: {
        ...match.toSafeObject(),
        user1: user1Obj,
        user2: user2Obj,
        suggestedRestaurant,
      },
    });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create match",
      message: error.message,
    });
  }
});

// GET matches for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { status, isConnected } = req.query;
    const userId = req.params.userId;

    // All matches where user is either user1 or user2
    let matches = await UserMatch.findByUserId(userId);

    // Filter by isConnected if requested
    if (isConnected === "true") {
      matches = matches.filter((m) => m.isConnected === true);
    }

    // Filter by status from the perspective of this user
    if (status) {
      matches = matches.filter((m) => {
        if (m.user1Id === userId) {
          return m.status === status;
        }
        if (m.user2Id === userId) {
          return m.user2Status === status;
        }
        return false;
      });
    }

    // Sort by matchScore DESC, createdAt DESC
    matches.sort((a, b) => {
      const sa = Number(a.matchScore) || 0;
      const sb = Number(b.matchScore) || 0;
      if (sb !== sa) return sb - sa;

      const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return db - da;
    });

    // Attach user + restaurant info like original includes
    const result = [];
    for (const m of matches) {
      const [user1, user2, rest] = await Promise.all([
        User.findById(m.user1Id),
        User.findById(m.user2Id),
        m.suggestedRestaurantId
          ? Restaurant.findById(m.suggestedRestaurantId)
          : Promise.resolve(null),
      ]);

      result.push({
        ...m.toSafeObject(),
        user1: user1
          ? user1.toSafeObject
            ? user1.toSafeObject()
            : user1
          : null,
        user2: user2
          ? user2.toSafeObject
            ? user2.toSafeObject()
            : user2
          : null,
        suggestedRestaurant: rest
          ? rest.toSafeObject
            ? rest.toSafeObject()
            : rest
          : null,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch matches",
      message: error.message,
    });
  }
});

// PUT - Update match status
router.put("/:id/status", async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        error: "userId and status are required",
      });
    }

    const match = await UserMatch.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: "Match not found",
      });
    }

    let updates = {};

    if (match.user1Id === userId) {
      updates.status = status;
    } else if (match.user2Id === userId) {
      updates.user2Status = status;
    } else {
      return res.status(403).json({
        success: false,
        error: "User is not part of this match",
      });
    }

    const updated = await UserMatch.update(match.id, updates);

    res.json({
      success: true,
      data: updated.toSafeObject(),
    });
  } catch (error) {
    console.error("Error updating match status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update match status",
      message: error.message,
    });
  }
});

// PUT - Update meetup details
router.put("/:id/meetup", async (req, res) => {
  try {
    const { suggestedRestaurantId, meetupDate, meetupNotes } = req.body;

    const match = await UserMatch.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: "Match not found",
      });
    }

    const updated = await UserMatch.update(match.id, {
      suggestedRestaurantId: suggestedRestaurantId || null,
      meetupDate: meetupDate || null,
      meetupNotes: meetupNotes || null,
    });

    let suggestedRestaurant = null;
    if (updated.suggestedRestaurantId) {
      const rest = await Restaurant.findById(
        updated.suggestedRestaurantId
      );
      suggestedRestaurant = rest
        ? rest.toSafeObject
          ? rest.toSafeObject()
          : rest
        : null;
    }

    res.json({
      success: true,
      data: {
        ...updated.toSafeObject(),
        suggestedRestaurant,
      },
    });
  } catch (error) {
    console.error("Error updating meetup details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update meetup details",
      message: error.message,
    });
  }
});

module.exports = router;
