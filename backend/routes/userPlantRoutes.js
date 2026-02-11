const { Router } = require("express");
const protect = require("../middleware/authMiddleware"); // only authenticated users can access these routes 
const {
  addUserPlant,
  getUserPlants,
  waterPlant,
  updateUserPlant,
  deleteUserPlant,
} = require("../controllers/userPlantController");

const router = Router();

router.post("/", protect, addUserPlant); // checks before controller 
router.get("/", protect, getUserPlants);
router.post("/:id/water", protect, waterPlant);
router.patch("/:id", protect, updateUserPlant);
router.delete("/:id", protect, deleteUserPlant);

module.exports = router;