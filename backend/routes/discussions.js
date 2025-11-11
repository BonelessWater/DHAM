const express = require('express');
const router = express.Router();
const { Discussion, DiscussionReply, Restaurant, User } = require('../models');
const { Op } = require('sequelize');

// GET discussions for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { category, sortBy, limit = 20, offset = 0 } = req.query;

    const where = { restaurantId: req.params.restaurantId };

    // Filter by category if specified
    if (category && category !== 'all') {
      where.category = category;
    }

    // Determine sorting
    let order = [['isPinned', 'DESC'], ['createdAt', 'DESC']];
    if (sortBy === 'popular') {
      order = [['isPinned', 'DESC'], ['likeCount', 'DESC'], ['replyCount', 'DESC']];
    } else if (sortBy === 'active') {
      order = [['isPinned', 'DESC'], ['replyCount', 'DESC'], ['createdAt', 'DESC']];
    }

    const discussions = await Discussion.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: DiscussionReply,
          as: 'replies',
          limit: 3,
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
            }
          ]
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Discussion.count({ where });

    res.json({
      success: true,
      data: discussions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + discussions.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch discussions',
      message: error.message
    });
  }
});

// GET single discussion by ID
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'imageUrl']
        },
        {
          model: DiscussionReply,
          as: 'replies',
          where: { parentReplyId: null },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
            },
            {
              model: DiscussionReply,
              as: 'childReplies',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture']
                }
              ]
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    // Increment view count
    await discussion.update({
      viewCount: discussion.viewCount + 1
    });

    res.json({
      success: true,
      data: discussion
    });

  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch discussion',
      message: error.message
    });
  }
});

// POST - Create a discussion
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      restaurantId,
      title,
      content,
      category,
      tags
    } = req.body;

    // Validation
    if (!userId || !restaurantId || !title || !content) {
      return res.status(400).json({
        success: false,
        error: 'userId, restaurantId, title, and content are required'
      });
    }

    const discussion = await Discussion.create({
      userId,
      restaurantId,
      title,
      content,
      category: category || 'experience',
      tags: tags || []
    });

    // Fetch the created discussion with user data
    const createdDiscussion = await Discussion.findByPk(discussion.id, {
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
      data: createdDiscussion
    });

  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create discussion',
      message: error.message
    });
  }
});

// PUT - Update a discussion
router.put('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    const { title, content, category, tags } = req.body;

    await discussion.update({
      title,
      content,
      category,
      tags
    });

    res.json({
      success: true,
      data: discussion
    });

  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update discussion',
      message: error.message
    });
  }
});

// DELETE - Delete a discussion
router.delete('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    await discussion.destroy();

    res.json({
      success: true,
      message: 'Discussion deleted'
    });

  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete discussion',
      message: error.message
    });
  }
});

// POST - Like a discussion
router.post('/:id/like', async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    await discussion.update({
      likeCount: discussion.likeCount + 1
    });

    res.json({
      success: true,
      data: discussion
    });

  } catch (error) {
    console.error('Error liking discussion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like discussion',
      message: error.message
    });
  }
});

// POST - Reply to a discussion
router.post('/:id/replies', async (req, res) => {
  try {
    const { userId, content, parentReplyId } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        error: 'userId and content are required'
      });
    }

    const reply = await DiscussionReply.create({
      discussionId: req.params.id,
      userId,
      content,
      parentReplyId
    });

    // Update reply count
    const discussion = await Discussion.findByPk(req.params.id);
    if (discussion) {
      await discussion.update({
        replyCount: discussion.replyCount + 1
      });
    }

    // Fetch the created reply with user data
    const createdReply = await DiscussionReply.findByPk(reply.id, {
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
      data: createdReply
    });

  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create reply',
      message: error.message
    });
  }
});

module.exports = router;
