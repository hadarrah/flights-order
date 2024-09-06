export type Filters = {
    flight_id?: number;
    origin?: string;
    destination?: string;
    number_of_seats?: number;
}

export type Flight = {
    flight_id: number;
    flight_number: string;
    origin: string;
    destination: string;
    airline: string;
    airplane_model: string;
    departure_date: string;
    arrival_date: string;
    available_seats: number;
}
