const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const CatchAsync = require('./../utils/CatchAsync')
const AppError = require('./../utils/AppError')
const sendEmail = require('./../utils/email')
const { promisify } = require('util')
const crypto = require('crypto')

const signToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken({
    id: user._id,
  })

  const cookieOptions = {
    expires:
      new Date(Date.now()) +
      process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000,
    httpOnly: true,
  }

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
  res.cookie('jwt', token, cookieOptions)

  // remove password from output
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}

exports.signup = CatchAsync(async (req, res, next) => {
  const newUser = await User.create(req?.body)

  createSendToken(newUser, 201, res)
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
  createSendToken(user, 200, res)
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

exports.restricTo = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      )
    }

    next()
  }
}

exports.forgotPassword = CatchAsync(async (req, res, next) => {
  // 1. Get user based on POSTED email
  const user = await User.findOne({ email: req.body.email })
  if (!user)
    return next(new AppError('There is no user with email address', 404))

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // 3. Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`

  const message = `Forgot your password? Submit a PATCH request with 
  your new password and passwordConfirm to: ${resetURL}.\n 
  If you didn't forget your password, please ignore this email!`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10min)',
      message,
    })

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError(
        'There was an error sending the email. Please try again later!',
        500
      )
    )
  }
})

exports.resetPassword = async (req, res, next) => {
  // 1. get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  // 2. if token has not expired, and there is user, set the new password
  if (!user) return next(new AppError('Token is invalid or has expired', 400))

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = req.body.passwordResetToken
  user.passwordResetExpires = req.body.passwordResetExpires
  await user.save()

  // 3. update changedPasswordAt property for the user

  // 4. Log the user in, send JWT
  createSendToken(user, 200, res)
}

exports.updatePassword = CatchAsync(async (req, res, next) => {
  // 1. get user from collection
  const user = await User.findById(req?.user?.id).select('+password')
  // 2. check if posted current password is correct
  const isCorrectPassword = await user.correctPassword(
    req?.body?.passwordCurrent,
    user?.password
  )

  if (!isCorrectPassword)
    return next(new AppError('Your current password is wrong.', 401))

  // 3. if so, update password
  user.password = req?.body?.password
  user.passwordConfirm = req?.body?.passwordConfirm
  await user.save()

  // 4. log user in, send JWT
  createSendToken(user, 200, res)
})
