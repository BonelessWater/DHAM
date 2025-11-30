// backend/models/index.js
// Simple aggregator for Firebase-based models

const User = require("./User");
const Restaurant = require("./Restaurant");
const Review = require("./Review");
const Discussion = require("./Discussion");
const DiscussionReply = require("./DiscussionReply");
const UserMatch = require("./UserMatch");
const Favorite = require("./Favorite");

// No Sequelize, no associations, no syncDatabase.
// Each model handles its own Firebase reads/writes.

module.exports = {
  User,
  Restaurant,
  Review,
  Discussion,
  DiscussionReply,
  UserMatch,
  Favorite,
};
