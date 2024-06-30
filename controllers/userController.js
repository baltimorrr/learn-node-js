const User = require('../models/userModel')
const AppError = require('../utils/AppError')
const CatchAsync = require('../utils/CatchAsync')

const filterObj = (obj, allowedFields) => {
  const newObj = {}

  Object.keys(obj).forEach((it) => {
    if (allowedFields.includes(it)) newObj[it] = obj[it]
  })

  return newObj
}

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  })
}

exports.updateMe = CatchAsync(async (req, res, next) => {
  // 1. create error if user post password datat
  if (req?.body?.password || req?.body?.confirmPassword)
    return next(
      new AppError(
        'This route is not for password updates. Please use updateMyPassword instead.',
        400
      )
    )

  // 2. update user document
  const filteredBody = filterObj(req?.body, ['name', 'email'])
  const updatedUser = await User.findByIdAndUpdate(
    req?.user?.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  )

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  })
}

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  })
}

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  })
}

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  })
}
