-- indexes.sql

-- Bảng Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- Bảng Trips
CREATE INDEX idx_trips_route_id ON trips(route_id);
CREATE INDEX idx_trips_departure_time ON trips(departure_time);
CREATE INDEX idx_trips_status ON trips(status);

-- Bảng Bookings & Tickets
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_code ON bookings(booking_code);
CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);
CREATE INDEX idx_tickets_trip_id ON tickets(trip_id);
CREATE INDEX idx_tickets_code ON tickets(ticket_code);

-- Bảng Payments
CREATE INDEX idx_payments_booking_id ON payments(booking_id);