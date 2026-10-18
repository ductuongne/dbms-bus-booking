-- 02_constraints.sql

-- ==========================================
-- FOREIGN KEYS
-- ==========================================
ALTER TABLE stations ADD CONSTRAINT fk_station_province FOREIGN KEY (province_id) REFERENCES provinces(province_id);
GO

ALTER TABLE routes ADD CONSTRAINT fk_route_departure FOREIGN KEY (departure_station_id) REFERENCES stations(station_id);
GO
ALTER TABLE routes ADD CONSTRAINT fk_route_arrival FOREIGN KEY (arrival_station_id) REFERENCES stations(station_id);
GO

ALTER TABLE buses ADD CONSTRAINT fk_bus_type FOREIGN KEY (type_id) REFERENCES bus_types(type_id);
GO

ALTER TABLE seats ADD CONSTRAINT fk_seat_bus FOREIGN KEY (bus_id) REFERENCES buses(bus_id);
GO

ALTER TABLE drivers ADD CONSTRAINT fk_driver_user FOREIGN KEY (user_id) REFERENCES users(user_id);
GO

ALTER TABLE trips ADD CONSTRAINT fk_trip_route FOREIGN KEY (route_id) REFERENCES routes(route_id);
GO
ALTER TABLE trips ADD CONSTRAINT fk_trip_bus FOREIGN KEY (bus_id) REFERENCES buses(bus_id);
GO
ALTER TABLE trips ADD CONSTRAINT fk_trip_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id);
GO

ALTER TABLE bookings ADD CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES users(user_id);
GO

ALTER TABLE payments ADD CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id);
GO

ALTER TABLE tickets ADD CONSTRAINT fk_ticket_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id);
GO
ALTER TABLE tickets ADD CONSTRAINT fk_ticket_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id);
GO
ALTER TABLE tickets ADD CONSTRAINT fk_ticket_seat FOREIGN KEY (seat_id) REFERENCES seats(seat_id);
GO

-- ==========================================
-- UNIQUE CONSTRAINTS
-- ==========================================
ALTER TABLE users ADD CONSTRAINT uq_user_email UNIQUE (email);
GO
ALTER TABLE users ADD CONSTRAINT uq_user_phone UNIQUE (phone);
GO

ALTER TABLE buses ADD CONSTRAINT uq_bus_license_plate UNIQUE (license_plate);
GO

ALTER TABLE drivers ADD CONSTRAINT uq_driver_license_number UNIQUE (license_number);
GO
ALTER TABLE drivers ADD CONSTRAINT uq_driver_user UNIQUE (user_id);
GO

ALTER TABLE bookings ADD CONSTRAINT uq_booking_code UNIQUE (booking_code);
GO

ALTER TABLE payments ADD CONSTRAINT uq_payment_transaction_code UNIQUE (transaction_code);
GO

ALTER TABLE tickets ADD CONSTRAINT uq_ticket_code UNIQUE (ticket_code);
GO

ALTER TABLE seats ADD CONSTRAINT uq_seat_number_per_bus UNIQUE (bus_id, seat_number);
GO

-- ==========================================
-- CHECK CONSTRAINTS (ENUMS)
-- ==========================================
ALTER TABLE users ADD CONSTRAINT chk_user_role CHECK (role IN ('CUSTOMER', 'STAFF', 'ADMIN', 'DRIVER', 'GUEST'));
GO

ALTER TABLE buses ADD CONSTRAINT chk_bus_status CHECK (status IN ('ACTIVE', 'INACTIVE'));
GO


ALTER TABLE trips ADD CONSTRAINT chk_trip_status CHECK (status IN ('SCHEDULED', 'DEPARTED', 'COMPLETED', 'CANCELLED'));
GO

ALTER TABLE bookings ADD CONSTRAINT chk_booking_channel CHECK (channel IN ('ONLINE', 'COUNTER'));
GO
ALTER TABLE bookings ADD CONSTRAINT chk_booking_status CHECK (status IN ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED'));
GO

ALTER TABLE payments ADD CONSTRAINT chk_payment_method CHECK (method IN ('CASH', 'BANK_TRANSFER'));
GO
ALTER TABLE payments ADD CONSTRAINT chk_payment_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED'));
GO

ALTER TABLE tickets ADD CONSTRAINT chk_ticket_status CHECK (status IN ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED', 'CHECKED_IN'));
GO
ALTER TABLE tickets ADD CONSTRAINT chk_tickets_price CHECK (price >= 0);
GO

ALTER TABLE trips ADD CONSTRAINT chk_trips_time CHECK (arrival_time > departure_time);
GO