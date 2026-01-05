const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

// CORS configuration - must be after app is created
app.use(cors());
app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Plant Cupid backend is running 🌱");
});

const PORT = process.env.PORT || 5000;

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const plantRoutes = require("./routes/plantRoutes");
app.use("/api/plants", plantRoutes);

const userPlantRoutes = require("./routes/userPlantRoutes");
app.use("/api/user-plants", userPlantRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

