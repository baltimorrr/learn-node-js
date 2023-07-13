const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const app = express()
app.use(bodyParser.json())

const PORT = 3000

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/mock-data/tours-simple.json`)
)

const getAllTours = (req, res) => {
  console.log(req.requestTime)
  res.status(200).json({
    status: 'success',
    data: {
      total: tours.length,
      tours,
    },
  })
}

const getTour = (req, res) => {
  const tourId = String(req.params.tourId)
  const tour = tours.find((item) => tourId === req.params.tourId)

  if (!tour) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid ID',
    })
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  })
}

const createNewTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1
  const newTour = { ...req.body, id: newId }

  tours.concat(newTour)

  fs.writeFile(
    `${__dirname}/mock-data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
        err,
      })
    }
  )
}

const updateTour = (req, res) => {
  if (Number(req.params.tourId) > tours.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid ID',
    })
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: 'test patch',
    },
  })
}

// app.get('/api/v1/tours', getAllTours)
// app.post('/api/v1/tours', createNewTour)
// app.get('/api/v1/tours/:tourId', getTour)
// app.patch('/api/v1/tours/:tourId', updateTour)

app.use((req, res, next) => {
  console.log('Hello from middleware')
  next()
})

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

app.route('/api/v1/tours').get(getAllTours).post(createNewTour)
app.route('/api/v1/tours/:tourId').get(getTour).patch(updateTour)

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`)
})
