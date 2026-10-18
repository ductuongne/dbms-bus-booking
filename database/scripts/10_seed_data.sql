-- 10_seed_data.sql

-- Provinces
INSERT INTO provinces (province_id, name) VALUES 
('PRV-01', N'Hà Nội'),
('PRV-02', N'Hồ Chí Minh'),
('PRV-03', N'Đà Nẵng'),
('PRV-04', N'Lâm Đồng'),
('PRV-05', N'Ninh Bình'),
('PRV-06', N'Hải Phòng'),
('PRV-07', N'Khánh Hòa');
GO

-- Bus Types
INSERT INTO bus_types (type_id, name, total_seats, floors) VALUES 
('BT-01', N'Xe Giường Nằm 34', 34, 2),
('BT-02', N'Xe Limousine 22', 22, 1),
('BT-03', N'Xe Ghế Ngồi 45', 45, 1);
GO

-- Users (Admin, Customer, Guest)
INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active) VALUES 
('USR-ADMIN-1', N'System Administrator', 'admin@example.com', '0901234567', '$2b$10$dummyHashStringHere123456', 'ADMIN', 0, 1),
('USR-CUS-1', N'Nguyễn Văn A', 'nva@example.com', '0988000111', '$2b$10$dummyHashStringHere789012', 'CUSTOMER', 150, 1),
('USR-GUEST-1', N'Khách Vãng Lai B', 'guestb@example.com', '0933222333', NULL, 'GUEST', 0, 1);
GO

-- Stations
INSERT INTO stations (station_id, name, province_id, address) VALUES 
('STA-01', N'Bến xe Miền Đông', 'PRV-02', N'292 Đinh Bộ Lĩnh, Bình Thạnh, TP. Hồ Chí Minh'),
('STA-02', N'Bến xe Liên Tỉnh Đà Lạt', 'PRV-04', N'Số 1 Tô Hiến Thành, Phường 3, TP. Đà Lạt, Lâm Đồng'),
('STA-03', N'Bến xe Mỹ Đình', 'PRV-01', N'Số 20 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm, Hà Nội'),
('STA-04', N'Bến xe Giáp Bát', 'PRV-01', N'Km 6 Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội'),
('STA-05', N'Bến xe Ninh Bình', 'PRV-05', N'Đường Lê Thái Tổ, Phường Nam Thành, TP. Ninh Bình'),
('STA-06', N'Bến xe Trung tâm Đà Nẵng', 'PRV-03', N'185 Tôn Đức Thắng, Hòa Minh, Liên Chiểu, Đà Nẵng'),
('STA-07', N'Bến xe Miền Tây', 'PRV-02', N'395 Kinh Dương Vương, An Lạc, Bình Tân, TP. Hồ Chí Minh'),
('STA-08', N'Trạm Dừng Chân Madagui', 'PRV-04', N'Km 152 Quốc Lộ 20, Đạ Huoai, Lâm Đồng'),
('STA-09', N'Trạm Dừng Chân Bảo Lộc', 'PRV-04', N'280 Trần Phú, Lộc Sơn, TP. Bảo Lộc, Lâm Đồng'),
('STA-10', N'Trạm Dừng Phủ Lý', 'PRV-01', N'Quốc Lộ 1A, TP. Phủ Lý, Hà Nam');
GO

-- Routes
INSERT INTO routes (route_id, departure_station_id, arrival_station_id, distance_km, estimated_duration) VALUES 
('RT-SGN-DLI', 'STA-01', 'STA-02', 300.5, 480),
('RT-HAN-NBI', 'STA-04', 'STA-05', 95.0, 90),
('RT-HAN-DAN', 'STA-03', 'STA-06', 760.0, 840),
('RT-SGN-DAN', 'STA-01', 'STA-06', 960.0, 1080);
GO

