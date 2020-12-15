const sharp = require('sharp');
const multer = require('multer');
const House = require('../models/houseModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError(' فقط می توانید تصویر را آپلود کنید', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadHouseImg = upload.fields([
  {name:'imageCover', maxCount:1},
  {name:'images',maxCount:6}
]);
exports.resizeHouseImage = catchAsync(async(req,res,next) => {
  if(!req.files.imageCover || !req.files.images) return next();
  const imageCoverFilename = `house-${req.params.id}-${Date.now()}-cover.jpeg`;
  //processing cover image
  await sharp(req.files.imageCover[0].buffer)
    .resize(1000, 1000)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/houses/${imageCoverFilename}`);
    //adding imageCover name to the req.body
    //to send it to next middleware
    req.body.imageCover = imageCoverFilename;
  //processing images
  req.body.images =[];
  await Promise.all(
    req.files.images.map(async(file,i) => {
      const filename = `house-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
      await sharp(file.buffer)
      .resize(1000, 1000)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/houses/${filename}`);
      
    req.body.images.push(filename);
  })
  );
  next();
});

exports.houseFiveCheap = (req,res,next)=>{
  req.query.limit = '5';
  req.query.sort = '-price,rooms';
  next();
}

//set the houseCreator variable middleware
exports.setRealtorId = (req,res,next) => {
  if(!req.body.realtor) req.body.realtor = req.params.realtorId;
  next();
}

exports.getAllHouse = factory.getAll(House);
//getOne takes a model and populate options
exports.getHouse = factory.getOne(House, { path: 'realtor' });
exports.createHouse = factory.createOne(House);
exports.updateHouse = factory.updateOne(House);
exports.removeHouse = factory.deleteOne(House);

//geodpatial functionality
//'/house-within/:distance/center/:latlng/unit/:unit'
exports.findNearHouses = catchAsync(async (req, res, next) => {
  const {distance, latlng, unit} = {...req.params};
  const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;
  const [lat,lng] = latlng.split(',');
  if(!lat || !lng) 
  return next(new AppError('please insert lat and lng in the lat,lng format',400));
  //geospatial find method
  const houses = await House.find({
    location:{
      $geoWithin:{
        $centerSphere:[[lng,lat],radius]
      }
    }
  });
  res.status(200).json({
    status: 'success',
    data: {
      houses,
    },
  });
});
exports.getDistances = catchAsync(async (req,res,next) => {
  const { latlng, unit } = { ...req.params };
  const [lat, lng] = latlng.split(',');
  const multiplier = unit==='mi'? 0.000621371 : 0.001; 
  if (!lat || !lng)
    return next(
      new AppError('please insert lat and lng in the lat,lng format', 400)
    );
    //House distance calculation
    const distances = await House.aggregate([
      {
        //one single stage for geospatial
        //$geoNear
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          title: 1,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        distances,
      },
    });

})