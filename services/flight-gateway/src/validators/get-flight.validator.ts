import { celebrate, Joi, Segments } from 'celebrate';
import { RequestHandler } from 'express';

// Define the validator schema using Joi
const getFlightValidator: RequestHandler = celebrate({
    [Segments.QUERY]: Joi.object().keys({
        id: Joi.string().required(),
    }),
});

export default getFlightValidator;
