const AppError = require('./../utils/AppError')

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`

  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
  const value = err?.errmsg.match(/(["'])(\\?.)*?\1/)
  const message = `Duplicate field value: ${value}. Please use another value`
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((item) => item?.message)
  const message = `Invalid input data. ${errors.join('. ')}`

  return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  })
}

const sendErrorProd = (err, res) => {
  if (!err.isOperational) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    })
    return
  }

  console.error('Error', err)

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  })
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err }

    if (error.name === 'CastError') error = handleCastErrorDB(err)

    if (error.code === 11000) error = handleDuplicateFieldsDB(err)

    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)

    sendErrorProd(error, res)
    return
  }

  sendErrorDev({ ...err }, res)
}
