import { celebrate, Joi, Segments } from 'celebrate';
import { RequestHandler } from 'express';

// Define the validator schema using Joi
const orderValidator: RequestHandler = celebrate({
    [Segments.BODY]: Joi.object().keys({
        booking_id: Joi.string().required(),
        payment_details: Joi.object().required(),
        passengers: Joi.array()
            .items(Joi.object().keys({
                first_name: Joi.string().required(),
                last_name: Joi.string().required(),
            }).required())
            .min(1)
            .required(),
    }),
});

export default orderValidator;
