const mongoose = require('mongoose');

const featuresSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'a feature must have a title'],
  },
  description: {
    type: String,
    required: [true, 'a feature must have a description'],
  },
  icon: {
    type: String,
    required: [true, 'a feature must have a icon'],
  },
});

const Features = mongoose.model('Features',featuresSchema);
module.exports=Features;