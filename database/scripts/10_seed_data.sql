INSERT INTO provinces (province_id, name) VALUES 
('PRV-01', N'Hà Nội'),
('PRV-02', N'Hồ Chí Minh'),
('PRV-03', N'Đà Nẵng'),
('PRV-04', N'Lâm Đồng');
GO

INSERT INTO bus_types (type_id, name, total_seats, floors) VALUES 
('BT-01', N'Xe Giường Nằm 34', 34, 2),
('BT-02', N'Xe Limousine 22', 22, 1),
('BT-03', N'Xe Ghế Ngồi 45', 45, 1);
GO

-- Chú ý cột is_active đổi TRUE thành 1
INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active) VALUES 
('USR-ADMIN-1', N'System Administrator', 'admin@example.com', '0901234567', '$2b$10$dummyHashStringHere123456', 'ADMIN', 0, 1),
('USR-CUS-1', N'Nguyễn Văn A', 'nva@example.com', '0988000111', '$2b$10$dummyHashStringHere789012', 'CUSTOMER', 150, 1),
('USR-GUEST-1', N'Khách Vãng Lai B', 'guestb@example.com', '0933222333', NULL, 'GUEST', 0, 1);
GO

INSERT INTO stations (station_id, name, province_id, address) VALUES 
('STA-01', N'Bến xe Miền Đông', 'PRV-02', N'292 Đinh Bộ Lĩnh, Bình Thạnh'),
('STA-02', N'Bến xe Liên Tỉnh Đà Lạt', 'PRV-04', N'Số 1 Tô Hiến Thành, Phường 3');
GO

INSERT INTO routes (route_id, departure_station_id, arrival_station_id, distance_km, estimated_duration) VALUES 
('RT-SGN-DLI', 'STA-01', 'STA-02', 300.5, 480);
GO

-- Users (Drivers)
INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active) VALUES 
('USR-DRV-1', N'Tài xế Nguyễn Văn Một', 'driver1@example.com', '0911000001', '$2b$10$dummyHashStringHere111111', 'DRIVER', 0, 1),
('USR-DRV-2', N'Tài xế Trần Văn Hai', 'driver2@example.com', '0911000002', '$2b$10$dummyHashStringHere222222', 'DRIVER', 0, 1);
GO

-- Drivers
INSERT INTO drivers (driver_id, user_id, license_number, license_expiry) VALUES 
('DRV-01', 'USR-DRV-1', 'B2-12345678', '2030-12-31'),
('DRV-02', 'USR-DRV-2', 'D-87654321', '2030-12-31');
GO

-- Buses
INSERT INTO buses (bus_id, license_plate, type_id, status) VALUES 
('BUS-01', '51B-12345', 'BT-01', 'ACTIVE'),
('BUS-02', '51B-67890', 'BT-02', 'ACTIVE');
GO

-- Seats for BUS-01 (34 seats: A01-A17, B01-B17)
INSERT INTO seats (seat_id, seat_number, bus_id) VALUES 
('SEA-01', 'A01', 'BUS-01'), ('SEA-02', 'A02', 'BUS-01'), ('SEA-03', 'A03', 'BUS-01'),
('SEA-04', 'A04', 'BUS-01'), ('SEA-05', 'A05', 'BUS-01'), ('SEA-06', 'A06', 'BUS-01'),
('SEA-07', 'A07', 'BUS-01'), ('SEA-08', 'A08', 'BUS-01'), ('SEA-09', 'A09', 'BUS-01'),
('SEA-10', 'A10', 'BUS-01'), ('SEA-11', 'A11', 'BUS-01'), ('SEA-12', 'A12', 'BUS-01'),
('SEA-13', 'A13', 'BUS-01'), ('SEA-14', 'A14', 'BUS-01'), ('SEA-15', 'A15', 'BUS-01'),
('SEA-16', 'A16', 'BUS-01'), ('SEA-17', 'A17', 'BUS-01'),
('SEA-18', 'B01', 'BUS-01'), ('SEA-19', 'B02', 'BUS-01'), ('SEA-20', 'B03', 'BUS-01'),
('SEA-21', 'B04', 'BUS-01'), ('SEA-22', 'B05', 'BUS-01'), ('SEA-23', 'B06', 'BUS-01'),
('SEA-24', 'B07', 'BUS-01'), ('SEA-25', 'B08', 'BUS-01'), ('SEA-26', 'B09', 'BUS-01'),
('SEA-27', 'B10', 'BUS-01'), ('SEA-28', 'B11', 'BUS-01'), ('SEA-29', 'B12', 'BUS-01'),
('SEA-30', 'B13', 'BUS-01'), ('SEA-31', 'B14', 'BUS-01'), ('SEA-32', 'B15', 'BUS-01'),
('SEA-33', 'B16', 'BUS-01'), ('SEA-34', 'B17', 'BUS-01');
GO

