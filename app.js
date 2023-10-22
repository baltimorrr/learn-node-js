const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const AppError = require('./utils/AppError')
const globalErrorHandler = require('./controllers/errorController')

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use(express.static(`${__dirname}/public`))

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req?.originalUrl} on this server`, 404))
})

app.use((req, res, next) => {
  console.log('Hello from middleware')
  next()
})

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

app.use(globalErrorHandler)

module.exports = app
