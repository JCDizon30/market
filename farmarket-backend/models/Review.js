const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    consumerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ConsumerID is required']
    },
    farmerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'FarmerID is required']
    },
    produceID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produce',
        required: [true, 'ProduceID is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required']
    },
    comment: {
        type: String,
        required: false
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema);
