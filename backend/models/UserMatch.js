// backend/models/UserMatch.js
const db = require("../config/database");
const { randomUUID } = require("crypto");

// keep this so the rest of your code doesn't have to change
const uuidv4 = () => randomUUID();


const VALID_STATUS = ["pending", "accepted", "declined", "blocked"];

class UserMatch {
  static ref() {
    return db.ref("userMatches");
  }

  static _attachMethods(match) {
    if (!match) return null;
    match.toSafeObject = function () {
      return { ...match };
    };
    return match;
  }

  /**
   * Create a new match
   */
  static async create(data) {
    const { user1Id, user2Id, matchScore } = data;

    if (!user1Id || !user2Id) {
      throw new Error("user1Id and user2Id are required");
    }
    if (user1Id === user2Id) {
      throw new Error("Cannot match a user with themselves");
    }
    if (matchScore === undefined) {
      throw new Error("matchScore is required");
    }

    // Ensure unique pair (user1Id, user2Id)
    const existing = await this.findBetweenUsers(user1Id, user2Id);
    if (existing) {
      throw new Error("Match between these users already exists");
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const status =
      VALID_STATUS.includes(data.status) ? data.status : "pending";
    const user2Status =
      VALID_STATUS.includes(data.user2Status) ? data.user2Status : "pending";

    const match = {
      id,
      user1Id,
      user2Id,
      matchScore: Number(matchScore),

      sharedInterests: Array.isArray(data.sharedInterests)
        ? data.sharedInterests
        : [],
      sharedCuisinePreferences: Array.isArray(
        data.sharedCuisinePreferences
      )
        ? data.sharedCuisinePreferences
        : [],
      sharedAtmospherePreferences: Array.isArray(
        data.sharedAtmospherePreferences
      )
        ? data.sharedAtmospherePreferences
        : [],

      status,
      user2Status,
      isConnected: status === "accepted" && user2Status === "accepted",

      suggestedRestaurantId: data.suggestedRestaurantId || null,
      meetupDate: data.meetupDate || null,
      meetupNotes: data.meetupNotes || null,

      createdAt: now,
      updatedAt: now,
    };

    await this.ref().child(id).set(match);
    return this._attachMethods(match);
  }

  static async findById(id) {
    const snap = await this.ref().child(id).once("value");
    if (!snap.exists()) return null;
    return this._attachMethods(snap.val());
  }

  /**
   * All matches where user is either user1 or user2
   */
  static async findByUserId(userId) {
    const [asUser1Snap, asUser2Snap] = await Promise.all([
      this.ref().orderByChild("user1Id").equalTo(userId).once("value"),
      this.ref().orderByChild("user2Id").equalTo(userId).once("value"),
    ]);

    const res = [];
    const seen = new Set();

    const pushFromSnapshot = (snap) => {
      const data = snap.val() || {};
      for (const [id, val] of Object.entries(data)) {
        if (!seen.has(id)) {
          seen.add(id);
          res.push(this._attachMethods(val));
        }
      }
    };

    pushFromSnapshot(asUser1Snap);
    pushFromSnapshot(asUser2Snap);

    return res;
  }

  /**
   * Find match between two specific users (ordered pair)
   */
  static async findBetweenUsers(user1Id, user2Id) {
    const snap = await this.ref()
      .orderByChild("user1Id")
      .equalTo(user1Id)
      .once("value");

    const data = snap.val() || {};
    const match = Object.values(data).find(
      (m) => m.user2Id === user2Id
    );
    return this._attachMethods(match || null);
  }

  /**
   * Update match by id
   */
  static async update(id, updates) {
    const snap = await this.ref().child(id).once("value");
    if (!snap.exists()) return null;

    const existing = snap.val();
    const merged = { ...existing };

    // Merge scalar fields
    ["matchScore", "suggestedRestaurantId", "meetupDate", "meetupNotes"].forEach(
      (field) => {
        if (updates[field] !== undefined) {
          if (field === "matchScore") {
            merged[field] = Number(updates[field]);
          } else {
            merged[field] = updates[field];
          }
        }
      }
    );

    // Merge arrays
    [
      "sharedInterests",
      "sharedCuisinePreferences",
      "sharedAtmospherePreferences",
    ].forEach((field) => {
      if (updates[field] !== undefined) {
        merged[field] = Array.isArray(updates[field])
          ? updates[field]
          : merged[field] || [];
      }
    });

    // Merge statuses
    if (updates.status !== undefined) {
      merged.status = VALID_STATUS.includes(updates.status)
        ? updates.status
        : merged.status;
    }
    if (updates.user2Status !== undefined) {
      merged.user2Status = VALID_STATUS.includes(updates.user2Status)
        ? updates.user2Status
        : merged.user2Status;
    }

    // Recompute isConnected
    merged.isConnected =
      merged.status === "accepted" &&
      merged.user2Status === "accepted";

    merged.updatedAt = new Date().toISOString();

    await this.ref().child(id).set(merged);
    return this._attachMethods(merged);
  }

  static async delete(id) {
    await this.ref().child(id).remove();
    return true;
  }
}

module.exports = UserMatch;
