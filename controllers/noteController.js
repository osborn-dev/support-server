const asyncHandler = require('express-async-handler')

const Note = require('../models/noteModel')
const Ticket = require('../models/ticketModel')



// @desc    Get notes for a ticket
// @route   GET /api/tickets/:ticketId/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.ticketId) // Finding the ticket by ticketId from the request params

  if (ticket.user.toString() !== req.user.id) { // Checking if the ticket's user matches the authenticated user
    res.status(401) // Unauthorized status code if users don't match
    throw new Error('User not authorized') // Throw error if the user is not authorized
  }

  const notes = await Note.find({ ticket: req.params.ticketId }) // Fetching all notes associated with the ticket

  res.status(200).json(notes) // Sending the notes as a JSON response with a 200 OK status
})

// @desc    Create ticket note
// @route   POST /api/tickets/:ticketId/notes
// @access  Private
const addNote = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.ticketId) // Finding the ticket by ticketId from the request params

  if (ticket.user.toString() !== req.user.id) { // Checking if the ticket's user matches the authenticated user
    res.status(401) // Unauthorized status code if users don't match
    throw new Error('User not authorized') 
  }

  const note = await Note.create({
    text: req.body.text, // Getting the note text from the request body
    isStaff: false, // Setting isStaff as false (indicating this is a user note, not a staff note)
    ticket: req.params.ticketId, // Associating the note with the ticket using ticketId from request params
    user: req.user.id, // Associating the note with the authenticated user using req.user.id
  })

  res.status(200).json(note) // Sending the created note as a JSON response with a 200 OK status
})

module.exports = {
  getNotes,
  addNote,
}
