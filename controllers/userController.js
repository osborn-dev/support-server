const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/userModel')

// @desc    Register a new user
// @route   /api/users
// @access  Public
// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body // Extracting name, email, and password from the request body

  // Validation
  if (!name || !email || !password) { // Ensure all fields are provided
    res.status(400) // Return 400 Bad Request if any field is missing
    throw new Error('Please include all fields') // Throw error indicating missing fields
  }

  // Find if user already exists
  const userExists = await User.findOne({ email }) // Check if a user with the given email already exists

  if (userExists) { // If user exists
    res.status(400) // Return 400 Bad Request status
    throw new Error('User already exists') // Throw error indicating user already exists
  }

  // Hash password
  const salt = await bcrypt.genSalt(10) // Generating salt for password hashing
  const hashedPassword = await bcrypt.hash(password, salt) // Hash the password using the salt

  // Create user
  const user = await User.create({
    name, // Create user with the provided name
    email, // Create user with the provided email
    password: hashedPassword, // Save the hashed password
  })

  if (user) { // If user is successfully created
    res.status(201).json({
      _id: user._id, // Return user's _id
      name: user.name, // Return user's name
      email: user.email, // Return user's email
      token: generateToken(user._id), // Generate and return a token for the user
    })
  } else {
    res.status(400) // Return 400 Bad Request if user creation fails
    throw new error('Invalid user data') // Throw error indicating invalid user data
  }
})

// @desc    Login a user
// @route   /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body // Extracting email and password from the request body

  const user = await User.findOne({ email }) // Finding the user with the provided email

  // Checking user and passwords match
  if (user && (await bcrypt.compare(password, user.password))) { // If user exists and password matches
    res.status(200).json({
      _id: user._id, // Return user's _id
      name: user.name, // Return user's name
      email: user.email, // Return user's email
      token: generateToken(user._id), // Generate and return a token for the user
    })
  } else {
    res.status(401) // Return 401 Unauthorized if credentials are invalid
    throw new Error('Invalid credentials') // Throw error indicating invalid credentials
  }
})

// @desc    Get current user
// @route   /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = { // Construct user object with the authenticated user's details
    id: req.user._id, // User's _id
    email: req.user.email, // User's email
    name: req.user.name, // User's name
  }
  res.status(200).json(user) // Return the user's details as a JSON response with 200 OK status
})

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { // Generating a JWT token using the user's ID and secret key
    expiresIn: '30d', // Set the token expiration time to 30 days
  })
}


module.exports = {
  registerUser,
  loginUser,
  getMe,
}
