// backend/models/user.js
const db = require("../config/database");
const { randomUUID } = require("crypto");

const uuidv4 = () => randomUUID();

const bcrypt = require("bcryptjs");

const ALLOWED_PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];
const ALLOWED_ROLES = ["member", "admin"];

class User {
  static ref() {
    return db.ref("users");
  }

  // Attach instance-like methods to a plain user object
  static attachMethods(user) {
    if (!user) return null;

    // Compare candidate password with stored hash
    user.comparePassword = async function (candidatePassword) {
      if (!user.password) return false;
      return bcrypt.compare(candidatePassword, user.password);
    };

    // Return user data without password
    user.toSafeObject = function () {
      const { password, ...rest } = user;
      return rest;
    };

    return user;
  }

  /**
   * Create a new user
   * data should contain:
   *  - username, email, password (raw)
   *  - optional: firstName, lastName, bio, profilePicture, preferences, etc.
   */
  static async create(data) {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Hash password like the Sequelize hooks did
    if (!data.password) {
      throw new Error("Password is required");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const priceRange = ALLOWED_PRICE_RANGES.includes(data.priceRange)
      ? data.priceRange
      : "$$";

    const role = ALLOWED_ROLES.includes(data.role) ? data.role : "member";

    const user = {
      id,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      bio: data.bio || null,
      profilePicture: data.profilePicture || null,

      // Arrays / preferences
      interests: Array.isArray(data.interests) ? data.interests : [],
      foodPreferences: Array.isArray(data.foodPreferences)
        ? data.foodPreferences
        : [],
      dietaryRestrictions: Array.isArray(data.dietaryRestrictions)
        ? data.dietaryRestrictions
        : [],
      cuisinePreferences: Array.isArray(data.cuisinePreferences)
        ? data.cuisinePreferences
        : [],
      priceRange,

      atmospherePreferences: Array.isArray(data.atmospherePreferences)
        ? data.atmospherePreferences
        : [],

      studySpotPreference:
        typeof data.studySpotPreference === "boolean"
          ? data.studySpotPreference
          : false,
      socialPreference:
        typeof data.socialPreference === "boolean"
          ? data.socialPreference
          : true,

      location: data.location || null,
      latitude:
        data.latitude !== undefined && data.latitude !== null
          ? Number(data.latitude)
          : null,
      longitude:
        data.longitude !== undefined && data.longitude !== null
          ? Number(data.longitude)
          : null,

      isActive:
        typeof data.isActive === "boolean" ? data.isActive : true,
      openToMatching:
        typeof data.openToMatching === "boolean"
          ? data.openToMatching
          : true,

      createdAt: now,
      updatedAt: now,
    };

    await this.ref().child(id).set(user);
    return this.attachMethods(user);
  }

  /**
   * Find user by id
   */
  static async findById(id) {
    const snapshot = await this.ref().child(id).once("value");
    if (!snapshot.exists()) return null;
    const user = snapshot.val();
    return this.attachMethods(user);
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const snapshot = await this.ref()
      .orderByChild("email")
      .equalTo(email)
      .once("value");

    const data = snapshot.val();
    if (!data) return null;

    const user = Object.values(data)[0];
    return this.attachMethods(user);
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    const snapshot = await this.ref()
      .orderByChild("username")
      .equalTo(username)
      .once("value");

    const data = snapshot.val();
    if (!data) return null;

    const user = Object.values(data)[0];
    return this.attachMethods(user);
  }

  /**
   * Get all users
   */
  static async findAll() {
    const snapshot = await this.ref().once("value");
    const data = snapshot.val() || {};
    return Object.values(data).map((u) => this.attachMethods(u));
  }

  /**
   * Update user by id
   * If `password` is present in updates, it is re-hashed (like beforeUpdate hook)
   */
  static async update(id, updates) {
    const existingSnap = await this.ref().child(id).once("value");
    if (!existingSnap.exists()) return null;

    const existing = existingSnap.val();

    const merged = { ...existing };

    // Handle password update
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      merged.password = await bcrypt.hash(updates.password, salt);
    }

    // Handle simple scalar/array fields
    const updatableFields = [
      "username",
      "email",
      "role",
      "firstName",
      "lastName",
      "bio",
      "profilePicture",
      "interests",
      "foodPreferences",
      "dietaryRestrictions",
      "cuisinePreferences",
      "priceRange",
      "atmospherePreferences",
      "studySpotPreference",
      "socialPreference",
      "location",
      "latitude",
      "longitude",
      "isActive",
      "openToMatching",
    ];

    updatableFields.forEach((field) => {
      if (updates[field] !== undefined) {
        if (
          [
            "interests",
            "foodPreferences",
            "dietaryRestrictions",
            "cuisinePreferences",
            "atmospherePreferences",
          ].includes(field)
        ) {
          merged[field] = Array.isArray(updates[field])
            ? updates[field]
            : merged[field] || [];
        } else if (field === "priceRange") {
          merged[field] = ALLOWED_PRICE_RANGES.includes(updates[field])
            ? updates[field]
            : merged[field] || "$$";
        } else if (field === "role") {
          merged[field] = ALLOWED_ROLES.includes(updates[field])
            ? updates[field]
            : merged[field] || "member";
        } else if (field === "latitude" || field === "longitude") {
          merged[field] =
            updates[field] !== null && updates[field] !== undefined
              ? Number(updates[field])
              : null;
        } else {
          merged[field] = updates[field];
        }
      }
    });

    merged.updatedAt = new Date().toISOString();

    await this.ref().child(id).set(merged);
    return this.attachMethods(merged);
  }

  /**
   * Delete user by id
   */
  static async delete(id) {
    await this.ref().child(id).remove();
    return true;
  }
}

module.exports = User;
