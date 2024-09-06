import {Order} from "../common/types";


export interface Worker {
    execute(order: Order): Promise<void>;
    compensate(order: Order): Promise<void>;
}