const mongoose = require('mongoose');
const User = require('./userModel');



const reviewSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Review can not be empty'],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 2.5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    reviewCreater:{
      type:String,
      required:[true,'A review should have a creater']
    },
    realtor: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'a Review must belong to a Realtor'],
    }]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//preventing duplicate review for a realtor
//each user can send just one review for a specified Realtor
reviewSchema.index({realtor:1 , reviewCreater:1},{ unique:true });

//STATIC method 
reviewSchema.statics.calcAverage = async function(realtorId){
  const stats = await this.aggregate([
    {
      $match: { realtor: realtorId },
    },
    {
      $group: {
        _id: '$realtor',
        ratingAvg: { $avg: '$rating' },
        ratingQ: { $sum: 1 },
      },
    },
  ]);
  //stats is a array 
  if(stats.length>0){
    await User.findByIdAndUpdate(realtorId, {
      ratingAverage: stats[0].ratingAvg,
      ratingQuantity: stats[0].ratingQ,
    });
  }else{
    await User.findByIdAndUpdate(realtorId, {
      ratingAverage: 4.5,
      ratingQuantity: 0,
    });
  }
  
}
//===============> average and quantity of rating for create review <===========
//this.realtor grabs the realtor id of current review
//this => refers to the current review
//constructor => refers to the review model
reviewSchema.post('save',async function(){
  await this.constructor.calcAverage(this.realtor);
})
//===============> average and quantity of rating for update and delete <===========
reviewSchema.pre(/^findOneAnd/,async function(next){
  //grab review from query middleware
  //and stick it to the this variable
  this.r = await this.findOne();
  next();
  
})
//update average and quantity of ratings after creation of review
reviewSchema.post(/^findOneAnd/,async function(){
  //takes review from pre middleware and call the calcAverage function
  //this.findOne does not work here the query has been excuted
  await this.r.constructor.calcAverage(this.r.realtor);
})


reviewSchema.pre(/^find/,function(next){
    this.populate({
      path:'realtor'
      ,select:"username role"
    });
    next();
})

const Review = mongoose.model('Review',reviewSchema);
module.exports = Review;