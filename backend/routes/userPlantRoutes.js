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

// Water a plant
router.post("/:id/water", protect, async (req, res) => {
  const userPlant = await UserPlant.findById(req.params.id).populate("plant");

  if (!userPlant) {
    return res.status(404).json({ message: "Plant not found" });
  }

  // Ownership check (important)
  if (userPlant.user.toString() !== req.user) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (userPlant.lastWatered) {
    const last = new Date(userPlant.lastWatered);
    last.setHours(0, 0, 0, 0);

    if (last.getTime() === today.getTime()) {
      return res
        .status(400)
        .json({ message: "Plant already watered today" });
    }
  }

  userPlant.lastWatered = new Date();
  userPlant.wateredHistory.push({ date: new Date() });

  await userPlant.save();

  res.json({
    message: "Plant watered successfully 💧",
    nextWaterInDays: userPlant.plant.waterFrequency,
  });
});