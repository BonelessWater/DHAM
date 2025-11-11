const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DiscussionReply = sequelize.define('DiscussionReply', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  discussionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'discussions',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  parentReplyId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'discussion_replies',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'For nested replies'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Array of reply image URLs'
  },
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isFlagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'discussion_replies',
  indexes: [
    {
      fields: ['discussionId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['parentReplyId']
    }
  ]
});

module.exports = DiscussionReply;
