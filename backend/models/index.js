const sequelize = require('../config/database');
const User = require('./User');
const Restaurant = require('./Restaurant');
const Review = require('./Review');
const Discussion = require('./Discussion');
const DiscussionReply = require('./DiscussionReply');
const UserMatch = require('./UserMatch');
const Favorite = require('./Favorite');

// Define associations

// User associations
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(Discussion, { foreignKey: 'userId', as: 'discussions' });
User.hasMany(DiscussionReply, { foreignKey: 'userId', as: 'replies' });
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });

// Restaurant associations
Restaurant.hasMany(Review, { foreignKey: 'restaurantId', as: 'reviews' });
Restaurant.hasMany(Discussion, { foreignKey: 'restaurantId', as: 'discussions' });
Restaurant.hasMany(Favorite, { foreignKey: 'restaurantId', as: 'favorites' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Discussion associations
Discussion.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Discussion.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
Discussion.hasMany(DiscussionReply, { foreignKey: 'discussionId', as: 'replies' });

// DiscussionReply associations
DiscussionReply.belongsTo(User, { foreignKey: 'userId', as: 'user' });
DiscussionReply.belongsTo(Discussion, { foreignKey: 'discussionId', as: 'discussion' });
DiscussionReply.belongsTo(DiscussionReply, { foreignKey: 'parentReplyId', as: 'parentReply' });
DiscussionReply.hasMany(DiscussionReply, { foreignKey: 'parentReplyId', as: 'childReplies' });

// UserMatch associations
UserMatch.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
UserMatch.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });
UserMatch.belongsTo(Restaurant, { foreignKey: 'suggestedRestaurantId', as: 'suggestedRestaurant' });

// Favorite associations
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Favorite.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Function to sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    await sequelize.sync({ force, alter: !force });
    console.log(`✅ Database synchronized${force ? ' (force mode)' : ''}.`);

    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  User,
  Restaurant,
  Review,
  Discussion,
  DiscussionReply,
  UserMatch,
  Favorite,
  syncDatabase
};
