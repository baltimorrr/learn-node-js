const express = require('express')
const router = express.Router()
const {
  getAllTours,
  createNewTour,
  getTour,
  updateTour,
  checkID,
  checkBody,
  deleteTour,
} = require('./../controllers/tourController')

// router.param('tourId', checkID)

router.route('/').get(getAllTours).post(checkBody, createNewTour)
router.route('/:tourId').get(getTour).patch(updateTour).delete(deleteTour)

module.exports = router
