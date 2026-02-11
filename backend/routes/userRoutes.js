const { Router } = require("express");
const protect = require("../middleware/authMiddleware");
const { registerUser } = require("../controllers/authController");
const User = require("../models/User");

const router = Router();

router.post("/register", (req, res, next) => {
  console.log("POST /api/users/register - Request received:", {
    body: { ...req.body, password: "[REDACTED]" },
  });
  registerUser(req, res, next);
});

router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user).select("-password");
  res.json(user);
});

module.exports = router;