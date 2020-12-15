const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require("express");

const House = require('./../models/houseModel');


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'A user must have a username'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'wrong email'],
  },
  photo: {
    type:String,
    default:'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'realtor', 'head-realtor'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please insert password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    //this only works with create and save so keep in mind when using update
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'password are not same',
    },
  },
  changedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    set: val => Math.round(val * 10)/10
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },houseQuantity:{
    type:Number,
    default:0
  },aboutMe:{
    type:String
  },phoneNumber:{
    type:Number
  },whatsappId:{
    type:String
  },
  telegramId:{
    type:String
  }
});

//virtual populate 
//used inside parent 
//have 3 fields 

// userSchema.virtual('houses', {
//   ref: 'House',
//   foreignField:'realtor',
//   localField:'_id',
//   justOne:false,
// });
//a middleware for hiding users that are dis active 
//userSchema.pre(''find,function(next){ ==>>vac ink hameye searchayi k ba find shuru mishan ro 
//darbarbgire az code zir b jaye find estefade miknim
  userSchema.pre(/^find/,function(next){
    //chon k in middleware yek query midware ast 
    //this dar in middware b query eshare dare
    this.find({active:{$ne:false}})
    next();
})

//saving password as a plaintext in DB
//this action should be run between getting the data and saving it to the DB
userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    //encrypting password
    this.password = await bcrypt.hash(this.password,12);
    //delete confrimation password from database
    this.passwordConfirm = undefined;
    next();
})
//updating changedAt field when changing password
userSchema.pre('save',function(next){
  //age k password taghir nakarde va ya ink in user jadid hast boro badi
  if(!this.isModified('password') || this.isNew) return next();
  //dargheyre in surat yani ink password taghir karde ya user jadid nist
  //changedAt ro meghdardehi kon k badan mixaym barresish knm
  this.changedAt = Date.now() - 1000;
  next();
})

//checking passwords and email from DB and Client
//using user password?? because we hide password in DB
userSchema.methods.correcctPassword= async function(candidatePassword,userPassword) {
  return await bcrypt.compare(candidatePassword,userPassword);
}

//checking if password changed afte token issued
userSchema.methods.changedPasswordAfter = async function(JWTTimestamp) {
  if(this.changedAt){
    const changedAtTimeStamp = parseInt(this.changedAt.getTime() / 1000);
    return (changedAtTimeStamp > JWTTimestamp); //true => issued at time ghable az changed password time
  }return false;

}
//generating a random token for reset password functionality
userSchema.methods.createPasswordResetToken = function(){
  //create 32charachter random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  //encrypt reset token and create a new field in schema to store it
  this.passwordResetToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');

  
 //set password reset expires time for exaple 10 min
 this.passwordResetTokenExpires = Date.now() + 10*1000*60;

 //send plaintext of token to the user via email
 return resetToken;
}



const User = mongoose.model('User', userSchema);
module.exports = User;