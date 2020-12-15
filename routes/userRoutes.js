const express = require("express");
const userController = require('../controllers/userController.js');
const authController = require('../controllers/authController.js');
const reviewRouter = require('./reviewRoutes');
const houseRouter = require('./houseRoutes');



const router = express.Router();
//Nested Routes
router.use('/:realtorId/review',reviewRouter);
router.use('/:realtorId/houses',houseRouter);


router.post('/signup',authController.signUp);
router.post('/login', authController.login);
router.get('/logout',authController.logOut);

router.post('/forgotpassword',authController.forgotPassword);
router.patch('/resetpassword/:token',authController.resetPassword);
///////////////////////////////////////////
//finding top 3 realtors

//////////////////////////////////////////////////
//adding one middleware for all the actions that comes next
router.use(authController.protect);
////////////////////////////////////////////

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updatemypassword', authController.updatePassword);
router.patch('/updateme', userController.uploadUserPhoto,userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteme',userController.deleteMe);

//////////////////////////////////////////////////
//adding authorization afre this line of code
router.use(authController.restrictTo('admin'));
//////////////////////////////////////////////////

router
  .route('/') 
  .get(userController.getAllUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);



module.exports = router;
