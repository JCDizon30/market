const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'FarmerID is required']
        },
        name: {
            type: String,
            required: [true, 'Produce name is required']
        },
        category: {
            type: String,
            required: [true, 'Produce category is required']
        },
        description: {
            type: String,
            required: [true, 'Produce description is required']
        },
        mass: {
            type: Number,
            required: [true, 'Mass measurement is required (kg)'],
            min: [1, 'Mass cannot be negative']
        },
        price: {
            type: Number,
            required: [true, 'Produce price is required'],
            min: [0, 'Price cannot be negative'],
            default: 0
        },
        stock: {
            type: Number,
            required: [true, 'Stock quantity is required'],
            default: 0
        },
        images: {
            type: [String],
            default: []
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true });

module.exports = mongoose.model('Produce', produceSchema);