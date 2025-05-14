const Booking = require('../models/Booking');
const Event = require('../models/Event');
const generateQRCode = require('../utils/qrCode');
const generateTicketPDF = require('../utils/ticketPDF');
const path = require('path');


const bookTicket = async (req, res) => {
    try {
        const { eventId, seats } = req.body;
        const userId = req.user._id;

        if (!eventId || !seats) {
            return res.status(400).json({ success: false, message: 'Event ID and seats are required' });
        }

        if (seats <= 0 || !Number.isInteger(seats)) {
            return res.status(400).json({ success: false, message: 'Invalid number of seats' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.isExpired || new Date(event.date) < new Date()) {
            return res.status(400).json({ success: false, message: 'Cannot book an expired event' });
        }

        const availableSeats = event.totalSeats - event.bookedSeats;
        if (seats > availableSeats) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableSeats} seat(s) available`,
            });
        }

        // Generate QR Code (can be based on booking ID or user + event + seats)
        const qrCode = await generateQRCode(`${userId}_${eventId}_${seats}`);

        // Generate Ticket PDF
        const ticketPDF = await generateTicketPDF(userId, event, seats);

        // Save booking with seat count
        const booking = new Booking({
            user: userId,
            event: eventId,
            qrCode,
            ticketPDF,
            seatsBooked: seats,
        });

        await booking.save();

        // Update event's bookedSeats
        event.bookedSeats += seats;
        await event.save();

        return res.status(201).json({
            success: true,
            message: `Successfully booked ${seats} seat(s)`,
            booking,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};


const currentUserBooking = async (req, res) => {
    try {
        const userId = req.user._id;

        const booking = await Booking.find({ user: userId })

        res.status(200).send({
            success: true,
            message: "Current user booking",
            booking,
        })


    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}


const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user._id;

        // Find booking with a valid user
        const booking = await Booking.findOne({ _id: bookingId, user: userId });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.status !== 'confirmed') {
            return res.status(400).json({ success: false, message: 'Only confirmed bookings can be cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Decrease bookedSeats in Event
        const event = await Event.findById(booking.event);
        if (event) {
            event.bookedSeats = Math.max(0, event.bookedSeats - (booking.seatsBooked || 1));
            await event.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            booking,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


const viewSingleBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
        if (!booking) {
            return res.status(400).send({ success: false, message: "Booking not found" })
        }

        res.status(200).send({
            success: true,
            message: "Booking fetched",
            booking,
        })

    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}


const getAllBookings = async (req, res) => {
    try {
        const { _id: userId, role } = req.user;

        let filter = { status: "confirmed" };
        // Regular user can only view their bookings
        if (role !== 'admin') {
            filter.user = userId;
        }

        const bookings = await Booking.find(filter)
            .populate('user', 'name email')
            .populate('event', 'title location date')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            bookings,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};


const downloadTicketPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId, role } = req.user;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Authorization check
        if (booking.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (!booking.ticketPDF) {
            return res.status(400).json({ success: false, message: "No ticket PDF found for this booking" });
        }

        const filePath = path.join(__dirname, '..', 'tickets', booking.ticketPDF);

        return res.download(filePath, booking.ticketPDF, (err) => {
            if (err) {
                console.error("Download error:", err);
                return res.status(500).json({ success: false, message: "Failed to download ticket" });
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


const getBookingQRCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: userId, role } = req.user;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Authorization check
        if (booking.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (!booking.qrCode) {
            return res.status(400).json({ success: false, message: "QR code not available for this booking" });
        }

        // Return QR code base64 string
        res.status(200).json({
            success: true,
            message: "QR code fetched successfully",
            qrCode: booking.qrCode,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


module.exports = {
    bookTicket,
    currentUserBooking,
    cancelBooking,
    viewSingleBooking,
    getAllBookings,
    downloadTicketPDF,
    getBookingQRCode,
}