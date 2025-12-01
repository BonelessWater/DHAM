// backend/seeders/seed.js
require("dotenv").config();

const { User, Restaurant, Review, Discussion } = require("../models");

// Helper to safely get plain object (in case models return instances)
const asPlain = (obj) =>
  obj && obj.toSafeObject ? obj.toSafeObject() : obj || {};

// Helper to generate fake map image URLs using placeholder services
const getMapImageUrl = (restaurantName, index) => {
  // Using placeholder image services for demonstration
  // In production, these would be real map images
  const services = [
    `https://via.placeholder.com/600x400/4a90e2/ffffff?text=Map+of+${encodeURIComponent(restaurantName)}`,
    `https://via.placeholder.com/600x400/7cb342/ffffff?text=${encodeURIComponent(restaurantName)}+Location`,
    `https://via.placeholder.com/600x400/f4511e/ffffff?text=Find+${encodeURIComponent(restaurantName)}`,
  ];
  return services[index % services.length];
};

// Restaurant name generator
const restaurantNames = [
  // Coffee & Cafes
  "The Daily Grind", "Bean There", "Cup of Joe's", "Espresso Yourself", "Mocha Magic",
  "The Coffee Corner", "Brew Haven", "Caffeine Dreams", "The Roasted Bean", "Latte Lounge",

  // Pizza Places
  "Slice of Heaven", "Pizza Paradise", "The Pie Shop", "Crusty's Pizzeria", "Margherita Magic",
  "Dough Bros", "Pizza Planet", "The Pizza Lab", "Firehouse Pizza", "Artisan Pies",

  // Burgers & American
  "Burger Bliss", "The Patty Shack", "Grill Masters", "Burger House", "The Burger Joint",
  "American Diner", "Smokehouse BBQ", "The Grill Room", "Classic Burger Co", "Flame & Bun",

  // Asian Cuisine
  "Wok This Way", "Rice Bowl", "Noodle House", "Sushi Central", "Pho Real",
  "Dragon Wok", "Asian Fusion", "Ramen Bar", "Teriyaki Spot", "Bento Box",

  // Mexican Food
  "Taco Tuesday", "Burrito Brothers", "Salsa Verde", "El Mariachi", "Taco Town",
  "Quesadilla Queen", "Nacho Average", "Guac & Roll", "The Taco Truck", "Fiesta Mexicana",

  // Italian
  "Pasta La Vista", "Bella Italia", "The Olive Garden", "Romano's", "Trattoria Toscana",
  "Mama Mia's", "Venice Cafe", "The Pasta House", "Italian Corner", "Ristorante Napoli",

  // Indian
  "Curry House", "Spice Route", "Tandoori Palace", "Bombay Dreams", "Masala Magic",
  "The Curry Leaf", "India Gate", "Namaste Kitchen", "Saffron", "Tikka Time",

  // Mediterranean
  "Med Eats", "Olive Branch", "Pita Paradise", "Falafel King", "Hummus Haven",
  "Greek Taverna", "Mediterranean Magic", "Gyro House", "Kebab Corner", "Athens Grill",

  // Dessert & Sweets
  "Sweet Tooth", "The Dessert Bar", "Ice Cream Dreams", "Cupcake Corner", "Sugar Rush",
  "The Bakehouse", "Cookie Monster", "Pastry Palace", "Frozen Delights", "Candy Lane",

  // Sandwiches & Delis
  "Sub Station", "The Sandwich Shop", "Deli Delights", "Hoagie Heaven", "The Sub Shack",
  "Panini Press", "Club Sandwich", "Wrap It Up", "The Deli Counter", "Bagel Bros",

  // Seafood
  "The Fish Market", "Ocean's Catch", "Lobster Pot", "Shrimp Shack", "Catch of the Day",
  "The Oyster Bar", "Fisherman's Wharf", "Sea Salt", "The Crab House", "Surf & Turf",

  // Breakfast & Brunch
  "Morning Glory", "Pancake Palace", "Egg & I", "Brunch Spot", "Waffle House",
  "The Breakfast Club", "Sunny Side Up", "French Toast Cafe", "Omelet Station", "Rise & Shine",

  // Healthy & Organic
  "Green Leaf", "Fresh Start", "Organic Oasis", "Smoothie King", "Juice Bar",
  "Salad Stop", "Veggie Delight", "The Health Hub", "Garden Fresh", "Pure Food",
];

