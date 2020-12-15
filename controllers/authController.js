const JWT = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');


const AppError = require('../utils/appError');
const catchAsync = require("../utils/catchAsync");
const User = require('../models/userModel');
const Email = require('../utils/email');


//creating token function
const createToken = id => {
    return JWT.sign({ id }, process.env.SECRET_JWT, {
      expiresIn: process.env.EXPIRATION_JWT,
    });
} 

//create token and send to user
const createSendToken = (user,statusCode,res)=>{
   const token = createToken(user._id);

   const cookieOptions = {
     expires: new Date(
       Date.now() + process.env.EXPIRATION_JWT_COOKIE * 24 * 60 * 60 * 1000
     ),
    //  secure: true,
     httpOnly: true
   };
   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
   user.password = undefined;
   res.status(statusCode).json({
     status: 'success',
     token,
     data:{user}
   });
}

//creating web token and send it to the client
exports.signUp = catchAsync(async(req,res,next)=>{
    const newUser = await User.create({
        //avoiding Users to take a roll
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      changedAt:req.body.changedAt,
      role:req.body.role
    });
    //creating email
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser,url).sendWelcome();
    //creating token with jwt.sign EXPLORE jwt github
    createSendToken(newUser,201,res);
    // const token = createToken(newUser._id);

    // res.status(201).json({
    //     status:'success',
    //     token,
    //     data:{
    //         newUser
    //     }
    // })
})

//sending pass and email and jwt to the server and  control the access
exports.login = catchAsync(async(req,res,next)=>{
  const { email, password } = req.body;

  //1/if email and password exist
  if (!email || !password)
    return next(new AppError('اطلاعات شما یافت نشد!', 400));

  //2/check if the User exist and if the password is correct
  //when the client get the User info from database the information doesnot
  //contain password because of our UserModel that password +> select:false
  //so when we want to finde User we should add .select('+password)
  const user = await User.findOne({ email }).select('+password');

  //compare password and email that comes from client and DB <== do it in the userModel
  //mige age realto too xatte bala vujud nadashte bashe xatte paiini k commentesh krdm kar nmikone
  //pas vac hamin xatte paino barmidare va mibare to sharte if k xatte paiine
  //const correct = await user.correcctPassword(password, user.password);
  if (!user || !(await user.correcctPassword(password, user.password)))
    return next(new AppError('آدرس الکترونیک یا رمز عبور شما نادرست است!', 401));
  //3/if everything is ok send token to client
  createSendToken(user,201,res);
  
})


//access control middleware function
//when a reltor wants to post or delete or updare a property
//first he should be authenticated
exports.protect = catchAsync(async(req,res,next)=> {
    //1-get users token and check if it exist
    //estefade kardan az Bearer ye standard ast k vac authorization estefade mishe
    console.log('i checking if you logged in');
    let token;
    if(req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){
      token = req.cookies.jwt;
    }
    if(!token){
        return next(new AppError('you are not logged in please login to get access',401))
    }
    //2-validate token
    //using JWT verify function => this returns promise
    //amalkarde verify intorire k aval 2ta argomane avalo verify mikone
    //age ok bud mire argomane 3om k y callback function ast ro ejra mikone
    //b ebarati y async hast vac hamin az promisify estefade mikonim k y methode built in node ast
    //validation process should returns user id and iat and exp
    const decoded = await promisify(JWT.verify)(token, process.env.SECRET_JWT);
    
    //3-check if user still exist
    const newUser = await User.findById(decoded.id);
    if(!newUser) 
    return next(new AppError('there is not any User with such token',401));

    //4-if User changes password after token was issued
    if(await newUser.changedPasswordAfter(decoded.iat)){
        
            return next(
              new AppError(
                'User recently changed password please log again',
                401
              )
            );
    }
    //granting access to the next middleware
    req.user = newUser;
    res.locals.user = newUser;
    next();
})
//creating a middleware for logged in users
//to grant them access to templates
exports.isLoggedIn = async (req, res, next) => {
  
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(JWT.verify)(
        req.cookies.jwt,
        process.env.SECRET_JWT
      );
    
      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // 3) Check if user changed password after the token was issued
      if (await currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    }catch (err){
      return next();
    }
  }
  next();
};
exports.logOut = (req,res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    //  secure: true,
     httpOnly: true
  });
  res.status(200).json({
    status: 'success',
  });
}
//implementing role base authorization
//we can not add extra argument inside the middleware function
//so we create a rapper function that catch the roles and return the midlleware function
exports.restrictTo = (...roles) => {
  return (req,res,next)=>{
    console.log(req.user.role);
    //roles=['admin','head-user']
    if(!roles.includes(req.user.role)){
      return next(new AppError(' شما قادر به انجام چنین عملیاتی نیستید.',403));
    }
    //go to next middleware that is delet house
    next();
  }
}

//reset password functionality
//step1) input is email and recieves a token from server
//step2) user sends token with updated password to the server
exports.forgotPassword = catchAsync(async(req,res,next) =>{
  //get user based on email
  const user = await User.findOne({email: req.body.email})
  
  if(!user){
    return next(new AppError('اطلاعات برای چنین کاربری یافت نشد',404)); 
  }
  //generate random token
  //Do it inside of user Model
  const resetToken = user.createPasswordResetToken();
  //hala baraye ink passwordtoken va passwordTokenExpires k ba methode bala ijad mishe
  //ro daxele DB save konim baraye inkar bayad hameye validatorhaye DB ro gheyre faal konim
  await user.save({validateBeforeSave:false});

  //send token back to user via email
  //server should send a reset url to the client 
  //url contains reset token
  
  //sending email
  try{
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/reltors/resetpassword/${resetToken}`;
    await new Email(user,resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'token send to email',
    });
  }catch(err){
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires=undefined;
    await user.save({validateBeforeSave:false});
    return next(new AppError(err.message,500))
  }
  

});
exports.resetPassword =catchAsync(async(req,res,next) =>{
  //1-get user based on token
  //darvaghe oon tokeni k daste user hast(req.params.token) ro
  //ba tokeni k daxele DB hast bayad moghayese konim
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    //mongoDB find method takes two argument one is for query asn second for projection
  const user = await User.findOne(
    { passwordResetToken: hashedToken ,
    passwordResetTokenExpires: { $gt:Date.now()} } 
  );
  //2-if token has not expired and user exist
  if (!user)
    return next(new AppError('token is invalid or has been expired', 400));
  //set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetTokenExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save(); //mixaim k inja validate she vac hamin off nakardim

  //3-update changedAt property of user
  //go to user model

  //4-log the user in send yoken to the client
  createSendToken(user,201,res);
  
})

//updating password when the users want
exports.updatePassword = catchAsync(async(req,res,next) => {
  //1-get user from DB
  const newUser =  await User.findById(req.user.id).select('+password');
  
  //2-check if posted password is correct
  //compare req.body.password vs. DB password
  if(!await newUser.correcctPassword(req.body.passwordCurrent,newUser.password)){
    return next(new AppError('invalid password', 401));
  }
  //3 update password
  newUser.password = req.body.password;
  newUser.passwordConfirm = req.body.passwordConfirm;
  await newUser.save();

  //4-log in user --- send token to the user
  createSendToken(newUser,201,res);
})