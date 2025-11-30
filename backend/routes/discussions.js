const express = require("express");
const router = express.Router();

const Discussion = require("../models/Discussion");
const DiscussionReply = require("../models/DiscussionReply");

// Helper: sorting functions
function sortDiscussions(discussions, sortBy) {
  const toDate = (d) => (d ? new Date(d) : new Date(0));

  return discussions.sort((a, b) => {
    // Pinned first, always
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === "popular") {
      // likeCount desc, then replyCount desc
      if ((b.likeCount || 0) !== (a.likeCount || 0)) {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      if ((b.replyCount || 0) !== (a.replyCount || 0)) {
        return (b.replyCount || 0) - (a.replyCount || 0);
      }
      // fallback to createdAt desc
      return toDate(b.createdAt) - toDate(a.createdAt);
    }

    if (sortBy === "active") {
      // replyCount desc, then createdAt desc
      if ((b.replyCount || 0) !== (a.replyCount || 0)) {
        return (b.replyCount || 0) - (a.replyCount || 0);
      }
      return toDate(b.createdAt) - toDate(a.createdAt);
    }

    // default: createdAt desc
    return toDate(b.createdAt) - toDate(a.createdAt);
  });
}

// GET discussions for a restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const { category, sortBy, limit = 20, offset = 0 } = req.query;
    const restaurantId = req.params.restaurantId;

    // Get all discussions for this restaurant from RTDB
    let discussions = await Discussion.findByRestaurantId(restaurantId);

    // Filter by category if specified (and not "all")
    if (category && category !== "all") {
      discussions = discussions.filter((d) => d.category === category);
    }

    // Sort in memory
    const sorted = sortDiscussions(discussions, sortBy);

    const limitNum = parseInt(limit, 10) || 20;
    const offsetNum = parseInt(offset, 10) || 0;

    const paged = sorted.slice(offsetNum, offsetNum + limitNum);
    const total = sorted.length;

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
    console.error("Error fetching discussions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch discussions",
      message: error.message,
    });
  }
});

// GET single discussion by ID
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: "Discussion not found",
      });
    }

    // Increment view count atomically in RTDB
    await Discussion.incrementCounters(id, { viewCount: 1 });

    // Re-fetch updated discussion (or manually bump viewCount)
    const updated = await Discussion.findById(id);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error fetching discussion:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch discussion",
      message: error.message,
    });
  }
});

// POST - Create a discussion
router.post("/", async (req, res) => {
  try {
    const { userId, restaurantId, title, content, category, tags, images } =
      req.body;

    // Validation
    if (!userId || !restaurantId || !title || !content) {
      return res.status(400).json({
        success: false,
        error: "userId, restaurantId, title, and content are required",
      });
    }

    const discussion = await Discussion.create({
      userId,
      restaurantId,
      title,
      content,
      category: category || "experience",
      tags: tags || [],
      images: images || [],
    });

    // If you eventually want user info attached, you can fetch User here
    // and merge it in, but for now we just return the discussion object.
    res.status(201).json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    console.error("Error creating discussion:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create discussion",
      message: error.message,
    });
  }
});

// PUT - Update a discussion
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Discussion.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Discussion not found",
      });
    }

    const { title, content, category, tags, images } = req.body;

    const updated = await Discussion.update(id, {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags }),
      ...(images !== undefined && { images }),
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating discussion:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update discussion",
      message: error.message,
    });
  }
});

// DELETE - Delete a discussion
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Discussion.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Discussion not found",
      });
    }

    await Discussion.delete(id);

    res.json({
      success: true,
      message: "Discussion deleted",
    });
  } catch (error) {
    console.error("Error deleting discussion:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete discussion",
      message: error.message,
    });
  }
});

// POST - Like a discussion
router.post("/:id/like", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Discussion.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Discussion not found",
      });
    }

    // Increment likeCount atomically
    await Discussion.incrementCounters(id, { likeCount: 1 });
    const updated = await Discussion.findById(id);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error liking discussion:", error);
    res.status(500).json({
      success: false,
      error: "Failed to like discussion",
      message: error.message,
    });
  }
});

// POST - Reply to a discussion
// NOTE: This still uses Sequelize DiscussionReply + User.
//       Once you move replies to Firebase too, you'll refactor this.
router.post("/:id/replies", async (req, res) => {
  try {
    const { userId, content, parentReplyId } = req.body;
    const discussionId = req.params.id;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        error: "userId and content are required",
      });
    }

    // Ensure discussion exists in Firebase
    const existing = await Discussion.findById(discussionId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Discussion not found",
      });
    }

    // Create reply in the existing SQL table for now
    const reply = await DiscussionReply.create({
      discussionId,
      userId,
      content,
      parentReplyId,
    });

    // Increment replyCount in Firebase
    await Discussion.incrementCounters(discussionId, { replyCount: 1 });

    // Fetch the created reply with user data (still Sequelize)
    const createdReply = await DiscussionReply.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "username",
            "firstName",
            "lastName",
            "profilePicture",
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: createdReply,
    });
  } catch (error) {
    console.error("Error creating reply:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create reply",
      message: error.message,
    });
  }
});

module.exports = router;
