const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    bookedSeats: { type: Number, default: 0 },
    isExpired: { type: Boolean, default: false },    
    date: { type: Date, required: true },
}, { timestamps: true });


const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
