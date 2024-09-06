import {RedisClient} from "@flights_order/redis-client";
import {FlightSeat} from "../common/types";
import {v4 as uuidV4} from "uuid";


export class CacheHandler {
    private redisClient: RedisClient;

    constructor() {
        this.redisClient = RedisClient.getInstance();
    }

    public async setSeatUpdatedStatus(flightId: string, seats: FlightSeat[]): Promise<FlightSeat[]> {
        for (const seat of seats) {
            const inCache = await this.redisClient.get(`flight:${flightId};seat:${seat.seat_code}`) || false;
            seat.is_available = Boolean(seat.is_available) && !inCache;
        }
        return seats;
    }

    public async saveSeatsToCache(flightId: string, seats: string[]) {
        try{
            const bookingId = uuidV4();
            const redisFlight = `flight:${flightId}`;
            const redisBooking = `booking:${bookingId}`;

            const multi = this.redisClient.multi()

            for (const seat of seats) {
                // start watching the seat to check if it is already taken in the meantime
                await this.redisClient.watch(`${redisFlight};seat:${seat}`);
                const seatInCache = await this.redisClient.get(`${redisFlight};seat:${seat}`);
                if (seatInCache) {
                    await this.redisClient.unwatch();
                    throw new Error('Seat is already taken');
                }

                multi.set(`${redisFlight};seat:${seat}`, 'true', 'NX');
                multi.expire(`${redisFlight};seat:${seat}`, 60 * 10); // 10 minutes
            }
            multi.hset(redisBooking, 'flight_id', flightId);
            multi.hset(redisBooking, 'seats_code', seats.join(','));
            multi.expire(redisBooking, 60 * 10); // 10 minutes

            const result = multi.exec();
            console.log(result); // for some reason it always return true, there we check if the transaction was successful by checking the booking

            const bookingExists = await this.redisClient.exists(redisBooking);
            if (!bookingExists) {
                throw new Error('Booking failed');
            }
            return bookingId;
        } catch (err) {
            console.error('Error saving seats to cache:', err);
            throw err;
        }
    }
}