const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

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


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

