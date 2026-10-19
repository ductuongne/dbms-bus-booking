-- indexes.sql
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

-- Bảng Users
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_email' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_email ON users(email);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_phone' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_phone ON users(phone);

-- Bảng Trips
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_route_id' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_route_id ON trips(route_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_departure_time' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_departure_time ON trips(departure_time);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_status' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_status ON trips(status);

-- Bảng Bookings & Tickets
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_bookings_customer_id' AND object_id = OBJECT_ID('bookings'))
    CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_bookings_code' AND object_id = OBJECT_ID('bookings'))
    CREATE INDEX idx_bookings_code ON bookings(booking_code);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tickets_booking_id' AND object_id = OBJECT_ID('tickets'))
    CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tickets_trip_id' AND object_id = OBJECT_ID('tickets'))
    CREATE INDEX idx_tickets_trip_id ON tickets(trip_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tickets_code' AND object_id = OBJECT_ID('tickets'))
    CREATE INDEX idx_tickets_code ON tickets(ticket_code);

-- Bảng Payments
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_booking_id' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_booking_id ON payments(booking_id);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'uq_payment_transaction_code' AND object_id = OBJECT_ID('payments'))
    CREATE UNIQUE NONCLUSTERED INDEX uq_payment_transaction_code ON payments(transaction_code) WHERE transaction_code IS NOT NULL;
GO


-- Bảng Seats
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_seats_bus_id' AND object_id = OBJECT_ID('seats'))
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
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'uq_tickets_trip_seat_active' AND object_id = OBJECT_ID('tickets'))
    CREATE UNIQUE INDEX uq_tickets_trip_seat_active ON tickets(trip_id, seat_id) WHERE status IN ('PENDING', 'CONFIRMED');
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_bookings_pending_expired' AND object_id = OBJECT_ID('bookings'))
    CREATE INDEX idx_bookings_pending_expired ON bookings(expired_at) WHERE status = 'PENDING';
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_search' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_search ON trips(departure_time, status) INCLUDE (route_id, bus_id, price);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_bus_time' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_bus_time ON trips(bus_id, departure_time, arrival_time);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_driver_time' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_driver_time ON trips(driver_id, departure_time, arrival_time);
GO