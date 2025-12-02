const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Use the Firebase-based User model directly
const User = require("../models/User");

const requireAuth = require("../userAuth/middleware/requireAuth");
const requireAdmin = require("../userAuth/middleware/requireAdmin");
const db = require("../config/database");


// POST - /api/users/sync
// creates or updates a user based on firebase auth id token
router.post("/sync", requireAuth, async (req, res) => {
  try {
    // from requireAuth (decoded ID token)
    const { uid, email, name: authName } = req.user;

    // Extra info from frontend (optional for now)
    const {
      name,
      priceRange,
      location,
    } = req.body || {};

    const displayName = name || authName || (email ? email.split("@")[0] : "User");

    // We'll store user profile directly in RTDB under /users/{uid}
    const ref = db.ref(`users/${uid}`);

    // Fetch existing data to preserve createdAt if present
    const snapshot = await ref.get();
    const existing = snapshot.exists() ? snapshot.val() : null;

    const nowIso = new Date().toISOString();

    const userData = {
      id: uid,   // use Firebase uid as our app user id
      email: email || null,
      username: displayName,
      firstName: displayName,
      lastName: existing?.lastName || null,
      bio: existing?.bio || null,
      profilePicture: existing?.profilePicture || null,
      role: existing?.role || "member",

      interests: existing?.interests || [],
      foodPreferences: existing?.foodPreferences || [],
      dietaryRestrictions: existing?.dietaryRestrictions || [],
      cuisinePreferences: existing?.cuisinePreferences || [],
      priceRange: priceRange || existing?.priceRange || "$$",
      atmospherePreferences: existing?.atmospherePreferences || [],
      studySpotPreference:
        typeof existing?.studySpotPreference === "boolean"
          ? existing.studySpotPreference
          : false,
      socialPreference:
        typeof existing?.socialPreference === "boolean"
          ? existing.socialPreference
          : true,

      location: location || existing?.location || null,
      latitude: existing?.latitude || null,
      longitude: existing?.longitude || null,

      isActive: existing?.isActive !== false,
      openToMatching:
        typeof existing?.openToMatching === "boolean"
          ? existing.openToMatching
          : true,

      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    await ref.set(userData);

    return res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to sync user",
      message: error.message,
    });
  }
});


// POST - Register a new user
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      bio,
      interests,
      foodPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      priceRange,
      atmospherePreferences,
      studySpotPreference,
      socialPreference,
      openToMatching,
    } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Username, email, and password are required",
      });
    }

    // Check if user already exists (by email or username)
    const existingByEmail = await User.findByEmail(email);
    const existingByUsername = await User.findByUsername(username);

    if (existingByEmail || existingByUsername) {
      return res.status(400).json({
        success: false,
        error: "User with this email or username already exists",
      });
    }

    // Create user (password is hashed in the model)
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      bio,
      interests: interests || [],
      foodPreferences: foodPreferences || [],
      dietaryRestrictions: dietaryRestrictions || [],
      cuisinePreferences: cuisinePreferences || [],
      priceRange: priceRange || "$$",
      atmospherePreferences: atmospherePreferences || [],
      studySpotPreference:
        typeof studySpotPreference === "boolean"
          ? studySpotPreference
          : false,
      socialPreference:
        typeof socialPreference === "boolean"
          ? socialPreference
          : true,
      openToMatching:
        typeof openToMatching === "boolean" ? openToMatching : true,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "jwt_key", // will add this to .env later
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register user",
      message: error.message,
    });
  }
});

// POST - Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user by email (Firebase)
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "your_super_secret_jwt_key",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      error: "Failed to login",
      message: error.message,
    });
  }
});

// GET - Get user profile (basic, without joins for now)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
      message: error.message,
    });
  }
});

// PUT - Update user profile
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await User.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const {
      firstName,
      lastName,
      bio,
      profilePicture,
      interests,
      foodPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      priceRange,
      atmospherePreferences,
      studySpotPreference,
      socialPreference,
      location,
      latitude,
      longitude,
      openToMatching,
    } = req.body;

    const updated = await User.update(id, {
      firstName,
      lastName,
      bio,
      profilePicture,
      interests,
      foodPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      priceRange,
      atmospherePreferences,
      studySpotPreference,
      socialPreference,
      location,
      latitude,
      longitude,
      openToMatching,
    });

    res.json({
      success: true,
      data: updated.toSafeObject(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user",
      message: error.message,
    });
  }
});

// PUT - Update user preferences
router.put("/:id/preferences", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await User.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const {
      interests,
      foodPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      priceRange,
      atmospherePreferences,
      studySpotPreference,
      socialPreference,
    } = req.body;

    const updated = await User.update(id, {
      interests,
      foodPreferences,
      dietaryRestrictions,
      cuisinePreferences,
      priceRange,
      atmospherePreferences,
      studySpotPreference,
      socialPreference,
    });

    res.json({
      success: true,
      data: updated.toSafeObject(),
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update preferences",
      message: error.message,
    });
  }
});

// GET - Get all users (for admin or matching)
router.get("/", async (req, res) => {
  try {
    const { limit = 50, offset = 0, openToMatching } = req.query;

    const limitNum = parseInt(limit, 10) || 50;
    const offsetNum = parseInt(offset, 10) || 0;

    // Get all users from Firebase
    let users = await User.findAll();

    // Filter active
    users = users.filter((u) => u.isActive !== false);

    // Filter openToMatching if requested
    if (openToMatching === "true") {
      users = users.filter((u) => u.openToMatching === true);
    }

    const total = users.length;

    // Sort by createdAt desc
    users.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return db - da;
    });

    const paged = users
      .slice(offsetNum, offsetNum + limitNum)
      .map((u) => u.toSafeObject());

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
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      message: error.message,
    });
  }
});

// ADMIN ONLY ROUTES

// DELETE - Delete user (admin only)
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await User.delete(id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
      message: error.message,
    });
  }
});

// PUT - Update user role (admin only)
router.put("/:id/role", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body;

    if (!role || !["member", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Valid role required (member or admin)",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const updated = await User.update(id, { role });

    res.json({
      success: true,
      data: updated.toSafeObject(),
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user role",
      message: error.message,
    });
  }
});

// PUT - Deactivate/activate user (admin only)
router.put("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "isActive must be a boolean",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const updated = await User.update(id, { isActive });

    res.json({
      success: true,
      data: updated.toSafeObject(),
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user status",
      message: error.message,
    });
  }
});

// GET - Get all users including inactive (admin only)
router.get("/admin/all", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, role, isActive } = req.query;

    const limitNum = parseInt(limit, 10) || 50;
    const offsetNum = parseInt(offset, 10) || 0;

    // Get all users from Firebase
    let users = await User.findAll();

    // Filter by role if requested
    if (role && ["member", "admin"].includes(role)) {
      users = users.filter((u) => u.role === role);
    }

    // Filter by isActive if requested
    if (isActive !== undefined) {
      const activeFilter = isActive === "true";
      users = users.filter((u) => u.isActive === activeFilter);
    }

    const total = users.length;

    // Sort by createdAt desc
    users.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return db - da;
    });

    const paged = users
      .slice(offsetNum, offsetNum + limitNum)
      .map((u) => u.toSafeObject());

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
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      message: error.message,
    });
  }
});

module.exports = router;
