const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    seatsBooked: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['confirmed', 'cancelled', 'expired'], default: 'confirmed' },
    ticketPDF: { type: String }, // URL or file path
    qrCode: { type: String }, // QR code URL or base64 string
    checkedIn: { type: Boolean, default: false },
    bookedAt: { type: Date, default: Date.now },
});


const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
