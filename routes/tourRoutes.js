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
const { protect, restricTo } = require('./../controllers/authController')

// router.param('tourId', checkID)

router.route('/top-5-cheap').get(aliasTopTours, getAllTours)
router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)

router
  .route('/')
  .get(protect, restricTo(['admin', 'lead-guide']), getAllTours)
  .post(checkBody, createNewTour)
router.route('/:tourId').get(getTour).patch(updateTour).delete(deleteTour)

module.exports = router
