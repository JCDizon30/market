const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ReporterID is required']
    },
    reportedID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ReportedID is required']
    },
    orderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'OrderID is required']
    },
    reason: {
        type: String,
        required: [true, 'Reason is required']
    },
    status: {
        type: String,
        default: 'Pending'
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema);