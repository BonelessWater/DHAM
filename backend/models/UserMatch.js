const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserMatch = sequelize.define('UserMatch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user1Id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  user2Id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  matchScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Match compatibility score (0-100)'
  },
  sharedInterests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Interests that both users share'
  },
  sharedCuisinePreferences: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Cuisine preferences that both users share'
  },
  sharedAtmospherePreferences: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Atmosphere preferences that both users share'
  },
  // Match status
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'blocked'),
    defaultValue: 'pending',
    comment: 'Status of the match from user1 perspective'
  },
  user2Status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'blocked'),
    defaultValue: 'pending',
    comment: 'Status of the match from user2 perspective'
  },
  // If both users accept, they can connect
  isConnected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True when both users accept the match'
  },
  // Meeting details (optional)
  suggestedRestaurantId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'restaurants',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Suggested restaurant for meetup'
  },
  meetupDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  meetupNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'user_matches',
  indexes: [
    {
      fields: ['user1Id']
    },
    {
      fields: ['user2Id']
    },
    {
      fields: ['matchScore']
    },
    {
      fields: ['isConnected']
    },
    {
      unique: true,
      fields: ['user1Id', 'user2Id']
    }
  ]
});

module.exports = UserMatch;
