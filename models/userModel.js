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

const User = mongoose.model('User', userSchema)

module.exports = User
