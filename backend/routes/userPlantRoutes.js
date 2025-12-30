const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  addUserPlant,
  getUserPlants,
  waterPlant,
  updateUserPlant,
  deleteUserPlant,
} = require("../controllers/userPlantController");

const router = express.Router();

router.post("/", protect, addUserPlant);
router.get("/", protect, getUserPlants);
router.post("/:id/water", protect, waterPlant);
router.patch("/:id", protect, updateUserPlant);
router.delete("/:id", protect, deleteUserPlant);

module.exports = router;
