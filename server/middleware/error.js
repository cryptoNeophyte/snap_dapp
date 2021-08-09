const ErrorResponse = require('../utils/errorResponse')

// express error handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err }

  error.message = err.message
  // log to the console for development
  console.log('error', error)

  // Mongoose bad object ID
  if (err.name === 'CastError') {
    const message = 'Resources not found'
    error = new ErrorResponse(message, 404)
  }

  // mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered'
    error = new ErrorResponse(message, 200)
  }

  // Mongoose Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message)
    error = new ErrorResponse(message, 400)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  })
}

module.exports = errorHandler // this is a middleware and for using it we have to use it through app.use()
