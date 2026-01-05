const express = require("express");
const Plant = require("../models/Plant");

const router = express.Router();

// TEMP: create plant (later admin-only)
router.post("/", async (req, res) => {
  const plant = await Plant.create(req.body);
  res.status(201).json(plant);
});

// Get all plants
router.get("/", async (req, res) => {
  const plants = await Plant.find();

  // Log count to verify full array is returned (no filtering here)
  console.log("PLANTS COUNT:", Array.isArray(plants) ? plants.length : 0);

  // Return the full array as-is
  res.json(plants);
});

module.exports = router;