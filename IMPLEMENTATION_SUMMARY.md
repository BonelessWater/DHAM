# DHAM Implementation Summary

## Team Members
- Arjun Malkani
- Meaghan Knowles
- Dominick Dupuy
- Harper Fuchs

## Completed Features

This implementation includes ALL user stories from the project requirements, organized by priority:

### HIGH PRIORITY ✅

#### 1. Customizable Experience (5 points) - Dominick
**User Story:** "I want to be able to find places I can study at as well as places where I can hang out with my friends. I want to be able to determine the price, location, and type of food the app recommends."

**Implementation:**
- ✅ Advanced restaurant filtering system
- ✅ Filter by price range ($, $$, $$$, $$$$)
- ✅ Filter by cuisine type (Italian, Mexican, Chinese, etc.)
- ✅ Filter by atmosphere (casual, quiet, lively, study-friendly, etc.)
- ✅ Filter by features (WiFi, outdoor seating, parking, dietary options)
- ✅ Location-based filtering
- ✅ Study-friendly vs. social hangout spots
- ✅ Multiple sort options (rating, price, popularity)

**API Endpoints:**
- `GET /api/restaurants` - Get restaurants with all filters
- `GET /api/restaurants/meta/filters` - Get available filter options

**Files:**
- `backend/routes/restaurants.js`
- `backend/models/Restaurant.js`

---

#### 2. Meet New People (13 points) - Dominick & Meaghan
**User Story:** "I want to meet new people who have similar interests as me so that I can find a community in Gainesville that I can go out to eat with."

**Implementation:**
- ✅ Intelligent user matching algorithm
- ✅ Match based on shared interests
- ✅ Match based on cuisine preferences
- ✅ Match based on atmosphere preferences
- ✅ Match based on food preferences
- ✅ Match based on price range compatibility
- ✅ Match scoring system (0-100)
- ✅ Match status management (pending, accepted, declined)
- ✅ Connection system (both users must accept)
- ✅ Suggested restaurant for meetups
- ✅ Meetup scheduling

**API Endpoints:**
- `GET /api/matches/user/:userId/potential` - Find potential matches
- `POST /api/matches` - Create match request
- `GET /api/matches/user/:userId` - Get user's matches
- `PUT /api/matches/:id/status` - Accept/decline matches
- `PUT /api/matches/:id/meetup` - Set meetup details

**Files:**
- `backend/routes/matches.js`
- `backend/models/UserMatch.js`
- `backend/models/User.js` (with matching preferences)

---

### MEDIUM PRIORITY ✅

#### 3. Food Reviews (8 points) - Arjun & Harper
**User Story:** "I would like to be able to have a quick and easy way to find food in Gainesville. I want to make sure that the food is good by referencing reviews of the restaurants."

**Implementation:**
- ✅ Complete review system with ratings
- ✅ Overall rating (1-5 stars)
- ✅ Detailed ratings (food quality, service, atmosphere, value)
- ✅ Review titles and content
- ✅ Dish recommendations
- ✅ Visit date tracking
- ✅ Review filtering by rating
- ✅ Sort by rating, date, helpfulness
- ✅ Mark reviews as helpful
- ✅ User review history
- ✅ Automatic restaurant rating calculation

**API Endpoints:**
- `GET /api/reviews/restaurant/:restaurantId` - Get restaurant reviews
- `GET /api/reviews/user/:userId` - Get user's reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark as helpful

**Files:**
- `backend/routes/reviews.js`
- `backend/models/Review.js`

---

#### 4. Experience Discussion (8 points) - Harper
**User Story:** "I'd like to talk about my experiences at specific places with other people. I also want to read the discussion before going to eat so that I have more details than just reading the food reviews."

**Implementation:**
- ✅ Discussion board for each restaurant
- ✅ Multiple discussion categories (question, tip, experience, recommendation, meetup, other)
- ✅ Discussion threads with nested replies
- ✅ Like/vote system for discussions
- ✅ View count tracking
- ✅ Pin important discussions
- ✅ Tag system for organization
- ✅ Reply system with nested replies
- ✅ Sort by popularity, activity, or date

