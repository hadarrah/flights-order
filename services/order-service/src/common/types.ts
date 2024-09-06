export type CacheBookingDetails = {
    flight_id: string;
    seats_code: string;
}

export type DBBookingDetails = {
    flight_id: string;
    seat_code: string;
}

export type BookingDetails = {
    flightId: string;
    bookingId: string;
    seatsCode: string[];
}
