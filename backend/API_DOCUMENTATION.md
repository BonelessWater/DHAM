# DHAM API Documentation

## Overview
This is the complete API documentation for the DHAM (Dining & Hangout Application for Meetings) backend API.

Base URL: `http://localhost:8000/api`

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Restaurants](#restaurants)
4. [Reviews](#reviews)
5. [Discussions](#discussions)
6. [Favorites](#favorites)
7. [Matches](#matches)
8. [Recommendations](#recommendations)

---

## Authentication

### Register
**POST** `/api/users/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "bio": "string (optional)",
  "interests": ["array of strings"],
  "cuisinePreferences": ["array of strings"],
  "priceRange": "$ | $$ | $$$ | $$$$",
  "atmospherePreferences": ["array of strings"],
  "studySpotPreference": "boolean",
  "socialPreference": "boolean",
  "openToMatching": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ...user object },
    "token": "JWT token"
  }
}
```

### Login
**POST** `/api/users/login`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ...user object },
    "token": "JWT token"
  }
}
```

---

## Users

### Get User Profile
**GET** `/api/users/:id`

Get a user's profile with reviews and favorites.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "bio": "string",
    "interests": ["array"],
    "reviews": [...],
    "favorites": [...]
  }
}
```

### Update User Profile
**PUT** `/api/users/:id`

Update user profile information.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "bio": "string",
  "profilePicture": "string (URL)",
  "interests": ["array"],
  "cuisinePreferences": ["array"],
  "priceRange": "$ | $$ | $$$ | $$$$",
  "atmospherePreferences": ["array"],
  "studySpotPreference": "boolean",
  "socialPreference": "boolean",
  "openToMatching": "boolean"
}
```

### Update User Preferences
**PUT** `/api/users/:id/preferences`

Update only user preferences (for matching and recommendations).

---

## Restaurants

### Get All Restaurants (with filtering)
**GET** `/api/restaurants`

Get restaurants with advanced filtering options.

**Query Parameters:**
- `priceRange`: Filter by price ($ | $$ | $$$ | $$$$) - can be array
- `cuisineType`: Filter by cuisine type - can be array
- `atmosphere`: Filter by atmosphere - can be array
- `isStudyFriendly`: true/false
- `hasWifi`: true/false
- `hasOutdoorSeating`: true/false
- `hasParking`: true/false
- `isVegetarianFriendly`: true/false
- `isVeganFriendly`: true/false
- `isGlutenFreeFriendly`: true/false
- `minRating`: Minimum rating (0-5)
- `search`: Search by name, description, or address
- `sortBy`: name | price_low | price_high | rating | popular
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Example:**
```
GET /api/restaurants?priceRange=$$&cuisineType=Italian&isStudyFriendly=true&sortBy=rating
```

**Response:**
```json
{
  "success": true,
  "data": [...restaurants],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Single Restaurant
**GET** `/api/restaurants/:id`

Get detailed information about a specific restaurant.

### Get Filter Options
**GET** `/api/restaurants/meta/filters`

Get available filter options for the UI.

**Response:**
```json
{
  "success": true,
  "data": {
    "priceRanges": ["$", "$$", "$$$", "$$$$"],
    "cuisineTypes": ["Italian", "Mexican", ...],
    "atmospheres": ["casual", "quiet", "lively", ...],
    "features": ["isStudyFriendly", "hasWifi", ...]
  }
}
```

---

## Reviews

### Get Reviews for Restaurant
**GET** `/api/reviews/restaurant/:restaurantId`

**Query Parameters:**
- `rating`: Filter by specific rating (1-5)
- `sortBy`: rating_high | rating_low | helpful
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

### Get Reviews by User
**GET** `/api/reviews/user/:userId`

Get all reviews written by a specific user.

### Create Review
**POST** `/api/reviews`

**Request Body:**
```json
{
  "userId": "uuid (required)",
  "restaurantId": "uuid (required)",
  "rating": "number 1-5 (required)",
  "title": "string (optional)",
  "content": "string (required)",
  "foodQuality": "number 1-5 (optional)",
  "serviceQuality": "number 1-5 (optional)",
  "atmosphereRating": "number 1-5 (optional)",
  "valueRating": "number 1-5 (optional)",
  "visitDate": "ISO date string (optional)",
  "dishesOrdered": ["array of strings"]
}
```

### Update Review
**PUT** `/api/reviews/:id`

### Delete Review
**DELETE** `/api/reviews/:id`

### Mark Review as Helpful
**POST** `/api/reviews/:id/helpful`

---

## Discussions

### Get Discussions for Restaurant
**GET** `/api/discussions/restaurant/:restaurantId`

**Query Parameters:**
- `category`: question | tip | experience | recommendation | meetup | other
- `sortBy`: popular | active
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

### Get Single Discussion
**GET** `/api/discussions/:id`

Get discussion with all replies (nested).

### Create Discussion
**POST** `/api/discussions`

**Request Body:**
```json
{
  "userId": "uuid (required)",
  "restaurantId": "uuid (required)",
  "title": "string (required)",
  "content": "string (required)",
  "category": "question | tip | experience | recommendation | meetup | other",
  "tags": ["array of strings"]
}
```

### Update Discussion
**PUT** `/api/discussions/:id`

### Delete Discussion
**DELETE** `/api/discussions/:id`

### Like Discussion
**POST** `/api/discussions/:id/like`

### Reply to Discussion
**POST** `/api/discussions/:id/replies`

**Request Body:**
```json
{
  "userId": "uuid (required)",
  "content": "string (required)",
  "parentReplyId": "uuid (optional, for nested replies)"
}
```

---

## Favorites

### Get User's Favorites
**GET** `/api/favorites/user/:userId`

### Add Favorite
**POST** `/api/favorites`

**Request Body:**
```json
{
  "userId": "uuid (required)",
  "restaurantId": "uuid (required)",
  "notes": "string (optional)"
}
```

### Remove Favorite
**DELETE** `/api/favorites`

**Request Body:**
```json
{
  "userId": "uuid (required)",
  "restaurantId": "uuid (required)"
}
```

### Check if Favorited
**GET** `/api/favorites/check/:userId/:restaurantId`

---

## Matches (Meet New People Feature)

### Get Potential Matches
**GET** `/api/matches/user/:userId/potential`

Get potential matches based on user preferences and interests.

**Query Parameters:**
- `minScore`: Minimum match score (0-100, default: 40)
- `limit`: Number of results (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user": { ...user object },
      "matchScore": 85,
      "sharedInterests": ["italian food", "coffee"],
      "sharedCuisinePreferences": ["italian", "mexican"],
      "sharedAtmospherePreferences": ["casual", "quiet"]
    }
  ]
}
```

### Create Match Request
**POST** `/api/matches`

**Request Body:**
```json
{
  "user1Id": "uuid (required)",
  "user2Id": "uuid (required)",
  "suggestedRestaurantId": "uuid (optional)",
  "meetupNotes": "string (optional)"
}
```

### Get User's Matches
**GET** `/api/matches/user/:userId`

**Query Parameters:**
- `status`: pending | accepted | declined | blocked
- `isConnected`: true/false

### Update Match Status
**PUT** `/api/matches/:id/status`

**Request Body:**
```json
{
  "userId": "uuid (required)",
  "status": "pending | accepted | declined | blocked"
}
```

### Update Meetup Details
**PUT** `/api/matches/:id/meetup`

**Request Body:**
```json
{
  "suggestedRestaurantId": "uuid",
  "meetupDate": "ISO date string",
  "meetupNotes": "string"
}
```

---

## Recommendations

### Get Personalized Recommendations
**GET** `/api/recommendations/user/:userId`

Get restaurant recommendations based on user preferences.

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `minScore`: Minimum recommendation score (0-100, default: 40)
- `excludeFavorites`: true/false - exclude already favorited restaurants

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "restaurant": { ...restaurant object },
      "recommendationScore": 85,
      "matchReasons": [
        "Matches your cuisine preferences: Italian, Mexican",
        "casual atmosphere",
        "Within your price range ($$)",
        "Highly rated (4.7 stars)"
      ]
    }
  ]
}
```

### Get Similar Restaurants
**GET** `/api/recommendations/similar/:restaurantId`

Get restaurants similar to a specific restaurant.

**Query Parameters:**
- `limit`: Number of results (default: 5)

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message (in development mode)"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Database Setup

### Initial Setup

1. Install PostgreSQL
2. Create database:
```bash
createdb dham_db
```

3. Set environment variables in `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dham_db
DB_USER=postgres
DB_PASSWORD=postgres
```

4. Run migrations (automatic on server start)
5. Seed database:
```bash
npm run seed
```

---

## Testing

Use tools like Postman or curl to test endpoints:

```bash
# Test health check
curl http://localhost:8000/health

# Get restaurants with filters
curl "http://localhost:8000/api/restaurants?priceRange=$$&isStudyFriendly=true"

# Register user
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'
```
