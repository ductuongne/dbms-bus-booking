CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL,
    loyalty_points INT DEFAULT 0,
    is_active BIT DEFAULT 1 -- Đổi BOOLEAN -> BIT, TRUE -> 1
);
GO

CREATE TABLE provinces (
    province_id VARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE stations (
    station_id VARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    province_id VARCHAR(50) NOT NULL,
    address NVARCHAR(255) NOT NULL
);
GO

CREATE TABLE routes (
    route_id VARCHAR(50) PRIMARY KEY,
    departure_station_id VARCHAR(50) NOT NULL,
    arrival_station_id VARCHAR(50) NOT NULL,
    distance_km DECIMAL(10,2) NOT NULL,
    estimated_duration INT NOT NULL
);
GO

CREATE TABLE bus_types (
    type_id VARCHAR(50) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    total_seats INT NOT NULL,
    floors INT NOT NULL
);
GO

CREATE TABLE buses (
    bus_id VARCHAR(50) PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    type_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL
);
GO

CREATE TABLE seats (
    seat_id VARCHAR(50) PRIMARY KEY,
    seat_number VARCHAR(10) NOT NULL,
    floor INT NOT NULL,
    seat_type VARCHAR(20) NOT NULL,
    bus_id VARCHAR(50) NOT NULL
);
GO

CREATE TABLE drivers (
    driver_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_expiry DATE NOT NULL
);
GO

CREATE TABLE trips (
    trip_id VARCHAR(50) PRIMARY KEY,
    route_id VARCHAR(50) NOT NULL,
    bus_id VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50) NOT NULL,
    departure_time DATETIME2 NOT NULL, -- Đổi TIMESTAMP -> DATETIME2
    arrival_time DATETIME2 NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL
);
GO

CREATE TABLE bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    booking_code VARCHAR(20) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at DATETIME2 NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL
);
GO

CREATE TABLE payments (
    payment_id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    method VARCHAR(20) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_at DATETIME2,
    transaction_code VARCHAR(100),
    status VARCHAR(20) NOT NULL
);
GO

CREATE TABLE tickets (
    ticket_id VARCHAR(50) PRIMARY KEY,
    ticket_code VARCHAR(20) NOT NULL,
    booking_id VARCHAR(50) NOT NULL,
    trip_id VARCHAR(50) NOT NULL,
    seat_id VARCHAR(50) NOT NULL,
    passenger_name NVARCHAR(100) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL
);
GO