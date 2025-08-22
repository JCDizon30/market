const Review = require('../models/Review');
const Produce = require('../models/Produce');

// FORMAT REVIEW
const formatReview = (review) => ({
  id: review._id,
  consumer: {
    id: review.consumerID._id,
    firstName: review.consumerID.firstName,
    lastName: review.consumerID.lastName
  },
  farmer: {
    id: review.farmerID._id,
    firstName: review.farmerID.firstName,
    lastName: review.farmerID.lastName
  },
  produce: {
    id: review.produceID._id,
    name: review.produceID.name,
    image: review.produceID.images ? review.produceID.images[0] : null
  },
  rating: review.rating,
  comment: review.comment || null,
  createdOn: review.createdOn
});

// CREATE REVIEW
module.exports.createReview = async (req, res) => {
  try {
    const { farmerID, produceID, rating, comment } = req.body;
    if (!farmerID || !produceID || rating == null) {
      return res.status(400).send({ error: "FarmerID, ProduceID and Rating are required" });
    }
    const newReview = new Review({
      consumerID: req.user._id,
      farmerID,
      produceID,
      rating,
      comment
    });
    const savedReview = await newReview.save();
    await savedReview.populate('consumerID', 'firstName lastName')
                     .populate('farmerID', 'firstName lastName')
                     .populate('produceID', 'name images');

    return res.status(201).send(formatReview(savedReview));
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};

// GET ALL REVIEWS FOR A PRODUCE
module.exports.getReviewsByProduce = async (req, res) => {
  try {
    const { produceID } = req.params;
    const reviews = await Review.find({ produceID })
      .populate('consumerID', 'firstName lastName')
      .populate('farmerID', 'firstName lastName')
      .populate('produceID', 'name images');

    if (reviews.length === 0) return res.status(404).send({ error: "No reviews found" });

    return res.status(200).send(reviews.map(formatReview));
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};

// GET ALL REVIEWS FOR A FARMER
module.exports.getReviewsByFarmer = async (req, res) => {
  try {
    const { farmerID } = req.params;
    const reviews = await Review.find({ farmerID })
      .populate('consumerID', 'firstName lastName')
      .populate('farmerID', 'firstName lastName')
      .populate('produceID', 'name images');

    if (reviews.length === 0) return res.status(404).send({ error: "No reviews found" });

    return res.status(200).send(reviews.map(formatReview));
  } catch {
    return res.status(500).send({ error: "Something went wrong" });
  }
};