const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  addUserPlant,
  getUserPlants,
  waterPlant,
} = require("../controllers/userPlantController");

const router = express.Router();

router.post("/", protect, addUserPlant);
router.get("/", protect, getUserPlants);
router.post("/:id/water", protect, waterPlant);

module.exports = router;
