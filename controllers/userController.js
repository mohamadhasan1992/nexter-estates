const multer = require('multer');
const sharp = require('sharp');
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');


//when using multer devide it to multerStorage and multerFilter
//cb yjur tabe hast k argomane daxelsheo barmigardune
//yjuri mese next too expreesse
// const multerStorage = multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'public/img/users')
//   },filename:(req,file,cb)  => {
//     // const ext = file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.jpeg`)
//   }
// });
const multerStorage = multer.memoryStorage();
const multerFilter = (req,file,cb) => {
  if(file.mimetype.startsWith('image')){
    cb(null,true)
  }else{
    cb(new AppError(' فقط می توانید تصویر را آپلود کنید',400),false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
//using sharp package for processing image
exports.uploadUserPhoto = upload.single('photo');
//a miidleware for resizing image
exports.resizeUserPhoto = catchAsync(async(req,res,next) => {
  if(!req.file) return next();
  
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  
  await sharp(req.file.buffer)
  .resize(500,500)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`public/img/users/${req.file.filename}`);
  next();
});





const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach( el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj;
}
////////////////////////////////////
//top 3 realtors
exports.topRealtors = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = 'ratingAverage';
  next();
};

exports.getMe = (req,res,next) => {
  req.params.id = req.user.id;
  next();
}
//updating currently loged in user
exports.updateMe = catchAsync(async (req, res, next) => {
 
  //create error if user wants to update password
  if(req.body.password || req.body.passwordConfirm) 
  return next(new AppError('this route is not for password updates',400))
  //update user document
  //fieldhaii k mituunan update beshan ro entexab mikone 
  const filteredBody = filterObj(req.body,'username','email','phoneNumber','whatsappId','telegramId','aboutMe');
  if(req.file) filteredBody.photo = req.file.filename;
  //GET user
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {new:true,runValidators:true}
  );

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser
    }
  });
});
//deleting user account
exports.deleteMe = catchAsync(async (req, res, next) => {
  const newUser = await User.findByIdAndUpdate(req.user.id,{active:false});

  res.status(204).json({
    status: 'success',
    data: null
  });
});

//factory handler
exports.getAllUser = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
