import {Passenger} from "@flights_order/common-utils";

export type Order = {
    booking_id: string;
    payment_details: any
    passengers: Passenger[];
}
