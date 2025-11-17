const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Location fields
  address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    defaultValue: 'Gainesville',
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(2),
    defaultValue: 'FL',
    allowNull: false
  },
  zipCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  // Contact and website
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // Restaurant details
  cuisineType: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Types of cuisine (e.g., ["Italian", "Pizza", "Pasta"])'
  },
  priceRange: {
    type: DataTypes.ENUM('$', '$$', '$$$', '$$$$'),
    allowNull: false,
    comment: '$ = budget, $$ = moderate, $$$ = expensive, $$$$ = fine dining'
  },
  atmosphere: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Atmosphere tags (e.g., ["casual", "quiet", "lively", "romantic", "study-friendly"])'
  },
  // Features and amenities
  isStudyFriendly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether restaurant is good for studying'
  },
  hasWifi: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasOutdoorSeating: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasParking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isVegetarianFriendly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isVeganFriendly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isGlutenFreeFriendly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Hours
  hoursOfOperation: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Operating hours by day of week'
  },
  // Images
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Array of image URLs'
  },
  // Ratings and popularity
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalLikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether restaurant info has been verified'
  }
}, {
  timestamps: true,
  tableName: 'restaurants',
  indexes: [
    {
      fields: ['city']
    },
    {
      fields: ['priceRange']
    },
    {
      fields: ['averageRating']
    },
    {
      fields: ['cuisineType'],
      using: 'gin'
    },
    {
      fields: ['atmosphere'],
      using: 'gin'
    }
  ]
});

module.exports = Restaurant;
