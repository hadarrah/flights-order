import {Order} from "./common/types";
import {DbWorker} from "./workers/db.worker";
import {Worker} from "./workers/worker";
import {PaymentWorker} from "./workers/payment.worker";
import {NotificationWorker} from "./workers/notification.worker";

export class Engine {
    private steps: { worker: Worker, name: string }[];

    constructor() {
        this.steps = [
            { worker: new DbWorker(), name: 'DB' },
            { worker: new PaymentWorker(), name: 'Payment' },
            { worker: new NotificationWorker(), name: 'Notification' },
        ];
    }

    async placeOrder(order: Order): Promise<any> {
        const compensationStack: Worker[] = [];  // Track successful steps for compensation
        try {
            for (const step of this.steps) {
                console.log(`Executing step: ${step.name}`);
                await step.worker.execute(order);
                compensationStack.push(step.worker);  // Track successful steps for compensation
            }
            console.log(`Order ${order.booking_id} processed successfully!`);
            return { status: 'success' };
        } catch (err) {
            console.error(`Error during ${(err as Error).message}. Initiating compensation.`);
            await this.compensate(order, compensationStack);
            return { status: 'failed' };
        }
    }

    private async compensate(order: Order, compensationStack: Worker[]) {
        while (compensationStack.length > 0) {
            const worker = compensationStack.pop();
            await worker!.compensate(order);
        }
        console.log(`Order ${order.booking_id} compensation complete.`);
    }

}