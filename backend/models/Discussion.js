// backend/models/Discussion.js
const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

// Allowed categories from your ENUM
const ALLOWED_CATEGORIES = [
  "question",
  "tip",
  "experience",
  "recommendation",
  "meetup",
  "other",
];

class Discussion {
  // Base reference for discussions in RTDB
  static ref() {
    return db.ref("discussions");
  }

  /**
   * Create a new discussion
   * data is expected to contain:
   *  - userId (string, required)
   *  - restaurantId (string, required)
   *  - title (string, required)
   *  - content (string, required)
   *  - category? (string, one of ALLOWED_CATEGORIES)
   *  - images? (array of strings)
   *  - tags? (array of strings)
   */
  static async create(data) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const category = ALLOWED_CATEGORIES.includes(data.category)
      ? data.category
      : "experience";

    const discussion = {
      id,
      userId: data.userId,
      restaurantId: data.restaurantId,
      title: data.title,
      content: data.content,
      category,
      images: Array.isArray(data.images) ? data.images : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      // Engagement metrics
      viewCount:
        typeof data.viewCount === "number" ? data.viewCount : 0,
      likeCount:
        typeof data.likeCount === "number" ? data.likeCount : 0,
      replyCount:
        typeof data.replyCount === "number" ? data.replyCount : 0,
      // Moderation
      isPinned: !!data.isPinned,
      isFlagged: !!data.isFlagged,
      isLocked: !!data.isLocked,
      // Timestamps (Sequelize timestamps: true)
      createdAt: now,
      updatedAt: now,
    };

    await this.ref().child(id).set(discussion);
    return discussion;
  }

  /**
   * Find a discussion by id
   */
  static async findById(id) {
    const snapshot = await this.ref().child(id).once("value");
    if (!snapshot.exists()) return null;
    return snapshot.val();
  }

  /**
   * Get all discussions
   * (You could later add pagination/filtering here if needed)
   */
  static async findAll() {
    const snapshot = await this.ref().once("value");
    const data = snapshot.val() || {};
    return Object.values(data);
  }

  /**
   * Find all discussions for a given restaurantId
   */
  static async findByRestaurantId(restaurantId) {
    const snapshot = await this.ref()
      .orderByChild("restaurantId")
      .equalTo(restaurantId)
      .once("value");

    const data = snapshot.val() || {};
    return Object.values(data);
  }

  /**
   * Find all discussions for a given userId
   */
  static async findByUserId(userId) {
    const snapshot = await this.ref()
      .orderByChild("userId")
      .equalTo(userId)
      .once("value");

    const data = snapshot.val() || {};
    return Object.values(data);
  }

  /**
   * Update a discussion by id
   * updates is a partial object of fields to change
   */
  static async update(id, updates) {
    const existingSnap = await this.ref().child(id).once("value");
    if (!existingSnap.exists()) return null;

    const existing = existingSnap.val();

    // Handle category validation if category is being updated
    if (updates.category) {
      updates.category = ALLOWED_CATEGORIES.includes(updates.category)
        ? updates.category
        : existing.category || "experience";
    }

    const merged = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.ref().child(id).set(merged);
    return merged;
  }

  /**
   * Delete a discussion by id
   */
  static async delete(id) {
    await this.ref().child(id).remove();
    return true;
  }

  /**
   * Increment counters atomically (e.g. viewCount, likeCount, replyCount)
   * counters: { viewCount?: number, likeCount?: number, replyCount?: number }
   */
  static async incrementCounters(id, counters = {}) {
    const ref = this.ref().child(id);

    await ref.transaction((discussion) => {
      if (discussion === null) return discussion;

      if (typeof counters.viewCount === "number") {
        discussion.viewCount =
          (discussion.viewCount || 0) + counters.viewCount;
      }
      if (typeof counters.likeCount === "number") {
        discussion.likeCount =
          (discussion.likeCount || 0) + counters.likeCount;
      }
      if (typeof counters.replyCount === "number") {
        discussion.replyCount =
          (discussion.replyCount || 0) + counters.replyCount;
      }

      // Update timestamp when counters change
      discussion.updatedAt = new Date().toISOString();
      return discussion;
    });
  }
}

module.exports = Discussion;
