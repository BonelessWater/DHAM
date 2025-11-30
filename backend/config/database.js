// backend/config/database.js
const admin = require("firebase-admin");
require("dotenv").config();

// Avoid re-initializing in dev/hot-reload
if (!admin.apps.length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } else {
    // Local dev fallback: require JSON in repo
    const serviceAccount = require("../serviceAccountKey.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
}

// Realtime Database instance
const db = admin.database();

// Export
module.exports = db;
