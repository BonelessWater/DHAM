const express = require('express');
const router = express.Router();
const { UserMatch, User, Restaurant } = require('../models');
const { Op } = require('sequelize');

// Helper function to calculate match score
const calculateMatchScore = (user1, user2) => {
  let score = 0;
  let maxScore = 0;

  // Compare interests (30% weight)
  const interests1 = user1.interests || [];
  const interests2 = user2.interests || [];
  const sharedInterests = interests1.filter(i => interests2.includes(i));
  if (interests1.length > 0 || interests2.length > 0) {
    const interestScore = (sharedInterests.length / Math.max(interests1.length, interests2.length)) * 30;
    score += interestScore;
  }
  maxScore += 30;

  // Compare cuisine preferences (25% weight)
  const cuisine1 = user1.cuisinePreferences || [];
  const cuisine2 = user2.cuisinePreferences || [];
  const sharedCuisines = cuisine1.filter(c => cuisine2.includes(c));
  if (cuisine1.length > 0 || cuisine2.length > 0) {
    const cuisineScore = (sharedCuisines.length / Math.max(cuisine1.length, cuisine2.length)) * 25;
    score += cuisineScore;
  }
  maxScore += 25;

  // Compare atmosphere preferences (20% weight)
  const atmosphere1 = user1.atmospherePreferences || [];
  const atmosphere2 = user2.atmospherePreferences || [];
  const sharedAtmospheres = atmosphere1.filter(a => atmosphere2.includes(a));
  if (atmosphere1.length > 0 || atmosphere2.length > 0) {
    const atmosphereScore = (sharedAtmospheres.length / Math.max(atmosphere1.length, atmosphere2.length)) * 20;
    score += atmosphereScore;
  }
  maxScore += 20;

  // Compare food preferences (15% weight)
  const food1 = user1.foodPreferences || [];
  const food2 = user2.foodPreferences || [];
  const sharedFood = food1.filter(f => food2.includes(f));
  if (food1.length > 0 || food2.length > 0) {
    const foodScore = (sharedFood.length / Math.max(food1.length, food2.length)) * 15;
    score += foodScore;
  }
  maxScore += 15;

  // Compare price range (10% weight)
  if (user1.priceRange === user2.priceRange) {
    score += 10;
  }
  maxScore += 10;

  return {
    score: Math.round(score),
    sharedInterests,
    sharedCuisines,
    sharedAtmospheres
  };
};

// GET potential matches for a user
router.get('/user/:userId/potential', async (req, res) => {
  try {
    const { minScore = 40, limit = 20 } = req.query;
    const userId = req.params.userId;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.openToMatching) {
      return res.json({
        success: true,
        data: [],
        message: 'User is not open to matching'
      });
    }

    // Find all users who are open to matching (excluding current user)
    const potentialMatches = await User.findAll({
      where: {
        id: { [Op.ne]: userId },
        openToMatching: true,
        isActive: true
      }
    });

    // Calculate match scores
    const matches = potentialMatches.map(otherUser => {
      const matchData = calculateMatchScore(user, otherUser);
      return {
        user: otherUser.toSafeObject(),
        matchScore: matchData.score,
        sharedInterests: matchData.sharedInterests,
        sharedCuisinePreferences: matchData.sharedCuisines,
        sharedAtmospherePreferences: matchData.sharedAtmospheres
      };
    });

    // Filter by minimum score and sort
    const filteredMatches = matches
      .filter(m => m.matchScore >= parseInt(minScore))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: filteredMatches
    });

  } catch (error) {
    console.error('Error finding potential matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find potential matches',
      message: error.message
    });
  }
});

// POST - Create a match request
router.post('/', async (req, res) => {
  try {
    const {
      user1Id,
      user2Id,
      suggestedRestaurantId,
      meetupNotes
    } = req.body;

    if (!user1Id || !user2Id) {
      return res.status(400).json({
        success: false,
        error: 'user1Id and user2Id are required'
      });
    }

    // Check if match already exists
    const existingMatch = await UserMatch.findOne({
      where: {
        [Op.or]: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id }
        ]
      }
    });

    if (existingMatch) {
      return res.status(400).json({
        success: false,
        error: 'Match already exists between these users'
      });
    }

    // Get users and calculate match score
    const user1 = await User.findByPk(user1Id);
    const user2 = await User.findByPk(user2Id);

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        error: 'One or both users not found'
      });
    }

    const matchData = calculateMatchScore(user1, user2);

    const match = await UserMatch.create({
      user1Id,
      user2Id,
      matchScore: matchData.score,
      sharedInterests: matchData.sharedInterests,
      sharedCuisinePreferences: matchData.sharedCuisines,
      sharedAtmospherePreferences: matchData.sharedAtmospheres,
      suggestedRestaurantId,
      meetupNotes,
      status: 'pending',
      user2Status: 'pending'
    });

    // Fetch with full data
    const createdMatch = await UserMatch.findByPk(match.id, {
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'bio']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'bio']
        },
        {
          model: Restaurant,
          as: 'suggestedRestaurant',
          attributes: ['id', 'name', 'address', 'imageUrl', 'priceRange']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdMatch
    });

  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create match',
      message: error.message
    });
  }
});

// GET matches for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { status, isConnected } = req.query;
    const userId = req.params.userId;

    const where = {
      [Op.or]: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    };

    if (isConnected === 'true') {
      where.isConnected = true;
    }

    if (status) {
      // Need to check both user1 and user2 status
      where[Op.or].forEach(condition => {
        if (condition.user1Id) {
          condition.status = status;
        } else {
          condition.user2Status = status;
        }
      });
    }

    const matches = await UserMatch.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'bio', 'interests']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture', 'bio', 'interests']
        },
        {
          model: Restaurant,
          as: 'suggestedRestaurant',
          attributes: ['id', 'name', 'address', 'imageUrl', 'priceRange', 'cuisineType']
        }
      ],
      order: [['matchScore', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: matches
    });

  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches',
      message: error.message
    });
  }
});

// PUT - Update match status
router.put('/:id/status', async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        error: 'userId and status are required'
      });
    }

    const match = await UserMatch.findByPk(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    // Update the appropriate status field
    if (match.user1Id === userId) {
      await match.update({ status });
    } else if (match.user2Id === userId) {
      await match.update({ user2Status: status });
    } else {
      return res.status(403).json({
        success: false,
        error: 'User is not part of this match'
      });
    }

    // Check if both users accepted
    if (match.status === 'accepted' && match.user2Status === 'accepted') {
      await match.update({ isConnected: true });
    }

    res.json({
      success: true,
      data: match
    });

  } catch (error) {
    console.error('Error updating match status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update match status',
      message: error.message
    });
  }
});

// PUT - Update meetup details
router.put('/:id/meetup', async (req, res) => {
  try {
    const { suggestedRestaurantId, meetupDate, meetupNotes } = req.body;

    const match = await UserMatch.findByPk(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    await match.update({
      suggestedRestaurantId,
      meetupDate,
      meetupNotes
    });

    const updatedMatch = await UserMatch.findByPk(match.id, {
      include: [
        {
          model: Restaurant,
          as: 'suggestedRestaurant'
        }
      ]
    });

    res.json({
      success: true,
      data: updatedMatch
    });

  } catch (error) {
    console.error('Error updating meetup details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update meetup details',
      message: error.message
    });
  }
});

module.exports = router;