-- Intermediate Route Stations (Ordered stops)
INSERT INTO route_stations (route_station_id, route_id, station_id, stop_order) VALUES 
('RS-SGN-DLI-1', 'RT-SGN-DLI', 'STA-01', 1),
('RS-SGN-DLI-2', 'RT-SGN-DLI', 'STA-08', 2),
('RS-SGN-DLI-3', 'RT-SGN-DLI', 'STA-09', 3),
('RS-SGN-DLI-4', 'RT-SGN-DLI', 'STA-02', 4),
('RS-HAN-NBI-1', 'RT-HAN-NBI', 'STA-04', 1),
('RS-HAN-NBI-2', 'RT-HAN-NBI', 'STA-10', 2),
('RS-HAN-NBI-3', 'RT-HAN-NBI', 'STA-05', 3),
('RS-HAN-DAN-1', 'RT-HAN-DAN', 'STA-03', 1),
('RS-HAN-DAN-2', 'RT-HAN-DAN', 'STA-06', 2);
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
('BUS-02', '51B-67890', 'BT-02', 'ACTIVE'),
('BUS-03', '29B-888.12', 'BT-02', 'ACTIVE'),
('BUS-04', '29B-999.88', 'BT-03', 'ACTIVE');
GO

-- Seats for BUS-01 (34 seats: A01-A17 Tầng 1, B01-B17 Tầng 2, SLEEPER)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('SEA-01', 'A01', 1, 'SLEEPER', 'BUS-01'), ('SEA-02', 'A02', 1, 'SLEEPER', 'BUS-01'), ('SEA-03', 'A03', 1, 'SLEEPER', 'BUS-01'),
('SEA-04', 'A04', 1, 'SLEEPER', 'BUS-01'), ('SEA-05', 'A05', 1, 'SLEEPER', 'BUS-01'), ('SEA-06', 'A06', 1, 'SLEEPER', 'BUS-01'),
('SEA-07', 'A07', 1, 'SLEEPER', 'BUS-01'), ('SEA-08', 'A08', 1, 'SLEEPER', 'BUS-01'), ('SEA-09', 'A09', 1, 'SLEEPER', 'BUS-01'),
('SEA-10', 'A10', 1, 'SLEEPER', 'BUS-01'), ('SEA-11', 'A11', 1, 'SLEEPER', 'BUS-01'), ('SEA-12', 'A12', 1, 'SLEEPER', 'BUS-01'),
('SEA-13', 'A13', 1, 'SLEEPER', 'BUS-01'), ('SEA-14', 'A14', 1, 'SLEEPER', 'BUS-01'), ('SEA-15', 'A15', 1, 'SLEEPER', 'BUS-01'),
('SEA-16', 'A16', 1, 'SLEEPER', 'BUS-01'), ('SEA-17', 'A17', 1, 'SLEEPER', 'BUS-01'),
('SEA-18', 'B01', 2, 'SLEEPER', 'BUS-01'), ('SEA-19', 'B02', 2, 'SLEEPER', 'BUS-01'), ('SEA-20', 'B03', 2, 'SLEEPER', 'BUS-01'),
('SEA-21', 'B04', 2, 'SLEEPER', 'BUS-01'), ('SEA-22', 'B05', 2, 'SLEEPER', 'BUS-01'), ('SEA-23', 'B06', 2, 'SLEEPER', 'BUS-01'),
('SEA-24', 'B07', 2, 'SLEEPER', 'BUS-01'), ('SEA-25', 'B08', 2, 'SLEEPER', 'BUS-01'), ('SEA-26', 'B09', 2, 'SLEEPER', 'BUS-01'),
('SEA-27', 'B10', 2, 'SLEEPER', 'BUS-01'), ('SEA-28', 'B11', 2, 'SLEEPER', 'BUS-01'), ('SEA-29', 'B12', 2, 'SLEEPER', 'BUS-01'),
('SEA-30', 'B13', 2, 'SLEEPER', 'BUS-01'), ('SEA-31', 'B14', 2, 'SLEEPER', 'BUS-01'), ('SEA-32', 'B15', 2, 'SLEEPER', 'BUS-01'),
('SEA-33', 'B16', 2, 'SLEEPER', 'BUS-01'), ('SEA-34', 'B17', 2, 'SLEEPER', 'BUS-01');
GO