**API Endpoints:**
- `GET /api/discussions/restaurant/:restaurantId` - Get discussions
- `GET /api/discussions/:id` - Get single discussion with replies
- `POST /api/discussions` - Create discussion
- `PUT /api/discussions/:id` - Update discussion
- `DELETE /api/discussions/:id` - Delete discussion
- `POST /api/discussions/:id/like` - Like discussion
- `POST /api/discussions/:id/replies` - Reply to discussion

**Files:**
- `backend/routes/discussions.js`
- `backend/models/Discussion.js`
- `backend/models/DiscussionReply.js`

---

### LOW PRIORITY ✅

#### 5. Food Recommendation (3 points) - Meaghan
**User Story:** "I want to make sure that the food is up to my tastes before I go to the restaurant. So, I want the app to recommend food that I will like when I am in the Gainesville area."

**Implementation:**
- ✅ Personalized recommendation engine
- ✅ Recommendations based on cuisine preferences
- ✅ Recommendations based on atmosphere preferences
- ✅ Recommendations based on price range
- ✅ Recommendations based on study/social preferences
- ✅ Rating-based recommendations
- ✅ Recommendation scoring system
- ✅ Explanation of why restaurants are recommended
- ✅ Similar restaurant suggestions
- ✅ Exclude already favorited restaurants

**API Endpoints:**
- `GET /api/recommendations/user/:userId` - Get personalized recommendations
- `GET /api/recommendations/similar/:restaurantId` - Get similar restaurants

**Files:**
- `backend/routes/recommendations.js`

---

#### 6. User Profile (3 points) - Arjun
**User Story:** "I would like to be able to change my profile details so that other users know more about me and I can know more about other people."

**Implementation:**
- ✅ Complete user profile system
- ✅ User registration and authentication
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Profile customization (name, bio, picture)
- ✅ Preference management (interests, food preferences, cuisines)
- ✅ Dietary restrictions
- ✅ Price range preferences
- ✅ Study vs. social preferences
- ✅ Opt-in/out of matching
- ✅ View user reviews and favorites
- ✅ Update preferences separately

**API Endpoints:**
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `PUT /api/users/:id/preferences` - Update preferences

**Files:**
- `backend/routes/users.js`
- `backend/models/User.js`

---

## Additional Features Implemented

### Favorites System
- ✅ Add/remove favorite restaurants
- ✅ Personal notes for favorites
- ✅ View favorite restaurants list
- ✅ Check if restaurant is favorited

**API Endpoints:**
- `GET /api/favorites/user/:userId`
- `POST /api/favorites`
- `DELETE /api/favorites`
- `GET /api/favorites/check/:userId/:restaurantId`

**Files:**
- `backend/routes/favorites.js`
- `backend/models/Favorite.js`

---

## Database Schema

### Tables Created
1. **users** - User accounts with preferences
2. **restaurants** - Restaurant information with filtering attributes
3. **reviews** - Restaurant reviews and ratings
4. **discussions** - Discussion threads
5. **discussion_replies** - Nested discussion replies
6. **user_matches** - User matching system
7. **favorites** - User's favorite restaurants

### Relationships
- Users have many Reviews, Discussions, Favorites
- Restaurants have many Reviews, Discussions, Favorites
- Discussions have many DiscussionReplies
- UserMatches connect two Users and may suggest a Restaurant

---

## Technology Stack

### Backend
- **Node.js** 18
- **Express.js** 5.1.0
- **PostgreSQL** (via pg & Sequelize ORM)
- **JWT** for authentication
- **bcryptjs** for password hashing

### Security
- Helmet.js for security headers
- CORS configuration
- Password hashing
- JWT token authentication
- Input validation

### Development
- Docker & Docker Compose
- ESLint & Prettier
- Jest for testing
- Nodemon for development

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup PostgreSQL Database
```bash
# Create database
createdb dham_db

# Or use Docker
docker-compose up -d
```

### 3. Configure Environment
```bash
# Copy and edit .env file
cp backend/.env.template backend/.env
# Edit backend/.env with your database credentials
```

### 4. Run Database Migrations
The database will automatically sync when you start the server.

### 5. Seed Database (Optional)
```bash
npm run seed
```

This will create:
- 3 sample users
- 6 Gainesville restaurants
- Sample reviews
- Sample discussions

### 6. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server runs on: http://localhost:8000

---

## API Documentation

Complete API documentation is available in `backend/API_DOCUMENTATION.md`

