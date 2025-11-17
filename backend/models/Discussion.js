const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Discussion = sequelize.define('Discussion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  restaurantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'restaurants',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('question', 'tip', 'experience', 'recommendation', 'meetup', 'other'),
    defaultValue: 'experience'
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Array of discussion image URLs'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorizing discussion'
  },
  // Engagement metrics
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  replyCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Moderation
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFlagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether discussion is locked from new replies'
  }
}, {
  timestamps: true,
  tableName: 'discussions',
  indexes: [
    {
      fields: ['restaurantId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Discussion;
