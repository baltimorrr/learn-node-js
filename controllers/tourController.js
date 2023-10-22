const fs = require('fs')
const Tour = require('../models/tourModels')
const APIFeatures = require('../utils/APIFeatures')
const CatchAsync = require('../utils/CatchAsync')

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      message: 'Missing name or price',
    })
  }

  next()
}

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}

exports.getAllTours = CatchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req?.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
  const tours = await features.query

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  })
})

exports.getTour = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req?.params?.tourId)

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  })
})

exports.createNewTour = CatchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body)

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  })
})

exports.updateTour = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req?.params?.tourId, req?.body, {
    new: true,
    runValidators: true,
  })

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404))
  }

  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  })
})

exports.deleteTour = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req?.params?.tourId)

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404))
  }

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

exports.getTourStats = CatchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null,
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    // { $match: { _id: { $ne: 'easy' } } },
  ])

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  })
})

exports.getMonthlyPlan = CatchAsync(async (req, res, next) => {
  const year = Number(req?.params?.year)
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates',
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numTourStarts: -1 } },
  ])

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  })
})
