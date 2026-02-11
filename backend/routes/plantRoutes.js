const { Router } = require("express");
const Plant = require("../models/Plant");

const router = Router();

router.post("/", async (req, res) => {
  const plant = await Plant.create(req.body);
  res.status(201).json(plant);
});

router.get("/", async (req, res) => {
  const plants = await Plant.find();
  console.log("PLANTS COUNT:", Array.isArray(plants) ? plants.length : 0);
  res.json(plants); // response to client and ends the request
});

module.exports = router;