Quick test:
```bash
# Check server health
curl http://localhost:8000/health

# Get restaurants
curl http://localhost:8000/api/restaurants

# Get filtered restaurants
curl "http://localhost:8000/api/restaurants?priceRange=$$&isStudyFriendly=true"
```

---

## Sample Data

The seed script creates sample data for:

### Restaurants
1. **The Top** - Rooftop bar, American, $$
2. **Satchels Pizza** - Quirky pizzeria, $$
3. **Volta Coffee** - Study-friendly cafe, $
4. **Dragonfly Sushi** - Upscale sushi, $$$
5. **Boca Fiesta** - Mexican, $$
6. **Karma Cream** - Vegan ice cream, $

### Users
1. **foodie_gator** - Loves Italian food and study spots
2. **study_eats** - Looking for quiet study cafes
3. **social_butterfly** - Wants to try new restaurants and meet people

---

## Matching Algorithm

The matching algorithm calculates compatibility scores based on:
- **30%** - Shared interests
- **25%** - Shared cuisine preferences
- **20%** - Shared atmosphere preferences
- **15%** - Shared food preferences
- **10%** - Price range compatibility

Minimum match score is configurable (default: 40/100)

---

## Recommendation Algorithm

The recommendation algorithm scores restaurants based on:
- **40%** - Cuisine preference match
- **25%** - Atmosphere preference match
- **15%** - Price range match
- **10%** - Study spot preference match
- **10%** - Average rating bonus

Each recommendation includes explanations for why it was suggested.

---

## Testing

All endpoints can be tested using:
- Postman
- curl
- The API test screen in the Flutter app

Example test workflow:
1. Register a user
2. Get recommendations for that user
3. Find potential matches
4. Create a review
5. Add favorites
6. Start a discussion

---

## Story Points Summary

| Priority | Feature | Points | Status |
|----------|---------|--------|--------|
| High | Meet New People | 13 | ✅ Complete |
| High | Customizable Experience | 5 | ✅ Complete |
| Medium | Food Reviews | 8 | ✅ Complete |
| Medium | Experience Discussion | 8 | ✅ Complete |
| Low | Food Recommendation | 3 | ✅ Complete |
| Low | User Profile | 3 | ✅ Complete |
| **TOTAL** | | **40** | **✅ All Complete** |

---

## Next Steps

### Frontend Integration
The backend is complete and ready for frontend integration. Next steps:

1. Update Flutter app to use real API endpoints instead of mock data
2. Implement authentication flow in Flutter
3. Add filter UI for customizable experience
4. Implement matching UI for "meet new people"
5. Add review submission forms
6. Implement discussion board UI
7. Add recommendation display

### Future Enhancements
- Image upload for profiles, reviews, and discussions
- Real-time notifications
- Chat between matched users
- Restaurant owner accounts
- Reservation system
- Location-based distance calculations
- Social media integration

---

## Files Created/Modified

### New Backend Files
- `backend/config/database.js` - Database configuration
- `backend/models/User.js` - User model with preferences
- `backend/models/Restaurant.js` - Restaurant model with filtering
- `backend/models/Review.js` - Review model
- `backend/models/Discussion.js` - Discussion model
- `backend/models/DiscussionReply.js` - Reply model
- `backend/models/UserMatch.js` - Match model
- `backend/models/Favorite.js` - Favorite model
- `backend/models/index.js` - Model exports and associations
- `backend/routes/restaurants.js` - Restaurant endpoints
- `backend/routes/reviews.js` - Review endpoints
- `backend/routes/discussions.js` - Discussion endpoints
- `backend/routes/matches.js` - Matching endpoints
- `backend/routes/recommendations.js` - Recommendation endpoints
- `backend/routes/users.js` - User endpoints
- `backend/routes/favorites.js` - Favorite endpoints
- `backend/seeders/seed.js` - Database seeder
- `backend/.env` - Environment configuration
- `backend/API_DOCUMENTATION.md` - Complete API docs

### Modified Files
- `backend/server.js` - Integrated all routes and database
- `package.json` - Added seed script

---

## Conclusion

All user stories have been successfully implemented with full backend API support. The application now supports:

✅ Finding restaurants with customizable filters
✅ Meeting new people through intelligent matching
✅ Reading and writing detailed reviews
✅ Participating in community discussions
✅ Getting personalized recommendations
✅ Managing user profiles and preferences

The backend is production-ready and waiting for frontend integration!
