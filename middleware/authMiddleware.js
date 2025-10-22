const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

const protect = async (req, res, next) => {
  let token;

  // Check if the token is in the headers and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID from the token and attach it to the request object
      // We exclude the password from being attached
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move on to the next step (the actual controller)
    } catch (error) {
      console.error(error);
      res.status(401); // Not authorized
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

module.exports = { protect };