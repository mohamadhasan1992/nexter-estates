const handlerFactory = require('./handlerFactory');
const Features = require('../models/featureModel');

exports.updateFeature = handlerFactory.updateOne(Features);
exports.createFeature = handlerFactory.createOne(Features);
exports.getAllFeatures = handlerFactory.getAll(Features);