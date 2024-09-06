import mysql from "mysql2/promise";
import {Config} from "./config";

async function init_db() {
    console.info('Initializing the database');
    const db = mysql.createPool(Config.getConfig());

    const connection = await db.getConnection();
    try {
        await connection.execute(`DROP TABLE IF EXISTS Bookings`)
        await connection.execute(`DROP TABLE IF EXISTS FlightSeats`)
        await connection.execute(`DROP TABLE IF EXISTS Flights`)
        await connection.execute(`CREATE TABLE Flights (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL,
    origin VARCHAR(3) NOT NULL,
    destination VARCHAR(3) NOT NULL,
    airline VARCHAR(50) NOT NULL,
    airplane_model VARCHAR(50) NOT NULL,
    departure_date TIMESTAMP NOT NULL,
    arrival_date TIMESTAMP NULL
);
`);


        await connection.execute(`CREATE TABLE FlightSeats (
    flight_id INT,
    seat_code VARCHAR(5),
    is_available TINYINT(1) DEFAULT 1,
    PRIMARY KEY (flight_id, seat_code),
    FOREIGN KEY (flight_id) REFERENCES Flights(flight_id)
);
`);


        await connection.execute(`CREATE TABLE Bookings (
    booking_id VARCHAR(50),
    flight_id INT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    seat_code VARCHAR(5),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (booking_id, seat_code),
    FOREIGN KEY (flight_id) REFERENCES Flights(flight_id),
    FOREIGN KEY (flight_id, seat_code) REFERENCES FlightSeats(flight_id, seat_code)
);
`);

        // Insert data into the `Flights` table
        const flights = [
            {
                flight_number: 'DL123',
                origin: 'NYC',
                destination: 'TLV',
                airline: 'Delta Airlines',
                airplane_model: 'Boeing 737',
                departure_date: new Date('2024-09-10T10:00:00'),
                arrival_date: new Date('2024-09-10T13:00:00'),
            },
            {
                flight_number: 'UA456',
                origin: 'ROM',
                destination: 'TLV',
                airline: 'United Airlines',
                airplane_model: 'Airbus A320',
                departure_date: new Date('2024-09-12T09:30:00'),
                arrival_date: new Date('2024-09-12T15:00:00'),
            },
        ];

        for (const flight of flights) {
            const [result] = await connection.execute(`
                INSERT INTO Flights (flight_number, origin, destination, airline, airplane_model, departure_date, arrival_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [flight.flight_number, flight.origin, flight.destination, flight.airline, flight.airplane_model, flight.departure_date, flight.arrival_date]
            );
            // @ts-ignore
            const flightId = result.insertId;

            // Insert data into the `FlightSeats` table (Assuming seat codes are L1A, L1B, etc.)
            const seatCodes = ['L1A', 'L1B', 'L1C', 'L2A', 'L2B', 'L2C'];
            for (const seatCode of seatCodes) {
                await connection.execute(`
                    INSERT INTO FlightSeats (flight_id, seat_code, is_available) 
                    VALUES (?, ?, ?)`,
                    [flightId, seatCode, 1]  // Assuming all seats are available initially
                );
            }
        }
    } catch (err) {
        console.error('Error initializing the database:', err);
    } finally {
        console.info('Database initialized');
        connection.release();
    }
}

init_db();