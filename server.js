const app = require('./app')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({ path: './env' })

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then((conn) => {
    console.log(conn)
    console.log('DB connection successful')
  })

const PORT = 3000

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`)
})

process.on('unhandledRejection', (err) => {
  console.log(err?.name, err?.message)
  console.log('UNHANDLER REJECTION!')

  server.close(() => {
    process.exit(1)
  })
})

process.on('uncaughtException', (err) => {
  console.log(err?.name, err?.message)
  console.log('UNHANDLER EXCEPTION! Shutting down...')

  server.close(() => {
    process.exit(1)
  })
})
