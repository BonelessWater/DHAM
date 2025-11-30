const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();


// const { syncDatabase } = require('./models');

// Import routes
const restaurantsRouter = require("./routes/restaurants");
const favoritesRouter = require("./routes/favorites");
const reviewsRouter = require("./routes/reviews");
const discussionsRouter = require("./routes/discussions");
const matchesRouter = require("./routes/matches");
const recommendationsRouter = require("./routes/recommendations");
const usersRouter = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for Flutter web assets
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://10.0.2.2:8000", // Android emulator
      "http://localhost:8000", // Flutter web
    ],
    credentials: true,
  })
);

app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Flutter static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "DHAM API is running on port 8000",
    timestamp: new Date().toISOString(),
  });
});

// Test API endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "Frontend-Backend connection successful!",
    data: {
      server: "Express.js",
      port: PORT,
      environment: process.env.NODE_ENV || "development",
    },
  });
});

// Register API routes
app.use("/api/restaurants", restaurantsRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/discussions", discussionsRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/users", usersRouter);

// Catch-all route - MUST BE LAST
// This handles Flutter web routing (SPA)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server (no DB sync needed for Firebase RTDB)
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 DHAM API server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
    console.log(`🎨 Flutter app: http://localhost:${PORT}/`);
    console.log(`\n📚 Available API endpoints:`);
    console.log(`   - /api/restaurants - Restaurant CRUD and filtering`);
    console.log(`   - /api/favorites - User favorites management`);
    console.log(`   - /api/reviews - Restaurant reviews`);
    console.log(`   - /api/discussions - Discussion boards`);
    console.log(`   - /api/matches - User matching system`);
    console.log(`   - /api/recommendations - Personalized recommendations`);
    console.log(`   - /api/users - User authentication and profiles`);
  });
};

startServer();

module.exports = app;
