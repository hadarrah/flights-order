import {RedisClient} from "@flights-order/redis-client";
import {BookingDetails, CacheBookingDetails} from "../common/types";


export class CacheHandler {
    private redisClient: RedisClient;

    constructor() {
        this.redisClient = RedisClient.getInstance();
    }


    public async getBookingDetails(bookingId: string): Promise<CacheBookingDetails> {
        try{
            const redisBooking = `booking:${bookingId}`;

            const bookingDetails = await this.redisClient.hgetall(redisBooking);
            console.log(bookingDetails);

            if (!bookingDetails || !bookingDetails.flight_id || !bookingDetails.seats_code) {
                throw new Error('Booking not found');
            }
           return bookingDetails as unknown as CacheBookingDetails;
        } catch (err) {
            console.error(`Error getting booking details for ${bookingId}:`, err);
            throw err;
        }
    }

    public async removeBooking(bookingDetails: BookingDetails): Promise<void> {
        try{
            const redisFlight = `flight:${bookingDetails.flightId}`;
            const redisBooking = `booking:${bookingDetails.bookingId}`;

            const multi = this.redisClient.multi()

            for (const seat of bookingDetails.seatsCode) {
                multi.del(`${redisFlight};seat:${seat}`);
            }
            multi.del(redisBooking);

            multi.exec();
        } catch (err) {
            console.error(`Error removing booking details for ${bookingDetails.bookingId}:`, err);
            throw err;
        }
    }
}