const cuisineTypes = {
  coffee: ["Cafe", "Coffee", "Pastries", "Breakfast"],
  pizza: ["Pizza", "Italian"],
  burger: ["American", "Burgers", "Bar Food"],
  asian: ["Asian", "Chinese", "Japanese", "Thai"],
  mexican: ["Mexican", "Latin American"],
  italian: ["Italian", "Pasta", "Mediterranean"],
  indian: ["Indian", "Curry", "Asian"],
  mediterranean: ["Mediterranean", "Greek", "Middle Eastern"],
  dessert: ["Dessert", "Ice Cream", "Bakery"],
  sandwich: ["Sandwiches", "Deli", "American"],
  seafood: ["Seafood", "American"],
  breakfast: ["Breakfast", "Brunch", "American"],
  healthy: ["Healthy", "Vegetarian", "Vegan", "Salads"],
};

const atmospheres = [
  ["casual", "friendly"],
  ["quiet", "study-friendly"],
  ["lively", "social"],
  ["upscale", "romantic"],
  ["family-friendly", "casual"],
  ["trendy", "modern"],
  ["cozy", "intimate"],
  ["rustic", "homey"],
];

const descriptions = [
  "A popular spot known for its welcoming atmosphere and delicious food.",
  "Perfect for students looking for a great meal in a comfortable setting.",
  "Known for exceptional service and high-quality ingredients.",
  "A local favorite that combines great food with a vibrant atmosphere.",
  "Offers a unique dining experience with carefully crafted dishes.",
  "A casual eatery perfect for quick meals or leisurely dining.",
  "Features a diverse menu that caters to all tastes and preferences.",
  "A must-visit destination for food lovers in the area.",
];

const streetNames = ["Main St", "University Ave", "1st Ave", "2nd St", "Park Rd",
  "Oak St", "Maple Ave", "College Rd", "Campus Dr", "Center St"];

const priceRanges = ["$", "$$", "$$$"];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhoneNumber() {
  return `(352) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`;
}

