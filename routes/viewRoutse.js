const express = require('express');
const viewControllers = require('../controllers/viewsController'); 
const authController = require('../controllers/authController');

const router = express.Router();



router.get('/', authController.isLoggedIn, viewControllers.getOverview);
router.get('/houses', authController.isLoggedIn,viewControllers.getHouses);
router.get('/realtors', authController.isLoggedIn,viewControllers.getRealtors);
router.get('/login', authController.isLoggedIn,viewControllers.getLogInForm);
router.get(
  '/houses/:houseCode',
  authController.isLoggedIn,
  viewControllers.getOneHouse
);
router.get('/me',authController.protect,viewControllers.getUserAcount);
router.get('/updateme', authController.protect,viewControllers.updateUser);

router.get('/newhouse', authController.protect, viewControllers.createNewHouse);

module.exports = router;