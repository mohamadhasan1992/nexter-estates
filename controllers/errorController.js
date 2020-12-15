const AppError = require('../utils/appError');




const handleExpirationError = () =>
  new AppError('your token had been expired please log in agein', 401);

const handleJwtError = () =>
  new AppError('invalid token please log in again', 401);

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid data inputs, ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
  const message = `${err.keyValue.name} property had been added before`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}.`;

  return new AppError(message, 400);
};

const sendErrDev = (err,req, res) => {
  //when using postman for api
  if(req.originalUrl.startsWith('/api')){
    res.status(err.statusCode).json({
      name: err.name,
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }else{
    //when rendering error
    res.status(err.statusCode).render('error.pug',{
      title:'خطا',
      msg:err.message
    })
  }
};

const sendErrProd = (err,req, res) => {
  //when using API
  if (req.originalUrl.startsWith('/api')) {
    //when using API
    //if error is operational
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //when using API
    //if error is non operational

    return res.status(500).json({
      status: 'error',
      message: 'somthing went wrong',
    });
  }
  //for rendering purpose
  //if error is operational
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      msg: err.message,
    });
  }
  //for rendering purpose
  //if error is non operational
  return res.status(500).render('error', {
    msg: 'خطا بوجود آمده است بعدا تلاش نمایید!',
  });
};


module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //checking environment to choose development or product
  if(process.env.NODE_ENV === 'development'){
        sendErrDev(err,req,res);
        
    }else{
      
      

      if (err.name === 'CastError') {
        err = handleCastErrorDB(err);
      }
      if (err.code === 11000) {
        err = handleDuplicateFields(err);
      }
      if (err.name === 'ValidationError') {
        err = handleValidationError(err);
      }
      if (err.name === 'JsonWebTokenError') {
        err = handleJwtError();
      }
      if (err.name === 'TokenExpiredError') {
        err = handleExpirationError();
      }
      
      sendErrProd(err,req,res);
    }

 
};