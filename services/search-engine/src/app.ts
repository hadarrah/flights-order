import express, { Request, Response, NextFunction } from 'express';
import { Engine } from './engine';
import flightValidator from "./validators/search.validator";
import {isCelebrateError} from 'celebrate';

import {PortManager} from "@flights_order/common-utils";

const app = express();
const port = PortManager.getPort('search-engine');

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

        // Define a simple route
        app.post('/', flightValidator, async (req: Request, res: Response) => {

            const results = await engine.search(req.body);

            res.status(200).json({
                results
            });
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