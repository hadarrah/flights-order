import {DbHandler} from "./handlers/db.handler";
import {CacheHandler} from "./handlers/cache.handler";
import {Passenger} from "@flights-order/common-utils";


export class Engine {
    private dbHandler: DbHandler;
    private cacheHandler: CacheHandler;

    constructor() {
        this.dbHandler = new DbHandler();
        this.cacheHandler = new CacheHandler();
    }

    async placeOrder(bookingId: string, passengers: Passenger[]) {
        const bookingDetails = await this.cacheHandler.getBookingDetails(bookingId);
        const seats = bookingDetails.seats_code.split(',');
        if (seats.length !== passengers.length) {
            throw new Error('Number of passengers does not match number of seats');
        }
        const flightId = bookingDetails.flight_id;
        await this.dbHandler.placeOrder(bookingId, flightId, seats, passengers);
        await this.cacheHandler.removeBooking({flightId, bookingId, seatsCode: seats});
    }

    async compensateOrder(bookingId: string) {
        await this.dbHandler.cancelOrder(bookingId);
    }
}