function generateRestaurantData(name, index) {
  const typeKey = index < 10 ? "coffee" :
                  index < 20 ? "pizza" :
                  index < 30 ? "burger" :
                  index < 40 ? "asian" :
                  index < 50 ? "mexican" :
                  index < 60 ? "italian" :
                  index < 70 ? "indian" :
                  index < 80 ? "mediterranean" :
                  index < 90 ? "dessert" :
                  index < 100 ? "sandwich" :
                  index < 105 ? "seafood" :
                  index < 110 ? "breakfast" : "healthy";

  const cuisines = cuisineTypes[typeKey];
  const isStudyFriendly = typeKey === "coffee" || Math.random() > 0.7;
  const priceRange = typeKey === "dessert" || typeKey === "coffee" || typeKey === "sandwich" ? "$" :
                      typeKey === "seafood" || typeKey === "italian" ? "$$$" : "$$";

  const latitude = 29.6516 + (Math.random() * 0.05 - 0.025);
  const longitude = -82.3248 + (Math.random() * 0.05 - 0.025);

  return {
    name: name,
    description: getRandomElement(descriptions),
    address: `${getRandomInt(100, 9999)} ${getRandomElement(streetNames)}`,
    city: "Gainesville",
    state: "FL",
    zipCode: `3260${getRandomInt(1, 9)}`,
    latitude: parseFloat(latitude.toFixed(4)),
    longitude: parseFloat(longitude.toFixed(4)),
    phone: generatePhoneNumber(),
    website: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    cuisineType: cuisines,
    priceRange: priceRange,
    atmosphere: getRandomElement(atmospheres),
    isStudyFriendly: isStudyFriendly,
    hasWifi: Math.random() > 0.3,
    hasOutdoorSeating: Math.random() > 0.5,
    hasParking: Math.random() > 0.4,
    isVegetarianFriendly: Math.random() > 0.3,
    isVeganFriendly: Math.random() > 0.6,
    isGlutenFreeFriendly: Math.random() > 0.5,
    imageUrl: `https://via.placeholder.com/800x600/cccccc/666666?text=${encodeURIComponent(name)}`,
    mapImageUrl: getMapImageUrl(name, index),
    averageRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    totalReviews: 0,
    isActive: true,
    isVerified: Math.random() > 0.3,
  };
}

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting Firebase RTDB seeding...");

    // ---------- USERS ----------
    const userData = [
      {
        username: "foodie_gator",
        email: "foodie@ufl.edu",
        password: "password123",
        role: "member",
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
        role: "member",
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
        role: "member",
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
      {
        username: "admin_user",
        email: "admin@gator-food-finder.com",
        password: "AdminPass123!",
        role: "admin",
        firstName: "Admin",
        lastName: "User",
        bio: "System administrator managing the Gator Food Finder platform.",
        interests: ["platform management", "user support"],
        foodPreferences: [],
        cuisinePreferences: [],
        priceRange: "$$",
        atmospherePreferences: [],
        studySpotPreference: false,
        socialPreference: false,
        location: "Gainesville, FL",
        openToMatching: false,
      },
    ];

    const users = [];
    for (const u of userData) {
      const created = await User.create(u);
      users.push(asPlain(created));
    }

    console.log("✅ Created sample users (including 1 admin)");

    // ---------- RESTAURANTS (100+) ----------
    console.log("🍽️  Generating 120 restaurants with map images...");

    const restaurants = [];
    for (let i = 0; i < restaurantNames.length && i < 120; i++) {
      const restaurantData = generateRestaurantData(restaurantNames[i], i);
      const created = await Restaurant.create(restaurantData);
      restaurants.push(asPlain(created));

      if ((i + 1) % 20 === 0) {
        console.log(`   Created ${i + 1} restaurants...`);
      }
    }

    console.log(`✅ Created ${restaurants.length} restaurants with map images`);

    // ---------- REVIEWS ----------
    console.log("📝 Creating sample reviews...");
    const reviewData = [];

    // Create 2-3 reviews for first 30 restaurants
    for (let i = 0; i < Math.min(30, restaurants.length); i++) {
      const numReviews = getRandomInt(2, 3);
      for (let j = 0; j < numReviews; j++) {
        const user = users[getRandomInt(0, 2)]; // Use first 3 users
        reviewData.push({
          userId: user.id,
          restaurantId: restaurants[i].id,
          rating: getRandomInt(3, 5),
          title: `Great experience at ${restaurants[i].name}`,
          content: `Had a wonderful time at ${restaurants[i].name}. ${getRandomElement(descriptions)} Would definitely recommend!`,
          foodQuality: getRandomInt(3, 5),
          serviceQuality: getRandomInt(3, 5),
          atmosphereRating: getRandomInt(3, 5),
          valueRating: getRandomInt(3, 5),
          visitDate: new Date(Date.now() - getRandomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    const reviewObjs = [];
    for (const r of reviewData) {
      const created = await Review.create(r);
      reviewObjs.push(asPlain(created));
    }

    console.log(`✅ Created ${reviewObjs.length} sample reviews`);

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
        title: `Best time to visit ${restaurants[0].name}?`,
        content: "What time is best to visit if you want to avoid long waits? Also, any happy hour deals?",
        category: "question",
        tags: ["timing", "happy-hour"],
      },
      {
        userId: users[1].id,
        restaurantId: restaurants[5].id,
        title: `Study buddy wanted at ${restaurants[5].name}`,
        content: "Looking for someone to study with this week. I usually go in the mornings. Anyone interested?",
        category: "meetup",
        tags: ["study-group", "morning"],
      },
      {
        userId: users[2].id,
        restaurantId: restaurants[10].id,
        title: `Pro tip for ${restaurants[10].name}!`,
        content: "Try the daily specials - they're always amazing and great value!",
        category: "tip",
        tags: ["recommendation", "value"],
      },
    ];

    for (const d of discussionData) {
      await Discussion.create(d);
    }

    console.log("✅ Created sample discussions");
    console.log("\n🌟 Firebase RTDB seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length} (${users.filter(u => u.role === 'admin').length} admin, ${users.filter(u => u.role === 'member').length} members)`);
    console.log(`   - Restaurants: ${restaurants.length} (all with map images)`);
    console.log(`   - Reviews: ${reviewObjs.length}`);
    console.log(`   - Discussions: ${discussionData.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("\n✅ Seeding process finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
