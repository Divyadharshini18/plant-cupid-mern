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
  res.json(plants);
});

module.exports = router;