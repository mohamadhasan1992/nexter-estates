const Review = require("../models/reviewModel");
const factory = require('./handlerFactory');




exports.setUserAndRealtorId = (req, res, next) => {
  if (!req.body.realtor) req.body.realtor = req.params.realtorId;
  req.body.reviewCreater = req.user.id;
  next();
}
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.removeReview = factory.deleteOne(Review);

