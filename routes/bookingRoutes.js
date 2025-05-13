const express = require("express");
const router = express.Router()
const authorize = require("../middleware/authorize");

const { bookTicket, currentUserBooking, cancelBooking, viewSingleBooking, getAllBookings, downloadTicketPDF, getBookingQRCode } = require("../controllers/bookingController");


router.post('/seat', authorize(['user']), bookTicket);

router.get("/current-user", authorize(['user']), currentUserBooking)

router.patch('/cancel/:id', authorize(['user']), cancelBooking);

router.get('/view/:id', authorize(['admin', 'user']), viewSingleBooking);

router.get('/all-bookings', authorize(['admin', 'user']), getAllBookings);

router.get('/download/:id', authorize(['user']), downloadTicketPDF);

router.get('/qr-code/:id', authorize(['user']), getBookingQRCode);


module.exports = router;