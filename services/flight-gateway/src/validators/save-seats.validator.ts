import { celebrate, Joi, Segments } from 'celebrate';
import { RequestHandler } from 'express';

// Define the validator schema using Joi
const saveSeatsValidator: RequestHandler = celebrate({
    [Segments.BODY]: Joi.object().keys({
        flight_id: Joi.string().required(),
        seats: Joi.array()
            .items(Joi.string().required())
            .min(1)
            .required(),
    }),
});

export default saveSeatsValidator;
