const express = require("express");
const router = express.Router()
const authorize = require("../middleware/authorize");

const { checkInUser,getAllCheckInLogs } = require("../controllers/checkInController");


router.post('/:bookingId', authorize(['admin']), checkInUser);

router.get('/logs', authorize(['admin']), getAllCheckInLogs);


module.exports = router;