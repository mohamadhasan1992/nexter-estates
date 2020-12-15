const mongoose  = require("mongoose");
const User = require('./userModel');



const houseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A property must have a title'],

    trim: true,
  },houseCode:{
    type:Number
  },
  area: {
    type: Number,
    required: [true, 'A property must have a area'],
  },
  type: {
    type: String,

    enum: ['residential', 'commercial', 'luxury'],
    default: 'residential',
  },floor:{
    type:Number
  },
  category: {
    type: String,
    required: [true, 'A property must have a category'],
    enum: ['apartment', 'villa', 'pentHouse'],
    default: 'apartment',
  },
  rooms: {
    type: Number,
    required: [true, 'A property must have room'],
  },
  parking: Boolean,
  propertyStatus: {
    type: String,
    enum: ['for sale', 'for rent'],
    required: [true, 'A property must have a status'],
    default: 'for sale',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  price: {
    type: Number,
    required: [true, 'A property must have a price'],
    default: 2000,
  },
  location: {
    //GeoJSON
    type: {
      type: String,
      default: 'Point', //polygans // lines //oyher gemetry ==> i need just points
      enum: ['Point'],
    },
    coordinates: [Number], //we expect an array of numbers //lang and lat Point
    address: {
      type: String,
      //required: [true, 'A property must have a address'],
    },
    city: {
      type: String,
      //required: [true, 'A property must have a city'],
    },
    
  },
  discription: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    //required: [true, 'a property must have a image cover'],
  },
  images: [String],
  realtor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'a House should have a houseCreator'],
  },
});
//geospatiual indexing
houseSchema.index({location:'2dsphere'});
houseSchema.index({price:1});

houseSchema.statics.countHouse = async function(realtorId){
  const stats = await this.aggregate([
    {
      $match: { realtor: realtorId },
    },
    {
      $group: {
        _id: '$realtor',
        houseCounter: { $sum: 1 }
      }
    },
  ]);
  if (stats.length > 0) {
    await User.findByIdAndUpdate(realtorId, {
      houseQuantity: stats[0].houseCounter,
    });
  } else {
    await User.findByIdAndUpdate(realtorId, {
      houseQuantity: 0,
    });
  }
};
//creatring a slug of home title
houseSchema.pre('save',function(){
  this.houseCode = Date.now();
  
})
//this should work with creating a house
houseSchema.post('save',function(){
  this.constructor.countHouse(this.realtor._id);
})
houseSchema.pre(/^findOneAnd/, async function(next) {
  //grab review from query middleware
  //and stick it to the this variable
  this.h = await this.findOne();
  
  next();
});
//update average and quantity of ratings after creation of review
houseSchema.post(/^findOneAnd/, async function() {
  //takes review from pre middleware and call the calcAverage function
  //this.findOne does not work here the query has been excuted
  await this.h.constructor.countHouse(this.h.realtor._id);
});
//query middleware
houseSchema.pre(/^find/,function(next){
  this.populate({
    path: "realtor" , select:"-__v -changedAt" 
  });
  next();
})

const House = mongoose.model('House',houseSchema);
 module.exports = House;