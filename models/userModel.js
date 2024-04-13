const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide your confirm password'],
    validate: {
      validator: function (el) {
        return el === this.password
      },
      message: 'Password are not the same!',
    },
  },
  passwordChangedAt: Date,
})

userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
  } catch (err) {
    console.log(err)
  }
})

userSchema.methods.correctPassword = async (candidatePass, userPass) => {
  return await bcrypt.compare(candidatePass, userPass)
}

userSchema.methods.changedPasswordAfter = (JWTTimestamp) => {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )

    return JWTTimestamp < changedTimestamp
  }
  return false
}

const User = mongoose.model('User', userSchema)

module.exports = User
