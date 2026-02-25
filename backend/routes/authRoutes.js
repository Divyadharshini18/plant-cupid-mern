const { Router } = require("express");
const { signupUser, loginUser } = require("../controllers/authController");

const router = Router();

router.post("/signup", signupUser);
router.post("/login", loginUser); // tells which controller function to run when certain URL is hit

module.exports = router;