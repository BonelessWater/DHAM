// backend/models/Review.js
const db = require("../config/database");
const { randomUUID } = require("crypto");

// keep this so the rest of your code doesn't have to change
const uuidv4 = () => randomUUID();

const Restaurant = require("./Restaurant");

class Review {
  static ref() {
    return db.ref("reviews");
  }

  // Helper: attach instance-like helpers
  static _attachMethods(review) {
    if (!review) return null;

    review.toSafeObject = function () {
      return { ...review };
    };

    return review;
  }

  /**
   * Create a review
   */
  static async create(data) {
    if (!data.userId) throw new Error("userId is required");
    if (!data.restaurantId) throw new Error("restaurantId is required");
    if (!data.rating) throw new Error("rating is required");

    const id = uuidv4();
    const now = new Date().toISOString();

    const review = {
      id,
      userId: data.userId,
      restaurantId: data.restaurantId,
      rating: Number(data.rating),

      title: data.title || null,
      content: data.content || "",

      foodQuality:
        data.foodQuality !== undefined ? Number(data.foodQuality) : null,
      serviceQuality:
        data.serviceQuality !== undefined ? Number(data.serviceQuality) : null,
      atmosphereRating:
        data.atmosphereRating !== undefined
          ? Number(data.atmosphereRating)
          : null,
      valueRating:
        data.valueRating !== undefined ? Number(data.valueRating) : null,

      visitDate: data.visitDate || null,

      images: Array.isArray(data.images) ? data.images : [],
      dishesOrdered: Array.isArray(data.dishesOrdered)
        ? data.dishesOrdered
        : [],

      helpfulCount: Number(data.helpfulCount) || 0,

      isVerified: !!data.isVerified,
      isFlagged: !!data.isFlagged,

      createdAt: now,
      updatedAt: now,
    };

    await this.ref().child(id).set(review);

    // Update parent restaurant metadata atomically
    await Restaurant.incrementCounters(data.restaurantId, {
      totalReviews: 1,
    });

    // Recalculate restaurant average rating efficiently
    await this._recalculateRestaurantRating(data.restaurantId);

    return this._attachMethods(review);
  }

  /**
   * Fetch all reviews for a specific restaurant
   */
  static async findByRestaurantId(restaurantId) {
    const snapshot = await this.ref()
      .orderByChild("restaurantId")
      .equalTo(restaurantId)
      .once("value");

    const data = snapshot.val() || {};
    return Object.values(data).map((r) => this._attachMethods(r));
  }

  /**
   * Fetch all reviews user wrote
   */
  static async findByUserId(userId) {
    const snapshot = await this.ref()
      .orderByChild("userId")
      .equalTo(userId)
      .once("value");

    const data = snapshot.val() || {};
    return Object.values(data).map((r) => this._attachMethods(r));
  }

  /**
   * Find a review by ID
   */
  static async findById(id) {
    const snap = await this.ref().child(id).once("value");
    if (!snap.exists()) return null;
    return this._attachMethods(snap.val());
  }

  /**
   * Update review
   */
  static async update(id, updates) {
    const snap = await this.ref().child(id).once("value");
    if (!snap.exists()) return null;

    const existing = snap.val();
    const restaurantId = existing.restaurantId;
    const merged = { ...existing };

    [
      "rating",
      "foodQuality",
      "serviceQuality",
      "atmosphereRating",
      "valueRating",
    ].forEach((n) => {
      if (updates[n] !== undefined) merged[n] = Number(updates[n]);
    });

    [
      "title",
      "content",
      "visitDate",
      "isFlagged",
      "isVerified",
    ].forEach((f) => {
      if (updates[f] !== undefined) merged[f] = updates[f];
    });

    if (updates.images !== undefined) {
      merged.images = Array.isArray(updates.images)
        ? updates.images
        : merged.images;
    }
    if (updates.dishesOrdered !== undefined) {
      merged.dishesOrdered = Array.isArray(updates.dishesOrdered)
        ? updates.dishesOrdered
        : merged.dishesOrdered;
    }

    merged.updatedAt = new Date().toISOString();

    await this.ref().child(id).set(merged);
    await this._recalculateRestaurantRating(restaurantId);

    return this._attachMethods(merged);
  }

  /**
   * Delete review
   */
  static async delete(id) {
    const snap = await this.ref().child(id).once("value");
    if (!snap.exists()) return false;

    const review = snap.val();
    const restaurantId = review.restaurantId;

    await this.ref().child(id).remove();

    // Update restaurant counters
    await Restaurant.incrementCounters(restaurantId, {
      totalReviews: -1,
    });

    await this._recalculateRestaurantRating(restaurantId);

    return true;
  }

  /**
   * Atomic increment of helpfulCount
   */
  static async incrementHelpfulCount(id, delta = 1) {
    await this.ref()
      .child(id)
      .transaction((r) => {
        if (!r) return r;
        r.helpfulCount = (r.helpfulCount || 0) + delta;
        r.updatedAt = new Date().toISOString();
        return r;
      });
  }

  /**
   * Recalculate average rating for a restaurant
   */
  static async _recalculateRestaurantRating(restaurantId) {
    const reviews = await this.findByRestaurantId(restaurantId);
    if (reviews.length === 0) {
      await Restaurant.update(restaurantId, {
        averageRating: 0,
        totalReviews: 0,
      });
      return;
    }

    const avg =
      reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
      reviews.length;

    await Restaurant.update(restaurantId, {
      averageRating: Number(avg.toFixed(2)),
    });
  }
}

module.exports = Review;
