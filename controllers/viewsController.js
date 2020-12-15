const catchAsync = require('../utils/catchAsync');
const House = require('../models/houseModel');
const User = require('../models/userModel');
const Features = require('../models/featureModel');
const AppError = require('../utils/appError');



exports.getOverview = catchAsync(async(req, res,next) => {
  const features = await Features.find().limit(6);  
  const houses = await House.find().limit(6);
  const realtors = await User.find().sort({houseQuantity:-1}).limit(3);

  res.status(200).render('overview.pug', {
    title: 'ترکانه',
    realtorBoxTitle:'مشاوران برتر',
    houses,
    features,
    realtors
  });
});
exports.getHouses = catchAsync(async (req, res, next) => {
    const houses = await House.find();
    const realtors = await User.find().sort({ houseQuantity: -1 }).limit(3);
    
  res.status(200).render('houses.pug', {
    title: 'املاک',
    realtorBoxTitle: 'مشاوران برتر',
    houses,
    realtors,
  });
});
exports.getOneHouse = catchAsync(async (req, res, next) => {
  const house = await House.findOne({houseCode:req.params.houseCode});
  if(house) {
    res.status(200).render('houseDetails.pug', {
      realtorBoxTitle: 'مشاور',
      title: house.title,
      house,
      realtor:house.realtor
    });
  }else{
    next(new AppError('چنین سندی وجود ندارد!','404'));
  }
});
exports.getRealtors = catchAsync(async(req, res,next) => {
  const realtors = await User.find().sort({houseQuantity:-1});

  res.status(200).render('realtor.pug', {
    title: 'مشاوران',
    realtors
  });
});


exports.getLogInForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login.pug', {
    title: 'ورود',
  });
});
exports.getUserAcount = (req,res)=>{
  res.status(200).render('account',{
    title:'حساب کاربری'
  })
};

exports.updateUser = catchAsync(async (req, res, next) => {
  // const updatedUser = User.findByIdAndUpdate(
  //   req.user.id,
  //   {
  //     username:req.body.username,
  //     email:req.body.email
  //   },{
  //     new:true,
  //     runValidators:true
  //   });

  res.status(200).render('account', {
    title: 'تنظیمات'
    
  });
}); 

exports.createNewHouse = (req,res)=>{
  res.status(200).render('newHouse', {
    title: 'ایجاد خانه جدید',
  });
}