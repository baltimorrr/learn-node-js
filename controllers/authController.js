const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const CatchAsync = require('./../utils/CatchAsync')
const AppError = require('./../utils/AppError')
const { promisify } = require('util')

const signToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

exports.signup = CatchAsync(async (req, res, next) => {
  const newUser = await User.create(req?.body)

  const token = signToken({
    id: newUser._id,
  })

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  })
})

exports.login = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body || {}

  // 1. check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
  }
  // 2. check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password')
  const correct = await user.correctPassword(password, user.password)

  if (!user || !correct) {
    return next(new AppError('Incorrecting email or password', 401))
  }
  // 3. if everything ok, send token to client
  const token = signToken({
    id: user._id,
  })
  res.status(200).json({
    status: 'success',
    token,
  })
})

exports.protect = CatchAsync(async (req, res, next) => {
  let token
  // 1. getting token and check of it's here
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    )
  // 2. verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3. check if user still exists
  const freshUser = await User.findById(decoded.id)
  if (!freshUser) {
    return next(
      new AppError('The token belonging to this user does no longer exist', 401)
    )
  }

  // 4. check if user changed password after JWT was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    )
  }

  req.user = freshUser
  next()
})
