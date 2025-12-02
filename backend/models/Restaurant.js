const db = require("../config/database");
const { randomUUID } = require("crypto");
const uuidv4 = () => randomUUID();


const ALLOWED_PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];

class Restaurant {
  static ref() {
    return db.ref("restaurants");
  }

  static _attachMethods(rest) {
    if (!rest) return null;

    // Safe object without methods
    rest.toSafeObject = function () {
      return { ...rest };
    };

    return rest;
  }

  // Create a restaurant
  static async create(data) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const priceRange = ALLOWED_PRICE_RANGES.includes(data.priceRange)
      ? data.priceRange
      : "$$";

    const restaurant = {
      id,
      name: data.name,
      description: data.description || null,

      // Location
      address: data.address || null,
      city: data.city || "Gainesville",
      state: data.state || "FL",
      zipCode: data.zipCode || null,
      latitude:
        data.latitude !== undefined && data.latitude !== null
          ? Number(data.latitude)
          : null,
      longitude:
        data.longitude !== undefined && data.longitude !== null
          ? Number(data.longitude)
          : null,

      // Contact
      phone: data.phone || null,
      website: data.website || null,

      // Info
      cuisineType: Array.isArray(data.cuisineType) ? data.cuisineType : [],
      priceRange,
      atmosphere: Array.isArray(data.atmosphere) ? data.atmosphere : [],

      // Features
      isStudyFriendly: !!data.isStudyFriendly,
      hasWifi: !!data.hasWifi,
      hasOutdoorSeating: !!data.hasOutdoorSeating,
      hasParking: !!data.hasParking,
      isVegetarianFriendly: !!data.isVegetarianFriendly,
      isVeganFriendly: !!data.isVeganFriendly,
      isGlutenFreeFriendly: !!data.isGlutenFreeFriendly,

      // Hours
      hoursOfOperation: data.hoursOfOperation || null,

      // Images
      imageUrl: data.imageUrl || null,
      images: Array.isArray(data.images) ? data.images : [],
      mapImageUrl: data.mapImageUrl || null,

      // Ratings
      averageRating: Number(data.averageRating) || 0,
      totalReviews: Number(data.totalReviews) || 0,
      totalLikes: Number(data.totalLikes) || 0,

      // Status
      isActive: data.isActive !== false,
      isVerified: !!data.isVerified,

      createdAt: now,
      updatedAt: now,
    };

    await this.ref().child(id).set(restaurant);
    return this._attachMethods(restaurant);
  }

  static async findById(id) {
    const snap = await this.ref().child(id).once("value");
    if (!snap.exists()) return null;
    return this._attachMethods(snap.val());
  }

  static async findAll() {
    const snap = await this.ref().once("value");
    const data = snap.val() || {};
    return Object.values(data).map((r) => this._attachMethods(r));
  }

  static async update(id, updates) {
    const snap = await this.ref().child(id).once("value");
    if (!snap.exists()) return null;

    const existing = snap.val();
    const merged = { ...existing };

    // Enforce priceRange rules
    if (updates.priceRange) {
      merged.priceRange = ALLOWED_PRICE_RANGES.includes(updates.priceRange)
        ? updates.priceRange
        : merged.priceRange;
    }

    // Handle boolean/array/number conversions
    const arrayFields = ["cuisineType", "atmosphere", "images"];
    arrayFields.forEach((f) => {
      if (updates[f] !== undefined) {
        merged[f] = Array.isArray(updates[f]) ? updates[f] : merged[f];
      }
    });

    const boolFields = [
      "isStudyFriendly",
      "hasWifi",
      "hasOutdoorSeating",
      "hasParking",
      "isVegetarianFriendly",
      "isVeganFriendly",
      "isGlutenFreeFriendly",
      "isActive",
      "isVerified",
    ];
    boolFields.forEach((b) => {
      if (updates[b] !== undefined) merged[b] = !!updates[b];
    });

    ["averageRating", "totalReviews", "totalLikes", "latitude", "longitude"].forEach((n) => {
      if (updates[n] !== undefined)
        merged[n] = updates[n] !== null ? Number(updates[n]) : merged[n];
    });

    // Handle string fields
    ["imageUrl", "mapImageUrl", "name", "description", "address", "city", "state", "zipCode", "phone", "website", "hoursOfOperation"].forEach((s) => {
      if (updates[s] !== undefined) merged[s] = updates[s];
    });

    merged.updatedAt = new Date().toISOString();

    await this.ref().child(id).set(merged);
    return this._attachMethods(merged);
  }

  static async delete(id) {
    await this.ref().child(id).remove();
    return true;
  }

  static async findAll() {
  const snap = await this.ref().once("value");
  const data = snap.val() || {};
  return Object.values(data).map((r) => this._attachMethods(r));
}


  // Increment counters like totalReviews or totalLikes
  static async incrementCounters(id, counters = {}) {
    const ref = this.ref().child(id);
    await ref.transaction((rest) => {
      if (!rest) return rest;
      if (counters.totalReviews)
        rest.totalReviews = (rest.totalReviews || 0) + counters.totalReviews;
      if (counters.totalLikes)
        rest.totalLikes = (rest.totalLikes || 0) + counters.totalLikes;
      rest.updatedAt = new Date().toISOString();
      return rest;
    });
  }
}

module.exports = Restaurant;
