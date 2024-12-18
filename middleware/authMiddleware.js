const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

// @desc    Protect routes by verifying JWT token
// @route   Middleware
// @access  Private
const protect = asyncHandler(async (req, res, next) => {
  let token // Initialize variable to store the token

  if (
    req.headers.authorization && // Checking if authorization header exists
    req.headers.authorization.startsWith('Bearer') // Checking if the token starts with "Bearer"
  ) {
    try {
      // Getting token from header by splitting at space
      token = req.headers.authorization.split(' ')[1]
      // Verifying token using the secret key from environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      // Getting user from the decoded token (user ID)
      req.user = await User.findById(decoded.id).select('-password') // Exclude password from the user object
      if (!req.user) { // If no user is found
        res.status(401) // Return 401 Unauthorized status
        throw new Error('Not authorized') // Throw an error indicating user not authorized
      }

      next() // Proceed to the next middleware or route handler
    } catch (error) {
      console.log(error) // Log any error during token verification
      res.status(401) // Return 401 Unauthorized status
      throw new Error('Not authorized') // Throw error indicating not authorized
    }
  }

  if (!token) { // If no token is provided
    res.status(401) // Return 401 Unauthorized status
    throw new Error('Not authorized') // Throw error indicating not authorized
  }
})


module.exports = { protect }
