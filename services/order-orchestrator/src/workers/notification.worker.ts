import { Worker } from './worker';
import {Order} from "../common/types";
import axios from "axios";
import {PortManager} from "@flights_order/common-utils";

export class NotificationWorker implements Worker {
    private baseUrl: string = `http://localhost:${PortManager.getPort('notification-center')}`;

    async execute(order: Order): Promise<void> {
        console.log('NotificationWorker executing order', order);
        try {
            const result = await axios.post(`${this.baseUrl}/place-order`, {
                booking_id: order.booking_id,
            });
            console.log('NotificationWorker order result', result.data);
            if (result.status !== 200) {
                throw new Error('Error executing order');
            }
        } catch (err) {
            console.error('NotificationWorker error executing order:', err);
            throw err;
        }
    }

    async compensate(order: Order): Promise<void> {
        console.log('NotificationWorker compensating order', order);
        try {
            const result = await axios.post(`${this.baseUrl}/compensate-order`, {
                booking_id: order.booking_id,
            });
            console.log('NotificationWorker compensate result', result.data);
        } catch (err) {
            console.error('NotificationWorker error compensating order:', err);
            throw err;
        }
    }
}