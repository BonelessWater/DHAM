// Simple aggregator for Firebase-based models

const User = require("./User");
const Restaurant = require("./Restaurant");
const Review = require("./Review");
const Discussion = require("./Discussion");
const DiscussionReply = require("./DiscussionReply");
const UserMatch = require("./UserMatch");
const Favorite = require("./Favorite");

module.exports = {
  User,
  Restaurant,
  Review,
  Discussion,
  DiscussionReply,
  UserMatch,
  Favorite,
};
