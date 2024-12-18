const asyncHandler = require('express-async-handler')

const Ticket = require('../models/ticketModel')



// @desc    Get user tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user.id }) // Fetching all tickets associated with the authenticated user

  res.status(200).json(tickets) // Return the tickets as a JSON
})

// @desc    Get user ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id) // Finding the ticket by its ID from the request parameters

  if (!ticket) { // If ticket not found
    res.status(404) 
    throw new Error('Ticket not found') // Throwing error indicating ticket was not found
  }

  if (ticket.user.toString() !== req.user.id) { // Checking if the ticket belongs to the authenticated user
    res.status(401) // Returning 401 Unauthorized if users don't match
    throw new Error('Not Authorized') // Throw error if user is not authorized
  }

  res.status(200).json(ticket) // Returning the ticket as a JSON response with a 200 OK status
})

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { product, description } = req.body // Destructuring product and description from request body

  if (!product || !description) { // Checking if both product and description are provided
    res.status(400) // Returning 400 Bad Request status code if either field is missing
    throw new Error('Please add a product and description') // Throwing error for missing fields
  }

  const ticket = await Ticket.create({
    product, // Setting product for the ticket
    description, // Setingt description for the ticket
    user: req.user.id, // Associating the ticket with the authenticated user
    status: 'new', // Setting the initial status of the ticket to 'new'
  })

  res.status(201).json(ticket) // Return the created ticket as a JSON response with a 201 Created status
})

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id) // Finding the ticket by its ID from the request parameters

  if (!ticket) { // If ticket not found
    res.status(404) // Return 404 status code
    throw new Error('Ticket not found') // Throw error indicating ticket was not found
  }

  if (ticket.user.toString() !== req.user.id) { // Checking if the ticket belongs to the authenticated user
    res.status(401) // Return 401 Unauthorized if users don't match
    throw new Error('Not Authorized') // Throw error if user is not authorized
  }

  await ticket.remove() // Removing the ticket from the database

  res.status(200).json({ success: true }) // Return a success message as a JSON response with a 200 OK status
})

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id) // Finding the ticket by its ID from the request parameters

  if (!ticket) { // If ticket not found
    res.status(404) // Return 404 status code
    throw new Error('Ticket not found') // Throw error indicating ticket was not found
  }

  if (ticket.user.toString() !== req.user.id) { // Checking if the ticket belongs to the authenticated user
    res.status(401) // Return 401 Unauthorized if users don't match
    throw new Error('Not Authorized') // Throw error if user is not authorized
  }

  const updatedTicket = await Ticket.findByIdAndUpdate( // Updating the ticket with new data from the request body
    req.params.id, // The ticket ID to be updated
    req.body, // The new data to update the ticket with
    { new: true } // Return the updated ticket in the response
  )

  res.status(200).json(updatedTicket) // Return the updated ticket as a JSON response with a 200 OK status
})

module.exports = {
  getTickets,
  getTicket,
  createTicket,
  deleteTicket,
  updateTicket,
}
