import {DbHandler} from "./handlers/db.handler";
import {CacheHandler} from "./handlers/cache.handler";


export class Engine {
    private dbHandler: DbHandler;
    private cacheHandler: CacheHandler;

    constructor() {
        this.dbHandler = new DbHandler();
        this.cacheHandler = new CacheHandler();
    }

    async getAvailableSeatsByFlightId(id: string) {
        const dbResults = await this.dbHandler.findAvailableSeatsByFlightId(id);
        return await this.cacheHandler.setSeatUpdatedStatus(id, dbResults);
    }

    async saveSeats(flightId: string, seats: string[]) {
        const seatsAvailable = await this.dbHandler.checkIfSeatsAreAvailable(flightId, seats);
        if (seatsAvailable) {
            return await this.cacheHandler.saveSeatsToCache(flightId, seats);
        } else {
            throw new Error('Seats are not available');
        }
    }
}