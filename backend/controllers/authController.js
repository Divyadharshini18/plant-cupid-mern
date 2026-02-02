const User = require("../models/User"); // Mongoose model for User
const jwt = require("jsonwebtoken"); // used for stateless authentication 

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" }); // jwt.sign(payload, secret, options)

const registerUser = async (req, res) => {
  const { name, email, password } = req.body; // destructuring the name, email, and password from the request body

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "User already exists" }); // 409 resource already exists
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({ 
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    }); // 201 resource created
  } catch (err) {
    res.status(500).json({ message: "Server error during registration" }); // 500 internal server error
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  }

  res.status(401).json({ message: "Invalid credentials" }); // 401 unathorized or invalid credentials
};

module.exports = { registerUser, loginUser }; // making it available for other files