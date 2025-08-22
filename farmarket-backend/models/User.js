const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First Name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required']
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // allows null/undefined to not conflict with uniqueness
        match: [/.+@.+\..+/, 'Please enter a valid email']
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact Number is required'],
        unique: true,
        match: [/^\d{11}$/, 'Contact number must be 11 digits']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    role: {
        type: String,
        enum: ['Consumer', 'Farmer', 'Admin'],
        default: 'Consumer'
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    isApproved: { 
        type: Boolean, 
        default: false
    },
    hasAppliedFarmer: {  
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
