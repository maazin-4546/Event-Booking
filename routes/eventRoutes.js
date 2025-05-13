const express = require("express");
const router = express.Router()
const authorize = require("../middleware/authorize");

const { createEvent, updateEvent, expireEvent, singleEvent, allEvents } = require("../controllers/eventController");


router.post("/create", authorize(['admin']), createEvent)

router.patch("/update/:id", authorize(['admin']), updateEvent)

router.patch('/expire/:id', authorize(['admin']), expireEvent);

router.get("/view/:id", authorize(['user', 'admin']), singleEvent)

router.get("/view-all", authorize(['user', 'admin']), allEvents)


module.exports = router;