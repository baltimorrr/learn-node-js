const dotenv = require('dotenv')
const mongoose = require('mongoose')
const fs = require('fs')
const Tour = require('../models/tourModels')

dotenv.config({ path: './env' })

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then((conn) => {
    console.log(conn)
    console.log('DB connection successful')
  })

const tours = fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    const toursFormat = JSON.parse(tours)
    await Tour.create(toursFormat)
    process.exit()

    console.log('data successfully loaded')
  } catch (error) {
    console.log(error)
  }
}

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany()
    console.log('Date successfully deleted')
    process.exit()
  } catch (error) {
    console.log(error)
  }
}

if (process.argv[2] === '--import') {
  importData()
}

if (process.argv[2] === '--delete') {
  deleteData()
}

console.log(process.argv)
