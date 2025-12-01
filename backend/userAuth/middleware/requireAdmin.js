const User = require("../../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const user = await User.findById(req.user.uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    req.userRecord = user;
    next();
  } catch (error) {
    console.error("Error in requireAdmin middleware:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = requireAdmin;
