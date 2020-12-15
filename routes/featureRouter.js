const express = require('express');
const authController = require('../controllers/authController');
const featuresController = require('../controllers/featuresController');

const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    featuresController.createFeature
  )
  .get(featuresController.getAllFeatures);
router
    .route('/:id')
    .patch(featuresController.updateFeature);

module.exports = router;