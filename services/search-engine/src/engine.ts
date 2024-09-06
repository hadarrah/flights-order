import {MysqlClient} from "@flights-order/mysql-client";
import {RedisClient} from "@flights-order/redis-client";
import {FlightIdFilter} from "./filters/flight-id.filter";
import { Filters, Flight} from "./common/types";
import {DestinationFilter} from "./filters/destination.filter";
import {OriginFilter} from "./filters/origin.filter";


export class Engine {
    private mysqlClient: MysqlClient;
    private redisClient: RedisClient;

    constructor() {
        this.mysqlClient = MysqlClient.getInstance();
        this.redisClient = RedisClient.getInstance();
    }

    async search(filters: Filters) {
        const dbResults = await this.searchDB(filters);
        return await this.searchAndFilterByCache(dbResults, filters.number_of_seats);
    }

    private async searchDB(filters: Filters): Promise<Flight[]> {
        try {
            // Start constructing the base query
            let query = 'SELECT \n' +
                '    f.flight_id,\n' +
                '    f.flight_number,\n' +
                '    f.origin,\n' +
                '    f.destination,\n' +
                '    f.airline,\n' +
                '    f.airplane_model,\n' +
                '    f.departure_date,\n' +
                '    f.arrival_date,\n' +
                '    COUNT(fs.seat_code) AS available_seats\n' +
                'FROM \n' +
                '    Flights f\n' +
                'LEFT JOIN \n' +
                '    FlightSeats fs ON f.flight_id = fs.flight_id AND fs.is_available = 1\n' +
                'WHERE 1=1 \n' // 1=1 allows easy appending of conditions

            const params: (number | string)[] = []; // Array to hold query parameters
            query = FlightIdFilter.addFilter(query, params, filters);
            query = OriginFilter.addFilter(query, params, filters);
            query = DestinationFilter.addFilter(query, params, filters);

            query += ' GROUP BY \n' +
                '    f.flight_id, f.flight_number;';
            // Execute the query
            const rows = await this.mysqlClient.query(query, params);
            return rows as Flight[];
        } catch (err) {
            console.error('Error searching for flights:', err);
            return [];
        }
    }

    private async searchAndFilterByCache(flights: Flight[], requiredSeats?: number): Promise<Flight[]> {
        const filteredFlights: Flight[] = [];
        for (const flight of flights) {
            let availableSeats = flight.available_seats;
            const keys = await this.redisClient.keys(`flight:${flight.flight_id}*`);
            availableSeats = availableSeats - keys.length;
            if (requiredSeats === undefined || availableSeats >= requiredSeats) {
                filteredFlights.push({...flight, available_seats: availableSeats});
            }
        }
        return filteredFlights;
    }
}