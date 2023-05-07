const router = require('express').Router();
const { addUser, loginUser, searchFlights, bookFlight, getActiveBookings, getFlightData } = require("../controllers/userControllers");
const { isUserAuthorised } = require('../middlewares/userMiddleware');
router.post('/addUser',  addUser)
router.post('/login',loginUser)
router.get("/searchFlights",searchFlights)
router.post("/makeBooking",[isUserAuthorised],bookFlight)
router.get("/activeBookings",[isUserAuthorised],getActiveBookings)
router.get("/flightData",[isUserAuthorised],getFlightData)
module.exports = router