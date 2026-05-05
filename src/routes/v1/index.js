const express = require('express');

const { BookingController } = require('../../controllers/index.js');

const router = express.Router();

router.post('/bookings',BookingController.createBooking);

module.exports = router;