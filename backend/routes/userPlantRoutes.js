const express = require("express");
const protect = require("../middleware/authMiddleware");
const UserPlant = require("../models/UserPlant");

const router = express.Router();

// Add plant to user
router.post("/", protect, async (req, res) => {
  const { plantId, nickname } = req.body;

  const userPlant = await UserPlant.create({
    user: req.user,
    plant: plantId,
    nickname,
  });

  res.status(201).json(userPlant);
});

// Get user's plants
router.get("/", protect, async (req, res) => {
  const plants = await UserPlant.find({ user: req.user }).populate("plant");
  res.json(plants);
});

module.exports = router;