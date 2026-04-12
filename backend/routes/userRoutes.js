const { Router } = require("express");
const protect = require("../middleware/authMiddleware");
const { signupUser } = require("../controllers/authController");
const User = require("../models/User");
const UserPlant = require("../models/UserPlant");

const router = Router();

router.post("/signup", (req, res, next) => {
  console.log("POST /api/users/signup - Request received:", {
    body: { ...req.body, password: "[REDACTED]" },
  });
  signupUser(req, res, next);
});

router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user).select("-password");
  res.json(user);
});

router.delete("/profile", protect, async (req, res) => {
  try {
    await UserPlant.deleteMany({ user: req.user });
    await User.findByIdAndDelete(req.user);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;