-- Seats for BUS-02 (22 seats: A01-A22 Tầng 1, VIP)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('SEA-02-01', 'A01', 1, 'VIP', 'BUS-02'), ('SEA-02-02', 'A02', 1, 'VIP', 'BUS-02'), ('SEA-02-03', 'A03', 1, 'VIP', 'BUS-02'),
('SEA-02-04', 'A04', 1, 'VIP', 'BUS-02'), ('SEA-02-05', 'A05', 1, 'VIP', 'BUS-02'), ('SEA-02-06', 'A06', 1, 'VIP', 'BUS-02'),
('SEA-02-07', 'A07', 1, 'VIP', 'BUS-02'), ('SEA-02-08', 'A08', 1, 'VIP', 'BUS-02'), ('SEA-02-09', 'A09', 1, 'VIP', 'BUS-02'),
('SEA-02-10', 'A10', 1, 'VIP', 'BUS-02'), ('SEA-02-11', 'A11', 1, 'VIP', 'BUS-02'), ('SEA-02-12', 'A12', 1, 'VIP', 'BUS-02'),
('SEA-02-13', 'A13', 1, 'VIP', 'BUS-02'), ('SEA-02-14', 'A14', 1, 'VIP', 'BUS-02'), ('SEA-02-15', 'A15', 1, 'VIP', 'BUS-02'),
('SEA-02-16', 'A16', 1, 'VIP', 'BUS-02'), ('SEA-02-17', 'A17', 1, 'VIP', 'BUS-02'), ('SEA-02-18', 'A18', 1, 'VIP', 'BUS-02'),
('SEA-02-19', 'A19', 1, 'VIP', 'BUS-02'), ('SEA-02-20', 'A20', 1, 'VIP', 'BUS-02'), ('SEA-02-21', 'A21', 1, 'VIP', 'BUS-02'),
('SEA-02-22', 'A22', 1, 'VIP', 'BUS-02');
GO

-- Seats for BUS-03 (22 seats: A01-A22 Tầng 1, VIP)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('SEA-03-01', 'A01', 1, 'VIP', 'BUS-03'), ('SEA-03-02', 'A02', 1, 'VIP', 'BUS-03'), ('SEA-03-03', 'A03', 1, 'VIP', 'BUS-03'),
('SEA-03-04', 'A04', 1, 'VIP', 'BUS-03'), ('SEA-03-05', 'A05', 1, 'VIP', 'BUS-03'), ('SEA-03-06', 'A06', 1, 'VIP', 'BUS-03'),
('SEA-03-07', 'A07', 1, 'VIP', 'BUS-03'), ('SEA-03-08', 'A08', 1, 'VIP', 'BUS-03'), ('SEA-03-09', 'A09', 1, 'VIP', 'BUS-03'),
('SEA-03-10', 'A10', 1, 'VIP', 'BUS-03'), ('SEA-03-11', 'A11', 1, 'VIP', 'BUS-03'), ('SEA-03-12', 'A12', 1, 'VIP', 'BUS-03'),
('SEA-03-13', 'A13', 1, 'VIP', 'BUS-03'), ('SEA-03-14', 'A14', 1, 'VIP', 'BUS-03'), ('SEA-03-15', 'A15', 1, 'VIP', 'BUS-03'),
('SEA-03-16', 'A16', 1, 'VIP', 'BUS-03'), ('SEA-03-17', 'A17', 1, 'VIP', 'BUS-03'), ('SEA-03-18', 'A18', 1, 'VIP', 'BUS-03'),
('SEA-03-19', 'A19', 1, 'VIP', 'BUS-03'), ('SEA-03-20', 'A20', 1, 'VIP', 'BUS-03'), ('SEA-03-21', 'A21', 1, 'VIP', 'BUS-03'),
('SEA-03-22', 'A22', 1, 'VIP', 'BUS-03');
GO

