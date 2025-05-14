const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const CheckIn = require('../models/CheckIn');
const Event = require('../models/Event');


const checkInUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bookingId } = req.params;
        const adminId = req.user._id;

        // 2. Booking lookup
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) {
            await session.abortTransaction();
            return res.status(404).send({ success: false, message: 'Booking not found' });
        }

        // 3. Already checked in?
        if (booking.checkedIn) {
            await session.abortTransaction();
            return res.status(400).send({ success: false, message: 'User already checked in' });
        }

        // 4. Booking cancelled?
        if (booking.status === 'cancelled' || booking.status === 'expired') {
            await session.abortTransaction();
            return res.status(400).send({ success: false, message: 'Cannot check-in: booking was cancelled or expired.' });
        }

        // 5. Event validation
        const event = await Event.findById(booking.event).session(session);
        if (!event || event.isExpired) {
            await session.abortTransaction();
            return res.status(404).send({ success: false, message: 'Associated event not found or expired.' });
        }

        // 6. Event already ended?
        if (new Date() > new Date(event.date)) {
            await session.abortTransaction();
            return res.status(400).send({ success: false, message: 'Cannot check-in: event already ended' });
        }

        // 7. Event check-in day strict match (optional)
        const today = new Date().toISOString().split('T')[0];
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        if (today !== eventDate) {
            await session.abortTransaction();
            return res.status(400).send({ success: false, message: 'Check-in allowed only on event date' });
        }

        // 8. Create Check-In
        const newCheckIn = await CheckIn.create([{
            bookingId: booking._id,
            userId: booking.user,
            checkedInBy: adminId,
            location: event.location,
            status: 'checked-in',
        }], { session });

        // 9. Update booking
        booking.checkedIn = true;
        booking.checkInId = newCheckIn[0]._id;
        await booking.save({ session });

        await session.commitTransaction();

        res.status(200).send({
            success: true,
            message: 'User checked in successfully',
            checkIn: newCheckIn[0],
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Check-in error:', error);
        res.status(500).send({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });

    } finally {
        session.endSession();
    }
};


const getAllCheckInLogs = async (req, res) => {
    try {
        const checkInLogs = await CheckIn.find()
            .populate('bookingId', 'event user') 
            .populate('userId', 'name email')   
            .populate('checkedInBy', 'name email') 
            .sort({ checkInTime: -1 });

        res.status(200).send({
            success: true,
            message: 'Check-in logs fetched successfully',
            data: checkInLogs
        });

    } catch (error) {
        console.error('Error fetching check-in logs:', error);
        res.status(500).send({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


module.exports = {
    checkInUser,
    getAllCheckInLogs,
};
