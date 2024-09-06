import { Worker } from './worker';
import {Order} from "../common/types";
import axios from "axios";
import {PortManager} from "@flights-order/common-utils";

export class DbWorker implements Worker {
    private baseUrl: string = `http://localhost:${PortManager.getPort('order-service')}`;

    async execute(order: Order): Promise<void> {
        console.log('DbWorker executing order', order);
        try {
            const result = await axios.post(`${this.baseUrl}/place-order`, {
                booking_id: order.booking_id,
                passengers: order.passengers,
            });
            console.log('DbWorker order result', result.data);
            if (result.status !== 200) {
                throw new Error('Error executing order');
            }
        } catch (err) {
            console.error('DbWorker error executing order:', err);
            throw err;
        }
    }

    async compensate(order: Order): Promise<void> {
        console.log('DbWorker compensating order', order);
        try {
            const result = await axios.post(`${this.baseUrl}/compensate-order`, {
                booking_id: order.booking_id,
            });
            console.log('DbWorker compensate result', result.data);
        } catch (err) {
            console.error('DbWorker error compensating order:', err);
            throw err;
        }
    }
}