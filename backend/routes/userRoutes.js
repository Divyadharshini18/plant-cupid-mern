const { Router } = require("express");
const protect = require("../middleware/authMiddleware");
const { signupUser } = require("../controllers/authController");
const User = require("../models/User");

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

module.exports = router;