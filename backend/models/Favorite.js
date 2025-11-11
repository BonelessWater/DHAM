const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
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
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Personal notes about this favorite'
  }
}, {
  timestamps: true,
  tableName: 'favorites',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'restaurantId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['restaurantId']
    }
  ]
});

module.exports = Favorite;
