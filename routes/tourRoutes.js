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
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('./../controllers/tourController')

// router.param('tourId', checkID)

router.route('/top-5-cheap').get(aliasTopTours, getAllTours)
router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)

router.route('/').get(getAllTours).post(checkBody, createNewTour)
router.route('/:tourId').get(getTour).patch(updateTour).delete(deleteTour)

module.exports = router
