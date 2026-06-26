const { StatusCodes } = require('http-status-codes');

const { BookingService } = require('../services/index.js');

const { createChannel, publishMessage } = require('../utils/messageQueue.js');

const { REMINDER_BINDING_KEY } = require('../config/serverConfig.js');

const bookingService = new BookingService();

class BookingController {

    constructor() {
    }

    // Testing endpoint
    async sendMessageToQueue(req, res) {

        const channel = await createChannel();

        const payload = {
            data: {
                subject: "This is a test mail",
                content: "Testing RabbitMQ",
                recepientEmail: "akshaynitp29@gmail.com",
                notificationTime: "2026-05-06 19:14:05"
            },
            service: "CREATE_TICKET"
        };

        await publishMessage(
            channel,
            REMINDER_BINDING_KEY,
            JSON.stringify(payload)
        );

        return res.status(200).json({
            message: 'Successfully published test event'
        });
    }

    async create(req, res) {
        try {
            const response = await bookingService.createBooking(req.body);

            const channel = await createChannel();

            const payload = {
                service: 'SEND_BASIC_MAIL',

                data: {
                    mailTo: req.body.email,
                    subject: 'Flight Booking Confirmed',
                    mailBody: `Your booking has been confirmed Booking Id: ${response.id}`
                }
            };

            await publishMessage(
                channel,
                REMINDER_BINDING_KEY,
                JSON.stringify(payload)
            );

            return res.status(StatusCodes.OK).json({
                message: 'Successfully completed booking',
                success: true,
                err: {},
                data: response
            });
        } catch (error) {
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message,
                success: false,
                err: error.explanation,
                data: {}
            });
        }
    }
}

module.exports = BookingController;