-- Seats for BUS-04 (45 seats: A01-A45 Tầng 1, NORMAL)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('SEA-04-01', 'A01', 1, 'NORMAL', 'BUS-04'), ('SEA-04-02', 'A02', 1, 'NORMAL', 'BUS-04'), ('SEA-04-03', 'A03', 1, 'NORMAL', 'BUS-04'),
('SEA-04-04', 'A04', 1, 'NORMAL', 'BUS-04'), ('SEA-04-05', 'A05', 1, 'NORMAL', 'BUS-04'), ('SEA-04-06', 'A06', 1, 'NORMAL', 'BUS-04'),
('SEA-04-07', 'A07', 1, 'NORMAL', 'BUS-04'), ('SEA-04-08', 'A08', 1, 'NORMAL', 'BUS-04'), ('SEA-04-09', 'A09', 1, 'NORMAL', 'BUS-04'),
('SEA-04-10', 'A10', 1, 'NORMAL', 'BUS-04'), ('SEA-04-11', 'A11', 1, 'NORMAL', 'BUS-04'), ('SEA-04-12', 'A12', 1, 'NORMAL', 'BUS-04'),
('SEA-04-13', 'A13', 1, 'NORMAL', 'BUS-04'), ('SEA-04-14', 'A14', 1, 'NORMAL', 'BUS-04'), ('SEA-04-15', 'A15', 1, 'NORMAL', 'BUS-04'),
('SEA-04-16', 'A16', 1, 'NORMAL', 'BUS-04'), ('SEA-04-17', 'A17', 1, 'NORMAL', 'BUS-04'), ('SEA-04-18', 'A18', 1, 'NORMAL', 'BUS-04'),
('SEA-04-19', 'A19', 1, 'NORMAL', 'BUS-04'), ('SEA-04-20', 'A20', 1, 'NORMAL', 'BUS-04'), ('SEA-04-21', 'A21', 1, 'NORMAL', 'BUS-04'),
('SEA-04-22', 'A22', 1, 'NORMAL', 'BUS-04'), ('SEA-04-23', 'A23', 1, 'NORMAL', 'BUS-04'), ('SEA-04-24', 'A24', 1, 'NORMAL', 'BUS-04'),
('SEA-04-25', 'A25', 1, 'NORMAL', 'BUS-04'), ('SEA-04-26', 'A26', 1, 'NORMAL', 'BUS-04'), ('SEA-04-27', 'A27', 1, 'NORMAL', 'BUS-04'),
('SEA-04-28', 'A28', 1, 'NORMAL', 'BUS-04'), ('SEA-04-29', 'A29', 1, 'NORMAL', 'BUS-04'), ('SEA-04-30', 'A30', 1, 'NORMAL', 'BUS-04'),
('SEA-04-31', 'A31', 1, 'NORMAL', 'BUS-04'), ('SEA-04-32', 'A32', 1, 'NORMAL', 'BUS-04'), ('SEA-04-33', 'A33', 1, 'NORMAL', 'BUS-04'),
('SEA-04-34', 'A34', 1, 'NORMAL', 'BUS-04'), ('SEA-04-35', 'A35', 1, 'NORMAL', 'BUS-04'), ('SEA-04-36', 'A36', 1, 'NORMAL', 'BUS-04'),
('SEA-04-37', 'A37', 1, 'NORMAL', 'BUS-04'), ('SEA-04-38', 'A38', 1, 'NORMAL', 'BUS-04'), ('SEA-04-39', 'A39', 1, 'NORMAL', 'BUS-04'),
('SEA-04-40', 'A40', 1, 'NORMAL', 'BUS-04'), ('SEA-04-41', 'A41', 1, 'NORMAL', 'BUS-04'), ('SEA-04-42', 'A42', 1, 'NORMAL', 'BUS-04'),
('SEA-04-43', 'A43', 1, 'NORMAL', 'BUS-04'), ('SEA-04-44', 'A44', 1, 'NORMAL', 'BUS-04'), ('SEA-04-45', 'A45', 1, 'NORMAL', 'BUS-04');
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
 250000.00, 'SCHEDULED'),
('TRP-03', 'RT-HAN-NBI', 'BUS-03', 'DRV-01',
 DATEADD(HOUR, 7, CAST(DATEADD(DAY, 1, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)),
 DATEADD(HOUR, 9, CAST(DATEADD(DAY, 1, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)),
 120000.00, 'SCHEDULED');
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
