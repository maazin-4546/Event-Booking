const Event = require("../models/Event")


const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, totalSeats, bookedSeats = 0 } = req.body;

        if (!title || !description || !date || !location || !totalSeats) {
            return res.status(400).send({
                success: false,
                message: 'Title, description, date, location, and totalSeats are required.',
            });
        }

        const event = await Event.create({
            createdBy: req.user._id,
            title,
            description,
            date,
            location,
            totalSeats,
            bookedSeats,
        });

        res.status(200).send({
            success: true,
            message: 'Event Created',
            event,
        });
    } catch (error) {
        console.error(error);
        res.status(400).send({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};


const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        Object.assign(event, updates);

        await event.save();

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            event,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


const expireEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Toggle isExpired
        event.isExpired = !event.isExpired;
        await event.save();

        return res.status(200).json({
            success: true,
            message: `Event is ${event.isExpired ? "expired." : "live."}`,
            event,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};


const singleEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id)
        if (!event) {
            return res.status(400).send({ message: "Event not found." })
        }

        res.status(200).send({
            success: true,
            message: "Event found",
            event
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
}


const allEvents = async (req, res) => {
    try {
        const event = await Event.find().sort({ createAt: -1 })

        res.status(200).send({
            success: true,
            message: "All Events are fetched",
            event
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
}



module.exports = {
    createEvent,
    updateEvent,
    expireEvent,
    singleEvent,
    allEvents,
}