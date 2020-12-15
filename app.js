const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitiz = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const pug = require('pug');
const cookieParser = require('cookie-parser');

const houseRoutes = require('./routes/houseRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const viewRoutes = require('./routes/viewRoutse');
const featureRouter = require('./routes/featureRouter');
const globalErrorHandling = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

//middlewares//********** */
//serving static resourses
app.use(express.static(path.join(__dirname, 'public')));

//contains some secrity middlewares 
//security HTTP headers
// app.use(helmet());

//BODY PARSER == > read data from body to req.body 
app.use(express.json({limit:'10kb'}));
app.use(cookieParser());


//DATA SANITIZATION ==> clean data from any malicious code
//has two step
//DATA SANITIZATION against NOSQL INJECTION 
app.use(mongoSanitiz());
//DATA SANITIZATION against  XSS
app.use(xss());


//RATE LIMITTER ==> creating a limitter midlware
const limiter = rateLimit({
    windowMs: 15*60*1000,
    max:100,
    message:"too many req from this IP please try again after one Hour"
});
app.use('/api',limiter);

//preventing http params pollution
app.use(hpp());

//showing request cookies
app.use((req,res,next) => {
    next();
})

//rendering site template
app.use('/',viewRoutes);
//connecting to the router
app.use('/api/v1/features',featureRouter);
app.use('/api/v1/houses',houseRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews",reviewRoutes);


//handling undefined routes
app.all('*',(req,res,next)=>{
    next(new AppError(`cant find ${req.originalUrl}`,'404'));
})
app.use(globalErrorHandling);


module.exports = app;
