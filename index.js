const express = require("express")
const cookieParser = require('cookie-parser');
const DbConnection = require("./config/db");
require('dotenv').config()

const userRoutes = require("./routes/userRoutes")
const eventRoutes = require("./routes/eventRoutes")
const bookingRoutes = require("./routes/bookingRoutes")
const checkInRoutes = require("./routes/checkInRoutes")

const app = express()
const PORT = 5000

// Middlewares
app.use(express.json())
app.use(cookieParser())

// Database Connection
DbConnection()


app.use("/user", userRoutes)
app.use("/event", eventRoutes)
app.use("/booking", bookingRoutes)
app.use("/check-in", checkInRoutes)


app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`))
