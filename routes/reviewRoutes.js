const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//when using nested routes we should use merge params
const router = express.Router({ mergeParams:true });


router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setUserAndRealtorId,
    reviewController.createReview
  );

  router.use(authController.protect);
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('admin','user'), reviewController.updateReview)
  .delete(authController.restrictTo('admin','user'), reviewController.removeReview);

  module.exports=router;
