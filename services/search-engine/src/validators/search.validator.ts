import { celebrate, Joi, Segments } from 'celebrate';
import { RequestHandler } from 'express';

// Define the validator schema using Joi
const flightValidator: RequestHandler = celebrate({
    [Segments.BODY]: Joi.object().keys({
        flight_id: Joi.number().optional(), // Optional number
        origin: Joi.string().optional(), // Optional string
        destination: Joi.string().optional(), // Optional string
        number_of_seats: Joi.number().optional(), // Optional number
    }),
});

export default flightValidator;
