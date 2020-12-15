const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/APIFeatures');


exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //nested routes for review
    let filter = {};
    if (req.params.realtorId) filter = { realtor: req.params.realtorId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //mongoose query constructor
    const document = await features.query;
    res.status(200).json({
      status: 'success',
      result: document.length,
      data: {
        document,
      },
    });
  });


exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);
    const document = await query;

    if (!document) {
      return next(new AppError('we couldnt find this property', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });


exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    
    const document = await Model.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });
  
  exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
      const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!document)
        return next(
          new AppError('there isnt any document that you are looking for', 404)
        );

      res.status(200).json({
        status: 'success',
        data: {
          document,
        },
      });
      
    });


exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('this document had been removed before', 404));
    }
    res.status(204).json({
      status: 'success',
     
    });
  });

  

    
  
  
  