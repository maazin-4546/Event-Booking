const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
    paymentId: { type: String }, // Stripe/Razorpay ID
    provider: { type: String, enum: ['razorpay', 'stripe'], required: true },
    paidAt: { type: Date }
}, { timestamps: true });


const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
