const express = require('express');
const houseController = require('../controllers/houseControllers');
const authController = require('../controllers/authController');

const router = express.Router( { mergeParams:true } );



//special routes
router
  .route('/5-cheap-house')
  .get(houseController.houseFiveCheap, houseController.getAllHouse);
//geospatial Router
router
  .route('/house-within/:distance/center/:latlng/unit/:unit')
  .get(houseController.findNearHouses);
  router
    .route('/distances/:latlng/unit/:unit')
    .get(houseController.getDistances);

router
  .route('/')
  .get(houseController.getAllHouse)
  .post(
    authController.protect,
    authController.restrictTo('admin','realtor'),
    houseController.setRealtorId,
    houseController.createHouse
  );
router
  .route('/:id')
  .get( houseController.getHouse)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'realtor'),
    houseController.uploadHouseImg,
    houseController.resizeHouseImage,
    houseController.updateHouse
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'realtor'),
    houseController.removeHouse
  );




  module.exports = router;


