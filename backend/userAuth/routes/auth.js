const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");

router.get("/me", requireAuth, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;

// running user authentication backend files
