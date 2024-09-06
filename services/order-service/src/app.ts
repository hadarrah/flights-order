import express, { Request, Response } from 'express';
import { Engine } from './engine';

import {PortManager} from "@flights_order/common-utils";

const app = express();
const port = PortManager.getPort('order-service');

export class App{

    async init() {
        const engine = new Engine();

        // Middleware to parse JSON bodies
        app.use(express.json());

        app.post('/place-order', async (req: Request, res: Response) => {

            try {
                const { booking_id, passengers } = req.body;
                await engine.placeOrder(booking_id, passengers);

                res.status(200).json({
                    message: 'Order placed successfully',
                });
            } catch (err) {
                console.error('Error place order', err);
                res.status(500).json({
                    error: 'Error place order',
                });
            }

        });

        app.post('/compensate-order', async (req: Request, res: Response) => {

            try {
                const { booking_id } = req.body;
                const bookingId = await engine.compensateOrder(booking_id);

                res.status(200).json({
                    message: 'Order compensated successfully',
                });
            } catch (err) {
                console.error('Error compensate order:', err);
                res.status(500).json({
                    error: 'Error compensate order',
                });
            }

        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    }
}