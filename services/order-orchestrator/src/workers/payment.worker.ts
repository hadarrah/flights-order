import { Worker } from './worker';
import {Order} from "../common/types";
import axios from "axios";
import {PortManager} from "@flights-order/common-utils";

export class PaymentWorker implements Worker {
    private baseUrl: string = `http://localhost:${PortManager.getPort('payment-manager')}`;

    async execute(order: Order): Promise<void> {
        console.log('PaymentWorker executing order', order);
        try {
            const result = await axios.post(`${this.baseUrl}/place-order`, {
                booking_id: order.booking_id,
            });
            console.log('PaymentWorker order result', result.data);
            if (result.status !== 200) {
                throw new Error('Error executing order');
            }
        } catch (err) {
            console.error('PaymentWorker error executing order:', err);
            throw err;
        }
    }

    async compensate(order: Order): Promise<void> {
        console.log('PaymentWorker compensating order', order);
        try {
            const result = await axios.post(`${this.baseUrl}/compensate-order`, {
                booking_id: order.booking_id,
            });
            console.log('PaymentWorker compensate result', result.data);
        } catch (err) {
            console.error('PaymentWorker error compensating order:', err);
            throw err;
        }
    }
}