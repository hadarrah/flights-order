import {FlightSeat} from "../common/types";
import {MysqlClient} from "@flights-order/mysql-client";


export class DbHandler {
    private mysqlClient: MysqlClient;

    constructor() {
        this.mysqlClient = MysqlClient.getInstance();
    }

    public async findAvailableSeatsByFlightId(id: string): Promise<FlightSeat[]> {
        try {
            // Start constructing the base query
            let query = 'SELECT \n' +
                '    fs.seat_code,\n' +
                '    fs.is_available\n' +
                'FROM \n' +
                '    FlightSeats fs\n' +
                `WHERE fs.flight_id=${id}`

            // Execute the query
            return await this.mysqlClient.query(query) as FlightSeat[];
        } catch (err) {
            console.error('Error searching for flights:', err);
            return [];
        }
    }

    public async checkIfSeatsAreAvailable(flightId: string, seats: string[]): Promise<boolean> {
        const dbResults = await this.findAvailableSeatsByFlightId(flightId);
        for (const seat of seats) {
            const dbSeat = dbResults.find((dbSeat) => dbSeat.seat_code === seat);
            if (!dbSeat || !dbSeat.is_available) {
                return false;
            }
        }
        return true;
    }
}