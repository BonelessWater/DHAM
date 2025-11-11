const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // Preferences for matching with other users
  interests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'User interests for matching (e.g., ["vegan", "italian food", "coffee shops"])'
  },
  foodPreferences: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Food preferences (e.g., ["vegetarian", "spicy", "seafood"])'
  },
  dietaryRestrictions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Dietary restrictions (e.g., ["gluten-free", "halal", "kosher"])'
  },
  cuisinePreferences: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Preferred cuisines (e.g., ["italian", "chinese", "mexican"])'
  },
  priceRange: {
    type: DataTypes.ENUM('$', '$$', '$$$', '$$$$'),
    defaultValue: '$$',
    comment: 'Preferred price range'
  },
  atmospherePreferences: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Preferred atmospheres (e.g., ["quiet", "lively", "casual", "formal"])'
  },
  studySpotPreference: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether user looks for study spots'
  },
  socialPreference: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether user looks for social hangout spots'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'User location (e.g., "Gainesville, FL")'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  openToMatching: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether user wants to be matched with others'
  }
}, {
  timestamps: true,
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get safe user object (without password)
User.prototype.toSafeObject = function() {
  const { password, ...userWithoutPassword } = this.toJSON();
  return userWithoutPassword;
};

module.exports = User;
