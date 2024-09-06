import express, {NextFunction, Request, Response} from 'express';
import { Engine } from './engine';
import getFlightValidator from "./validators/get-flight.validator";
import saveSeatsValidator from "./validators/save-seats.validator";
import {isCelebrateError} from "celebrate";
import {PortManager} from "@flights_order/common-utils";

const app = express();
const port = PortManager.getPort('flight-gateway');

export class App{

    async init() {
        this.addMiddlewares();
        this.addRoutes();
        this.addErrorHandling();

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    }

    private addMiddlewares() {
        // Middleware to parse JSON bodies
        app.use(express.json());
    }

    private addRoutes() {
        const engine = new Engine();

        app.get('/flight_seats', getFlightValidator, async (req: Request, res: Response) => {
            const {id} = req.query;
            const result = await engine.getAvailableSeatsByFlightId(id as string);

            res.status(200).json({
                result
            });
        });

        app.post('/', saveSeatsValidator, async (req: Request, res: Response) => {

            try {
                const { flight_id, seats } = req.body;
                const bookingId = await engine.saveSeats(flight_id, seats);

                res.status(200).json({
                    booking_id: bookingId,
                });
            } catch (err) {
                console.error('Error saving seats:', err);
                res.status(500).json({
                    error: 'Error saving seats',
                });
            }

        });
    }

    private addErrorHandling() {
        // Custom error handler for celebrate validation
        app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            if (isCelebrateError(err)) {
                const validation: any = {};
                const errorsMessages: string[] = [];
                for (const [segment, joiError] of err.details.entries()) {
                    validation[segment] = {
                        source: segment,
                        keys: joiError.details.map(detail => detail.path.join('.')),
                        message: joiError.message,
                    };
                    errorsMessages.push(joiError.message);
                }
                return res.status(400).json({
                    error: {
                        message: 'Validation Error',
                        details: errorsMessages.join('\n'),
                        params: validation,
                    },
                });
            }
            next(err); // Pass the error to the next middleware
        });

        // General error handler (optional)
        app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            res.status(500).json({
                error: {
                    message: 'Internal Server Error',
                },
            });
        });
    }
}