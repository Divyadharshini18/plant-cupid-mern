const { Router } = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser); // tells which controller function to run when certain URL is hit

module.exports = router;