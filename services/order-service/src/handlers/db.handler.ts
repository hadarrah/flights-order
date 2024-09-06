import {MysqlClient} from "@flights-order/mysql-client";
import {DBBookingDetails} from "../common/types";
import {Passenger} from "@flights-order/common-utils";


export class DbHandler {
    private mysqlClient: MysqlClient;

    constructor() {
        this.mysqlClient = MysqlClient.getInstance();
    }

    public async placeOrder(bookingId: string, flightId: string, seats: string[], passengers: Passenger[]): Promise<void> {
        const connection = await this.mysqlClient.getConnection();

        try {
            await connection.beginTransaction();
            for (const seat of seats) {
                // Step 1: Update available seats in the FlightsSeats table
                const [seatResult] = await connection.execute(
                    `UPDATE FlightSeats 
                    SET is_available = 0
                    WHERE flight_id = ? AND seat_code = ?`,
                    [flightId, seat]
                ) as any;

                if (seatResult['changedRows'] === 0) {
                    throw new Error(`No available seats for flight ID ${flightId} and seat ID ${seat}`);
                }

                // Step 2: Insert a new booking into the Bookings table
                const {first_name, last_name} = passengers[seats.indexOf(seat)];
                const [bookingResult] = await connection.execute(
                    `INSERT INTO Bookings (booking_id, flight_id, first_name, last_name, seat_code, booking_date) 
                    VALUES (?, ?, ?, ?, ?, NOW())`,
                    [bookingId, flightId, first_name, last_name, seat]
                ) as any;

                if (bookingResult['affectedRows'] === 0) {
                    throw new Error('Booking failed.');
                }
            }


            // If both queries were successful, commit the transaction
            await connection.commit();
            console.log('Transaction successful. Booking created, and seat updated.');
        } catch (err) {
            // If any error occurs, rollback the transaction
            console.error('Error occurred during transaction:', (err as Error).message);
            await connection.rollback();
        } finally {
            // Release the connection back to the pool
            connection.release();
        }
    }

    public async cancelOrder(bookingId: string): Promise<void> {
        const connection = await this.mysqlClient.getConnection();

        try {
            await connection.beginTransaction();

            // Step 1: Get the flight ID and seat code for the booking
            const [bookingDetails] = await connection.execute(
                `SELECT flight_id, seat_code 
                FROM Bookings 
                WHERE booking_id = ?`,
                [bookingId]
            ) as any[];

            if (bookingDetails.length === 0) {
                throw new Error(`Booking ID ${bookingId} not found.`);
            }


            for (const bookingDetail of bookingDetails) {
                const {flight_id, seat_code} = bookingDetail as unknown as DBBookingDetails;

                // Step 2: Update the FlightsSeats table to make the seat available
                const [seatResult] = await connection.execute(
                    `UPDATE FlightSeats 
                    SET is_available = true 
                    WHERE flight_id = ? AND seat_code = ?`,
                    [flight_id, seat_code]
                ) as any;

                if (seatResult['affectedRows'] === 0) {
                    throw new Error(`Seat ${seat_code} not found for flight ID ${flight_id}`);
                }
            }

            // Step 3: Delete the booking from the Bookings table
            const [bookingResult] = await connection.execute(
                `DELETE FROM Bookings 
                WHERE booking_id = ?`,
                [bookingId]
            ) as any;

            if (bookingResult['affectedRows'] === 0) {
                throw new Error(`Booking ID ${bookingId} not found.`);
            }

            // If all queries were successful, commit the transaction
            await connection.commit();
            console.log('Transaction successful. Booking cancelled, and seat updated.');
        } catch (err) {
            // If any error occurs, rollback the transaction
            console.error('Error occurred during transaction:', (err as Error).message);
            await connection.rollback();
            throw err;
        } finally {
            // Release the connection back to the pool
            connection.release();
        }
    }
}