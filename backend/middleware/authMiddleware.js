const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]; // format : "Bearer eyJhbGciOiJIUzI1NiIs..."
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // { id: user_id, iat: issued_at, exp: expiration_time }
      req.user = decoded.id;
      return next(); // continue to the next middleware or route handler
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

module.exports = protect;