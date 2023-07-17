const fs = require('fs')

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../mock-data/tours-simple.json`)
)

exports.checkID = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    })
  }

  next()
}

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      message: 'Missing name or price',
    })
  }

  next()
}

exports.getAllTours = (req, res) => {
  console.log(req.requestTime)
  res.status(200).json({
    status: 'success',
    data: {
      total: tours.length,
      tours,
    },
  })
}

exports.getTour = (req, res) => {
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

exports.createNewTour = (req, res) => {
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

exports.updateTour = (req, res) => {
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
