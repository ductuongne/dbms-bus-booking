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
GO

-- Bảng Seats
CREATE INDEX idx_seats_bus_id ON seats(bus_id);
GO

-- Bảng Stations & Routes & Buses (Fleet & Route Management)
CREATE INDEX idx_stations_province_id ON stations(province_id);
GO
CREATE INDEX idx_routes_departure_station_id ON routes(departure_station_id);
CREATE INDEX idx_routes_arrival_station_id ON routes(arrival_station_id);
GO
CREATE INDEX idx_buses_type_id ON buses(type_id);
GO
CREATE INDEX idx_route_stations_route_id ON route_stations(route_id);
CREATE INDEX idx_route_stations_station_id ON route_stations(station_id);
GO

-- Concurrency & Business Indexes (GĐ1)
CREATE UNIQUE INDEX uq_tickets_trip_seat_active ON tickets(trip_id, seat_id) WHERE status IN ('PENDING', 'CONFIRMED');
GO
CREATE INDEX idx_bookings_pending_expired ON bookings(expired_at) WHERE status = 'PENDING';
GO
CREATE INDEX idx_trips_search ON trips(departure_time, status) INCLUDE (route_id, bus_id, price);
GO
CREATE INDEX idx_trips_bus_time ON trips(bus_id, departure_time, arrival_time);
GO
CREATE INDEX idx_trips_driver_time ON trips(driver_id, departure_time, arrival_time);
GO