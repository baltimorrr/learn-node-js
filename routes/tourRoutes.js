const express = require('express')
const router = express.Router()
const {
  getAllTours,
  createNewTour,
  getTour,
  updateTour,
  checkID,
  checkBody,
} = require('./../controllers/tourController')

router.param('tourId', checkID)

router.route('/').get(getAllTours).post(checkBody, createNewTour)
router.route('/:tourId').get(getTour).patch(updateTour)

module.exports = router
