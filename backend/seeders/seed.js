// backend/seeders/seed.js
require("dotenv").config();

const { User, Restaurant, Review, Discussion } = require("../models");

// Helper to safely get plain object (in case models return instances)
const asPlain = (obj) =>
  obj && obj.toSafeObject ? obj.toSafeObject() : obj || {};

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting Firebase RTDB seeding...");

    // ---------- USERS ----------
    const userData = [
      {
        username: "foodie_gator",
        email: "foodie@ufl.edu",
        password: "password123",
        firstName: "Alex",
        lastName: "Johnson",
        bio: "UF student who loves exploring local food spots!",
        interests: ["italian food", "coffee shops", "vegan options"],
        foodPreferences: ["vegetarian", "spicy"],
        cuisinePreferences: ["italian", "mexican", "thai"],
        priceRange: "$$",
        atmospherePreferences: ["casual", "quiet"],
        studySpotPreference: true,
        socialPreference: true,
        location: "Gainesville, FL",
        openToMatching: true,
      },
      {
        username: "study_eats",
        email: "study@ufl.edu",
        password: "password123",
        firstName: "Sarah",
        lastName: "Williams",
        bio: "Looking for great study spots with good coffee!",
        interests: ["coffee", "study spots", "breakfast"],
        foodPreferences: ["coffee", "pastries"],
        cuisinePreferences: ["american", "cafe"],
        priceRange: "$",
        atmospherePreferences: ["quiet", "study-friendly"],
        studySpotPreference: true,
        socialPreference: false,
        location: "Gainesville, FL",
        openToMatching: true,
      },
      {
        username: "social_butterfly",
        email: "social@ufl.edu",
        password: "password123",
        firstName: "Mike",
        lastName: "Chen",
        bio: "Always down to try new restaurants and meet new people!",
        interests: ["asian cuisine", "nightlife", "group dining"],
        foodPreferences: ["spicy", "seafood"],
        cuisinePreferences: ["chinese", "japanese", "korean"],
        priceRange: "$$$",
        atmospherePreferences: ["lively", "social"],
        studySpotPreference: false,
        socialPreference: true,
        location: "Gainesville, FL",
        openToMatching: true,
      },
    ];

    const users = [];
    for (const u of userData) {
      // assuming User.create handles password hashing like before
      const created = await User.create(u);
      users.push(asPlain(created));
    }

    console.log("✅ Created sample users");

    // ---------- RESTAURANTS ----------
    const restaurantData = [
      {
        name: "The Top",
        description:
          "Iconic Gainesville restaurant with a rooftop bar and diverse menu. Perfect for students and social gatherings.",
        address: "30 N Main St",
        city: "Gainesville",
        state: "FL",
        zipCode: "32601",
        latitude: 29.6516,
        longitude: -82.3248,
        phone: "(352) 384-4595",
        website: "https://thetoprestaurant.com",
        cuisineType: ["American", "Burgers", "Bar Food"],
        priceRange: "$$",
        atmosphere: ["lively", "social", "rooftop"],
        isStudyFriendly: false,
        hasWifi: true,
        hasOutdoorSeating: true,
        hasParking: false,
        isVegetarianFriendly: true,
        isVeganFriendly: false,
        isGlutenFreeFriendly: true,
        imageUrl: "https://example.com/the-top.jpg",
        averageRating: 4.5,
        totalReviews: 0,
        isActive: true,
        isVerified: true,
      },
      {
        name: "Satchels Pizza",
        description:
          "Unique pizzeria with eclectic decor and delicious pies. Known for creative atmosphere and excellent pizza.",
        address: "1800 NE 23rd Ave",
        city: "Gainesville",
        state: "FL",
        zipCode: "32609",
        latitude: 29.67,
        longitude: -82.3015,
        phone: "(352) 335-7437",
        website: "https://satchelspizza.com",
        cuisineType: ["Pizza", "Italian", "Vegetarian"],
        priceRange: "$$",
        atmosphere: ["casual", "quirky", "family-friendly"],
        isStudyFriendly: false,
        hasWifi: false,
        hasOutdoorSeating: true,
        hasParking: true,
        isVegetarianFriendly: true,
        isVeganFriendly: true,
        isGlutenFreeFriendly: true,
        imageUrl: "https://example.com/satchels.jpg",
        averageRating: 4.7,
        totalReviews: 0,
        isActive: true,
        isVerified: true,
      },
      {
        name: "Volta Coffee",
        description:
          "Popular coffee shop perfect for studying or casual meetings. Great espresso and pastries.",
        address: "48 SW 2nd St",
        city: "Gainesville",
        state: "FL",
        zipCode: "32601",
        latitude: 29.6489,
        longitude: -82.3263,
        phone: "(352) 505-8652",
        cuisineType: ["Cafe", "Coffee", "Pastries"],
        priceRange: "$",
        atmosphere: ["quiet", "study-friendly", "casual"],
        isStudyFriendly: true,
        hasWifi: true,
        hasOutdoorSeating: false,
        hasParking: false,
        isVegetarianFriendly: true,
        isVeganFriendly: true,
        isGlutenFreeFriendly: true,
        imageUrl: "https://example.com/volta.jpg",
        averageRating: 4.6,
        totalReviews: 0,
        isActive: true,
        isVerified: true,
      },
      {
        name: "Dragonfly Sushi",
        description:
          "Upscale sushi restaurant with fresh fish and creative rolls. Great for special occasions.",
        address: "201 SE 2nd Ave",
        city: "Gainesville",
        state: "FL",
        zipCode: "32601",
        latitude: 29.6495,
        longitude: -82.3232,
        phone: "(352) 371-3359",
        website: "https://dragonflysushi.com",
        cuisineType: ["Japanese", "Sushi", "Asian"],
        priceRange: "$$$",
        atmosphere: ["upscale", "romantic", "modern"],
        isStudyFriendly: false,
        hasWifi: false,
        hasOutdoorSeating: false,
        hasParking: true,
        isVegetarianFriendly: true,
        isVeganFriendly: false,
        isGlutenFreeFriendly: true,
        imageUrl: "https://example.com/dragonfly.jpg",
        averageRating: 4.4,
        totalReviews: 0,
        isActive: true,
        isVerified: true,
      },
      {
        name: "Boca Fiesta",
        description:
          "Authentic Mexican restaurant with great margaritas and festive atmosphere.",
        address: "232 W University Ave",
        city: "Gainesville",
        state: "FL",
        zipCode: "32601",
        latitude: 29.6488,
        longitude: -82.3285,
        phone: "(352) 378-9462",
        cuisineType: ["Mexican", "Latin American"],
        priceRange: "$$",
        atmosphere: ["lively", "casual", "festive"],
        isStudyFriendly: false,
        hasWifi: false,
        hasOutdoorSeating: true,
        hasParking: false,
        isVegetarianFriendly: true,
        isVeganFriendly: true,
        isGlutenFreeFriendly: true,
        imageUrl: "https://example.com/boca.jpg",
        averageRating: 4.3,
        totalReviews: 0,
        isActive: true,
        isVerified: true,
      },
      {
        name: "Karma Cream",
        description:
          "Vegan ice cream shop with unique flavors. Perfect for dessert or a sweet treat.",
        address: "419 NW 10th Ave",
        city: "Gainesville",
        state: "FL",
        zipCode: "32601",
        latitude: 29.6565,
        longitude: -82.331,
        phone: "(352) 505-3925",
        cuisineType: ["Dessert", "Ice Cream", "Vegan"],
        priceRange: "$",
        atmosphere: ["casual", "friendly"],
        isStudyFriendly: false,
        hasWifi: false,
        hasOutdoorSeating: true,
        hasParking: true,
        isVegetarianFriendly: true,
        isVeganFriendly: true,
        isGlutenFreeFriendly: true,
        imageUrl: "https://example.com/karma.jpg",
        averageRating: 4.8,
        totalReviews: 0,
        isActive: true,
        isVerified: true,
      },
    ];

    const restaurants = [];
    for (const r of restaurantData) {
      const created = await Restaurant.create(r);
      restaurants.push(asPlain(created));
    }

    console.log("✅ Created sample restaurants");

    // ---------- REVIEWS ----------
    const reviewData = [
      {
        userId: users[0].id,
        restaurantId: restaurants[0].id,
        rating: 5,
        title: "Great rooftop vibes!",
        content:
          "The Top has an amazing atmosphere, especially on the rooftop. Food is solid and the drinks are good too. Perfect place to hang out with friends!",
        foodQuality: 4,
        serviceQuality: 5,
        atmosphereRating: 5,
        valueRating: 4,
        visitDate: new Date("2024-10-15").toISOString(),
      },
      {
        userId: users[1].id,
        restaurantId: restaurants[2].id,
        rating: 5,
        title: "Perfect study spot",
        content:
          "Volta is my go-to place for studying. Great coffee, quiet atmosphere, and fast wifi. The staff is friendly and lets you stay for hours.",
        foodQuality: 4,
        serviceQuality: 5,
        atmosphereRating: 5,
        valueRating: 5,
        visitDate: new Date("2024-10-20").toISOString(),
      },
      {
        userId: users[2].id,
        restaurantId: restaurants[3].id,
        rating: 4,
        title: "Best sushi in Gainesville",
        content:
          "Dragonfly never disappoints. Fresh fish, creative rolls, and beautiful presentation. A bit pricey but worth it for special occasions.",
        foodQuality: 5,
        serviceQuality: 4,
        atmosphereRating: 4,
        valueRating: 3,
        visitDate: new Date("2024-11-01").toISOString(),
      },
      {
        userId: users[0].id,
        restaurantId: restaurants[1].id,
        rating: 5,
        title: "Amazing pizza and atmosphere",
        content:
          "Satchels is a Gainesville gem! The pizza is incredible and the decor is so unique. Definitely a must-visit!",
        foodQuality: 5,
        serviceQuality: 5,
        atmosphereRating: 5,
        valueRating: 5,
        visitDate: new Date("2024-10-25").toISOString(),
      },
    ];

    const reviewObjs = [];
    for (const r of reviewData) {
      const created = await Review.create(r);
      reviewObjs.push(asPlain(created));
    }

    console.log("✅ Created sample reviews");

    // ---------- UPDATE RESTAURANT RATINGS ----------
    const reviewsByRestaurant = {};
    for (const r of reviewObjs) {
      if (!reviewsByRestaurant[r.restaurantId]) {
        reviewsByRestaurant[r.restaurantId] = [];
      }
      reviewsByRestaurant[r.restaurantId].push(r);
    }

    for (const restaurant of restaurants) {
      const list = reviewsByRestaurant[restaurant.id] || [];
      if (list.length > 0) {
        const avg =
          list.reduce((sum, r) => sum + (r.rating || 0), 0) / list.length;
        await Restaurant.update(restaurant.id, {
          averageRating: Number(avg.toFixed(2)),
          totalReviews: list.length,
        });
      }
    }

    console.log("✅ Updated restaurant ratings");

    // ---------- DISCUSSIONS ----------
    const discussionData = [
      {
        userId: users[0].id,
        restaurantId: restaurants[0].id,
        title: "Best time to visit The Top?",
        content:
          "What time is best to visit if you want to avoid long waits? Also, any happy hour deals?",
        category: "question",
        tags: ["timing", "happy-hour"],
      },
      {
        userId: users[1].id,
        restaurantId: restaurants[2].id,
        title: "Study buddy wanted at Volta",
        content:
          "Looking for someone to study with at Volta this week. I usually go in the mornings. Anyone interested?",
        category: "meetup",
        tags: ["study-group", "morning"],
      },
      {
        userId: users[2].id,
        restaurantId: restaurants[1].id,
        title: "Pro tip: Try the vegan pizza!",
        content:
          "Even if you're not vegan, Satchels vegan pizza is incredible. The cashew cheese is amazing!",
        category: "tip",
        tags: ["vegan", "recommendation"],
      },
    ];

    for (const d of discussionData) {
      await Discussion.create(d);
    }

    console.log("✅ Created sample discussions");
    console.log("🌟 Firebase RTDB seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding process finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
