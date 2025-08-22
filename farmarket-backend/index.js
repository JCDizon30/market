const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // ✅ Needed for serving static files

const userRoutes = require("./routes/User");
const produceRoutes = require("./routes/Produce");

const PORT = process.env.PORT || 4000;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/farmarket");

mongoose.connection.once("open", () => console.log("Connected to MongoDB"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB connection error:", err));

// Server setup
const app = express();

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploads folder statically so frontend can access images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect routes
app.use("/users", userRoutes);
app.use("/produces", produceRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("🌾 FARMARKET Backend is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`API is now online on port ${PORT}`);
});

module.exports = { app, mongoose };