-- Seats for BUS-02 (22 seats: 01-22)
INSERT INTO seats (seat_id, seat_number, bus_id) VALUES 
('SEA-02-01', '01', 'BUS-02'), ('SEA-02-02', '02', 'BUS-02'), ('SEA-02-03', '03', 'BUS-02'),
('SEA-02-04', '04', 'BUS-02'), ('SEA-02-05', '05', 'BUS-02'), ('SEA-02-06', '06', 'BUS-02'),
('SEA-02-07', '07', 'BUS-02'), ('SEA-02-08', '08', 'BUS-02'), ('SEA-02-09', '09', 'BUS-02'),
('SEA-02-10', '10', 'BUS-02'), ('SEA-02-11', '11', 'BUS-02'), ('SEA-02-12', '12', 'BUS-02'),
('SEA-02-13', '13', 'BUS-02'), ('SEA-02-14', '14', 'BUS-02'), ('SEA-02-15', '15', 'BUS-02'),
('SEA-02-16', '16', 'BUS-02'), ('SEA-02-17', '17', 'BUS-02'), ('SEA-02-18', '18', 'BUS-02'),
('SEA-02-19', '19', 'BUS-02'), ('SEA-02-20', '20', 'BUS-02'), ('SEA-02-21', '21', 'BUS-02'),
('SEA-02-22', '22', 'BUS-02');
GO

-- Trips
INSERT INTO trips (trip_id, route_id, bus_id, driver_id, departure_time, arrival_time, price, status) VALUES 
('TRP-01', 'RT-SGN-DLI', 'BUS-01', 'DRV-01', 
 DATEADD(HOUR, 8, CAST(DATEADD(DAY, 3, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)), 
 DATEADD(HOUR, 14, CAST(DATEADD(DAY, 3, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)), 
 200000.00, 'SCHEDULED'),
('TRP-02', 'RT-SGN-DLI', 'BUS-02', 'DRV-02', 
 DATEADD(HOUR, 10, CAST(DATEADD(DAY, 3, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)), 
 DATEADD(HOUR, 16, CAST(DATEADD(DAY, 3, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)), 
 250000.00, 'SCHEDULED');
GO

-- Bookings & Tickets
INSERT INTO bookings (booking_id, booking_code, customer_id, channel, created_at, expired_at, total_amount, status) VALUES 
('BKG-SEED-PENDING', 'BKG00001', 'USR-CUS-1', 'ONLINE', SYSDATETIME(), DATEADD(MINUTE, 10, SYSDATETIME()), 200000.00, 'PENDING'),
('BKG-SEED-CONFIRMED', 'BKG00002', 'USR-GUEST-1', 'ONLINE', SYSDATETIME(), DATEADD(MINUTE, 15, SYSDATETIME()), 200000.00, 'CONFIRMED');
GO

INSERT INTO tickets (ticket_id, ticket_code, booking_id, trip_id, seat_id, passenger_name, passenger_phone, price, status) VALUES 
('TCK-SEED-01', 'TCK00001', 'BKG-SEED-PENDING', 'TRP-01', 'SEA-01', N'Nguyễn Văn A', '0988000111', 200000.00, 'PENDING'),
('TCK-SEED-02', 'TCK00002', 'BKG-SEED-CONFIRMED', 'TRP-01', 'SEA-02', N'Khách Vãng Lai B', '0933222333', 200000.00, 'CONFIRMED');
GO
