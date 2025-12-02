const db = require("../config/database");
const { randomUUID } = require("crypto");

const uuidv4 = () => randomUUID();


class Favorite {
  static ref() {
    return db.ref("favorites");
  }

  static _attachMethods(fav) {
    if (!fav) return null;
    fav.toSafeObject = function () {
      return { ...fav };
    };
    return fav;
  }

  // Create a new favorite restaurant 
  static async create({ userId, restaurantId, notes }) {
    if (!userId || !restaurantId) {
      throw new Error("userId and restaurantId are required");
    }

    // Prevent duplicates: user can only favorite a restaurant once
    const existing = await this.findByUserAndRestaurant(userId, restaurantId);
    if (existing) {
      throw new Error("Restaurant already in favorites");
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const favorite = {
      id,
      userId,
      restaurantId,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    };

    await this.ref().child(id).set(favorite);
    return this._attachMethods(favorite);
  }

  // Get all favorites for a user
  static async findByUserId(userId) {
    const snapshot = await this.ref()
      .orderByChild("userId")
      .equalTo(userId)
      .once("value");

    const data = snapshot.val() || {};
    return Object.values(data).map((f) => this._attachMethods(f));
  }

  // Get all favorites for a restaurant
  static async findByRestaurantId(restaurantId) {
    const snapshot = await this.ref()
      .orderByChild("restaurantId")
      .equalTo(restaurantId)
      .once("value");

    const data = snapshot.val() || {};
    return Object.values(data).map((f) => this._attachMethods(f));
  }

  // Find favorite by userId and restaurantId
  static async findByUserAndRestaurant(userId, restaurantId) {
    const favs = await this.findByUserId(userId);
    return favs.find((f) => f.restaurantId === restaurantId) || null;
  }

  static async findById(id) {
    const snap = await this.ref().child(id).once("value");
    if (!snap.exists()) return null;
    return this._attachMethods(snap.val());
  }

  static async delete(id) {
    await this.ref().child(id).remove();
    return true;
  }

  static async update(id, updates) {
    const existingSnap = await this.ref().child(id).once("value");
    if (!existingSnap.exists()) return null;

    const existing = existingSnap.val();
    const merged = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.ref().child(id).set(merged);
    return this._attachMethods(merged);
  }
}

module.exports = Favorite;
