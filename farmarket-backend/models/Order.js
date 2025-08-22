const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    produceOrdered: [
        {
            produceID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Produce',
                required: [true, 'ProduceID is required']
            },
            produceName: {
                type: String,
                required: [true, 'Produce Name is Required']
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is Required'],
                default: 0,
            },
            price: {
                type: Number,
                required: [true, 'Price is Required'],
                default: 0
            },
            subtotal: {
                type: Number,
                required: [true, 'Subtotal is Required'],
                default: 0
            }
        }
    ],
    orderedOn: {
        type: Date,
        default: Date.now
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total Price is Required'],
        default: 0
    },
    status: {
        type: String,
        default: 'Pending'
    }
});

module.exports = mongoose.model('Order', orderSchema);