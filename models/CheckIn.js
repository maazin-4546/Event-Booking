const mongoose = require('mongoose');


const checkInSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true, // Ensure one check-in per booking
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    checkedInBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin who scanned the QR
        required: true,
    },
    checkInTime: {
        type: Date,
        default: Date.now,
    },
    location: {
        type: String, 
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        enum: ['checked-in', 'rejected'],
        default: 'checked-in',
    },
});



const CheckIn = mongoose.model('CheckIn', checkInSchema);

module.exports = CheckIn;
