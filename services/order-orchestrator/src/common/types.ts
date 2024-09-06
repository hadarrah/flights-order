import {Passenger} from "@flights-order/common-utils";

export type Order = {
    booking_id: string;
    payment_details: any
    passengers: Passenger[];
}
