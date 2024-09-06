import express, { Request, Response } from 'express';

import {PortManager} from "@flights_order/common-utils";

const app = express();
const port = PortManager.getPort('notification-center');

export class App{

    async init() {

        // Middleware to parse JSON bodies
        app.use(express.json());

        app.post('/place-order', async (req: Request, res: Response) => {

            res.status(200).json({
                message: 'Order placed successfully',
            });

            // res.status(500).json({
            //     error: 'Error place order',
            // });

        });

        app.post('/compensate-order', async (req: Request, res: Response) => {

            res.status(200).json({
                message: 'Order compensated successfully',
            });

            // res.status(500).json({
            //     error: 'Error compensate order',
            // });

        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    }
}