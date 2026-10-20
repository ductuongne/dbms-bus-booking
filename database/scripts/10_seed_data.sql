-- ==============================================================================
-- 10_seed_data.sql
-- DỮ LIỆU MẪU ĐỒ ÁN HỆ QUẢN TRỊ CSDL (SQL SERVER) - BÁN VÉ XE KHÁCH
-- ==============================================================================

SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

-- 1. TỈNH / THÀNH PHỐ
INSERT INTO provinces (province_id, name) VALUES 
('PRV-01', N'Hà Nội'),
('PRV-02', N'Hồ Chí Minh'),
('PRV-03', N'Đà Nẵng'),
('PRV-04', N'Lâm Đồng'),
('PRV-05', N'Ninh Bình'),
('PRV-06', N'Hải Phòng'),
('PRV-07', N'Khánh Hòa');
GO

-- 2. LOẠI PHƯƠNG TIỆN
INSERT INTO bus_types (type_id, name, total_seats, floors) VALUES 
('BT-01', N'Xe Giường Nằm 34', 34, 2),
('BT-02', N'Xe Limousine 22', 22, 1),
('BT-03', N'Xe Ghế Ngồi 45', 45, 1);
GO

-- 3. NGƯỜI DÙNG (Admin, Nhân viên, Tài xế, Khách hàng)
-- Mật khẩu mặc định cho toàn bộ tài khoản thử nghiệm: '12345678'
-- Hash: $2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S
INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active) VALUES 
('USR-ADMIN-1', N'Quản Trị Viên Hệ Thống', 'admin@example.com', '0901234567', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'ADMIN', 0, 1),
('USR-STF-1', N'Nhân viên Bán vé Hoàng Mai', 'staff@example.com', '0902223334', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'STAFF', 0, 1),
('USR-DRV-1', N'Tài xế Nguyễn Văn Một', 'driver1@example.com', '0911000001', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'DRIVER', 0, 1),
('USR-DRV-2', N'Tài xế Trần Văn Hai', 'driver2@example.com', '0911000002', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'DRIVER', 0, 1),
('USR-DRV-3', N'Tài xế Lê Hoàng Ba', 'driver3@example.com', '0911000003', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'DRIVER', 0, 1),
('USR-DRV-4', N'Tài xế Phạm Quốc Bốn', 'driver4@example.com', '0911000004', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'DRIVER', 0, 1),
('USR-DRV-5', N'Tài xế Võ Văn Năm', 'driver5@example.com', '0911000005', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'DRIVER', 0, 1),
('USR-DRV-6', N'Tài xế Đặng Tuấn Sáu', 'driver6@example.com', '0911000006', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'DRIVER', 0, 1),
('USR-CUS-1', N'Nguyễn Văn A', 'nva@example.com', '0988000111', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'CUSTOMER', 150, 1),
('USR-CUS-2', N'Trần Thị Bích', 'bichtran@example.com', '0988000222', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'CUSTOMER', 80, 1),
('USR-CUS-3', N'Lê Hoàng Nam', 'namle@example.com', '0988000333', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'CUSTOMER', 220, 1),
('USR-GUEST-1', N'Khách Vãng Lai B', 'guestb@example.com', '0933222333', NULL, 'GUEST', 0, 1);
GO

-- 4. BẢNG TÀI XẾ (drivers)
INSERT INTO drivers (driver_id, user_id, license_number, license_expiry) VALUES 
('DRV-01', 'USR-DRV-1', 'B2-12345678', '2030-12-31'),
('DRV-02', 'USR-DRV-2', 'D-87654321', '2030-12-31'),
('DRV-03', 'USR-DRV-3', 'E-11223344', '2030-12-31'),
('DRV-04', 'USR-DRV-4', 'E-55667788', '2030-12-31'),
('DRV-05', 'USR-DRV-5', 'D-99887766', '2030-12-31'),
('DRV-06', 'USR-DRV-6', 'E-44332211', '2030-12-31');
GO

-- 5. BẾN XE VÀ ĐIỂM DỪNG (stations)
INSERT INTO stations (station_id, name, province_id, address) VALUES 
('STA-01', N'Bến xe Miền Đông', 'PRV-02', N'292 Đinh Bộ Lĩnh, Phường 26, Bình Thạnh, TP. Hồ Chí Minh'),
('STA-02', N'Bến xe Liên Tỉnh Đà Lạt', 'PRV-04', N'Số 1 Tô Hiến Thành, Phường 3, TP. Đà Lạt, Lâm Đồng'),
('STA-03', N'Bến xe Mỹ Đình', 'PRV-01', N'Số 20 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm, Hà Nội'),
('STA-04', N'Bến xe Giáp Bát', 'PRV-01', N'Km 6 Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội'),
('STA-05', N'Bến xe Ninh Bình', 'PRV-05', N'Đường Lê Thái Tổ, Phường Nam Thành, TP. Ninh Bình'),
('STA-06', N'Bến xe Trung tâm Đà Nẵng', 'PRV-03', N'185 Tôn Đức Thắng, Hòa Minh, Liên Chiểu, Đà Nẵng'),
('STA-07', N'Bến xe Miền Tây', 'PRV-02', N'395 Kinh Dương Vương, An Lạc, Bình Tân, TP. Hồ Chí Minh'),
('STA-08', N'Trạm Dừng Chân Madagui', 'PRV-04', N'Km 152 Quốc Lộ 20, Đạ Huoai, Lâm Đồng'),
('STA-09', N'Trạm Dừng Chân Bảo Lộc', 'PRV-04', N'280 Trần Phú, Lộc Sơn, TP. Bảo Lộc, Lâm Đồng'),
('STA-10', N'Trạm Dừng Phủ Lý', 'PRV-01', N'Quốc Lộ 1A, TP. Phủ Lý, Hà Nam'),
('STA-11', N'Bến xe Cầu Rào', 'PRV-06', N'Số 1 Thiên Lôi, Ngô Quyền, Hải Phòng'),
('STA-12', N'Bến xe Phía Nam Nha Trang', 'PRV-07', N'Km 6 Đường 23 Tháng 10, Nha Trang, Khánh Hòa');
GO

-- 6. TUYẾN ĐƯỜNG (routes)
INSERT INTO routes (route_id, departure_station_id, arrival_station_id, distance_km, estimated_duration) VALUES 
('RT-SGN-DLI', 'STA-01', 'STA-02', 300.5, 480),
('RT-HAN-NBI', 'STA-04', 'STA-05', 95.0, 90),
('RT-HAN-DAN', 'STA-03', 'STA-06', 760.0, 840),
('RT-SGN-DAN', 'STA-01', 'STA-06', 960.0, 1080),
('RT-HAN-HPH', 'STA-03', 'STA-11', 120.0, 110),
('RT-SGN-NTR', 'STA-01', 'STA-12', 430.0, 510);
GO

-- 7. ĐIỂM DỪNG TRUNG GIAN TRÊN TUYẾN (route_stations)
INSERT INTO route_stations (route_station_id, route_id, station_id, stop_order) VALUES 
('RS-SGN-DLI-1', 'RT-SGN-DLI', 'STA-01', 1),
('RS-SGN-DLI-2', 'RT-SGN-DLI', 'STA-08', 2),
('RS-SGN-DLI-3', 'RT-SGN-DLI', 'STA-09', 3),
('RS-SGN-DLI-4', 'RT-SGN-DLI', 'STA-02', 4),
('RS-HAN-NBI-1', 'RT-HAN-NBI', 'STA-04', 1),
('RS-HAN-NBI-2', 'RT-HAN-NBI', 'STA-10', 2),
('RS-HAN-NBI-3', 'RT-HAN-NBI', 'STA-05', 3),
('RS-HAN-DAN-1', 'RT-HAN-DAN', 'STA-03', 1),
('RS-HAN-DAN-2', 'RT-HAN-DAN', 'STA-06', 2),
('RS-SGN-NTR-1', 'RT-SGN-NTR', 'STA-01', 1),
('RS-SGN-NTR-2', 'RT-SGN-NTR', 'STA-12', 2);
GO

-- 8. PHƯƠNG TIỆN (10 buses)
INSERT INTO buses (bus_id, license_plate, type_id, status) VALUES 
('BUS-01', '51B-123.45', 'BT-01', 'ACTIVE'),
('BUS-02', '51B-678.90', 'BT-02', 'ACTIVE'),
('BUS-03', '29B-888.12', 'BT-02', 'ACTIVE'),
('BUS-04', '29B-999.88', 'BT-03', 'ACTIVE'),
('BUS-05', '51B-246.80', 'BT-01', 'ACTIVE'),
('BUS-06', '43B-135.79', 'BT-02', 'ACTIVE'),
('BUS-07', '43B-987.65', 'BT-01', 'ACTIVE'),
('BUS-08', '15B-321.45', 'BT-03', 'ACTIVE'),
('BUS-09', '79B-654.32', 'BT-02', 'ACTIVE'),
('BUS-10', '29B-112.23', 'BT-01', 'ACTIVE');
GO

-- 9. DANH SÁCH GHẾ CHO 10 PHƯƠNG TIỆN
-- Ghế cho xe BUS-01 (BT-01)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('S-BUS-01-A01', 'A01', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B01', 'B01', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A02', 'A02', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B02', 'B02', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A03', 'A03', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B03', 'B03', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A04', 'A04', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B04', 'B04', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A05', 'A05', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B05', 'B05', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A06', 'A06', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B06', 'B06', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A07', 'A07', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B07', 'B07', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A08', 'A08', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B08', 'B08', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A09', 'A09', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B09', 'B09', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A10', 'A10', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B10', 'B10', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A11', 'A11', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B11', 'B11', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A12', 'A12', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B12', 'B12', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A13', 'A13', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B13', 'B13', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A14', 'A14', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B14', 'B14', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A15', 'A15', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B15', 'B15', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A16', 'A16', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B16', 'B16', 2, 'SLEEPER', 'BUS-01'),
('S-BUS-01-A17', 'A17', 1, 'SLEEPER', 'BUS-01'),
('S-BUS-01-B17', 'B17', 2, 'SLEEPER', 'BUS-01');
GO

-- Ghế cho xe BUS-02 (BT-02)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('S-BUS-02-A01', 'A01', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A02', 'A02', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A03', 'A03', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A04', 'A04', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A05', 'A05', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A06', 'A06', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A07', 'A07', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A08', 'A08', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A09', 'A09', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A10', 'A10', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A11', 'A11', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A12', 'A12', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A13', 'A13', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A14', 'A14', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A15', 'A15', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A16', 'A16', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A17', 'A17', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A18', 'A18', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A19', 'A19', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A20', 'A20', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A21', 'A21', 1, 'VIP', 'BUS-02'),
('S-BUS-02-A22', 'A22', 1, 'VIP', 'BUS-02');
GO

-- Ghế cho xe BUS-03 (BT-02)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('S-BUS-03-A01', 'A01', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A02', 'A02', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A03', 'A03', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A04', 'A04', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A05', 'A05', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A06', 'A06', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A07', 'A07', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A08', 'A08', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A09', 'A09', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A10', 'A10', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A11', 'A11', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A12', 'A12', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A13', 'A13', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A14', 'A14', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A15', 'A15', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A16', 'A16', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A17', 'A17', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A18', 'A18', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A19', 'A19', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A20', 'A20', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A21', 'A21', 1, 'VIP', 'BUS-03'),
('S-BUS-03-A22', 'A22', 1, 'VIP', 'BUS-03');
GO

-- Ghế cho xe BUS-04 (BT-03)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('S-BUS-04-A01', 'A01', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A02', 'A02', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A03', 'A03', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A04', 'A04', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A05', 'A05', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A06', 'A06', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A07', 'A07', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A08', 'A08', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A09', 'A09', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A10', 'A10', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A11', 'A11', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A12', 'A12', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A13', 'A13', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A14', 'A14', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A15', 'A15', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A16', 'A16', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A17', 'A17', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A18', 'A18', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A19', 'A19', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A20', 'A20', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A21', 'A21', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A22', 'A22', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A23', 'A23', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A24', 'A24', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A25', 'A25', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A26', 'A26', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A27', 'A27', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A28', 'A28', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A29', 'A29', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A30', 'A30', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A31', 'A31', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A32', 'A32', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A33', 'A33', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A34', 'A34', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A35', 'A35', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A36', 'A36', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A37', 'A37', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A38', 'A38', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A39', 'A39', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A40', 'A40', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A41', 'A41', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A42', 'A42', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A43', 'A43', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A44', 'A44', 1, 'NORMAL', 'BUS-04'),
('S-BUS-04-A45', 'A45', 1, 'NORMAL', 'BUS-04');
GO

-- Ghế cho xe BUS-05 (BT-01)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('S-BUS-05-A01', 'A01', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B01', 'B01', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A02', 'A02', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B02', 'B02', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A03', 'A03', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B03', 'B03', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A04', 'A04', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B04', 'B04', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A05', 'A05', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B05', 'B05', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A06', 'A06', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B06', 'B06', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A07', 'A07', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B07', 'B07', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A08', 'A08', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B08', 'B08', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A09', 'A09', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B09', 'B09', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A10', 'A10', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B10', 'B10', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A11', 'A11', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B11', 'B11', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A12', 'A12', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B12', 'B12', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A13', 'A13', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B13', 'B13', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A14', 'A14', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B14', 'B14', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A15', 'A15', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B15', 'B15', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A16', 'A16', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B16', 'B16', 2, 'SLEEPER', 'BUS-05'),
('S-BUS-05-A17', 'A17', 1, 'SLEEPER', 'BUS-05'),
('S-BUS-05-B17', 'B17', 2, 'SLEEPER', 'BUS-05');
GO

-- Ghế cho xe BUS-06 (BT-02)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('S-BUS-06-A01', 'A01', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A02', 'A02', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A03', 'A03', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A04', 'A04', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A05', 'A05', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A06', 'A06', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A07', 'A07', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A08', 'A08', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A09', 'A09', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A10', 'A10', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A11', 'A11', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A12', 'A12', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A13', 'A13', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A14', 'A14', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A15', 'A15', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A16', 'A16', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A17', 'A17', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A18', 'A18', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A19', 'A19', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A20', 'A20', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A21', 'A21', 1, 'VIP', 'BUS-06'),
('S-BUS-06-A22', 'A22', 1, 'VIP', 'BUS-06');
GO

-- Ghế cho xe BUS-07 (BT-01)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('S-BUS-07-A01', 'A01', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B01', 'B01', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A02', 'A02', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B02', 'B02', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A03', 'A03', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B03', 'B03', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A04', 'A04', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B04', 'B04', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A05', 'A05', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B05', 'B05', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A06', 'A06', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B06', 'B06', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A07', 'A07', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B07', 'B07', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A08', 'A08', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B08', 'B08', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A09', 'A09', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B09', 'B09', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A10', 'A10', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B10', 'B10', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A11', 'A11', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B11', 'B11', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A12', 'A12', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B12', 'B12', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A13', 'A13', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B13', 'B13', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A14', 'A14', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B14', 'B14', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A15', 'A15', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B15', 'B15', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A16', 'A16', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B16', 'B16', 2, 'SLEEPER', 'BUS-07'),
('S-BUS-07-A17', 'A17', 1, 'SLEEPER', 'BUS-07'),
('S-BUS-07-B17', 'B17', 2, 'SLEEPER', 'BUS-07');
GO

-- Ghế cho xe BUS-08 (BT-03)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('S-BUS-08-A01', 'A01', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A02', 'A02', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A03', 'A03', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A04', 'A04', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A05', 'A05', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A06', 'A06', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A07', 'A07', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A08', 'A08', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A09', 'A09', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A10', 'A10', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A11', 'A11', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A12', 'A12', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A13', 'A13', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A14', 'A14', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A15', 'A15', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A16', 'A16', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A17', 'A17', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A18', 'A18', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A19', 'A19', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A20', 'A20', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A21', 'A21', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A22', 'A22', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A23', 'A23', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A24', 'A24', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A25', 'A25', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A26', 'A26', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A27', 'A27', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A28', 'A28', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A29', 'A29', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A30', 'A30', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A31', 'A31', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A32', 'A32', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A33', 'A33', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A34', 'A34', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A35', 'A35', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A36', 'A36', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A37', 'A37', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A38', 'A38', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A39', 'A39', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A40', 'A40', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A41', 'A41', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A42', 'A42', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A43', 'A43', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A44', 'A44', 1, 'NORMAL', 'BUS-08'),
('S-BUS-08-A45', 'A45', 1, 'NORMAL', 'BUS-08');
GO

-- Ghế cho xe BUS-09 (BT-02)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('S-BUS-09-A01', 'A01', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A02', 'A02', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A03', 'A03', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A04', 'A04', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A05', 'A05', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A06', 'A06', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A07', 'A07', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A08', 'A08', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A09', 'A09', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A10', 'A10', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A11', 'A11', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A12', 'A12', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A13', 'A13', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A14', 'A14', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A15', 'A15', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A16', 'A16', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A17', 'A17', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A18', 'A18', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A19', 'A19', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A20', 'A20', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A21', 'A21', 1, 'VIP', 'BUS-09'),
('S-BUS-09-A22', 'A22', 1, 'VIP', 'BUS-09');
GO

-- Ghế cho xe BUS-10 (BT-01)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('S-BUS-10-A01', 'A01', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B01', 'B01', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A02', 'A02', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B02', 'B02', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A03', 'A03', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B03', 'B03', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A04', 'A04', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B04', 'B04', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A05', 'A05', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B05', 'B05', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A06', 'A06', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B06', 'B06', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A07', 'A07', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B07', 'B07', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A08', 'A08', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B08', 'B08', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A09', 'A09', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B09', 'B09', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A10', 'A10', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B10', 'B10', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A11', 'A11', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B11', 'B11', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A12', 'A12', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B12', 'B12', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A13', 'A13', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B13', 'B13', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A14', 'A14', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B14', 'B14', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A15', 'A15', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B15', 'B15', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A16', 'A16', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B16', 'B16', 2, 'SLEEPER', 'BUS-10'),
('S-BUS-10-A17', 'A17', 1, 'SLEEPER', 'BUS-10'),
('S-BUS-10-B17', 'B17', 2, 'SLEEPER', 'BUS-10');
GO


-- ==============================================================================
-- 10. DỮ LIỆU CHUYẾN XE (TRIPS)
-- ==============================================================================

-- 10.1. CHUYẾN QUÁ KHỨ (COMPLETED) - Tạo doanh thu thực tế cho báo cáo
INSERT INTO trips (trip_id, route_id, bus_id, driver_id, departure_time, arrival_time, price, status) VALUES 
('TRP-PAST-01', 'RT-SGN-DLI', 'BUS-01', 'DRV-01', DATEADD(DAY, -7, DATEADD(HOUR, 8, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), DATEADD(DAY, -7, DATEADD(HOUR, 16, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 220000.00, 'COMPLETED'),
('TRP-PAST-02', 'RT-HAN-NBI', 'BUS-04', 'DRV-02', DATEADD(DAY, -6, DATEADD(HOUR, 7, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), DATEADD(DAY, -6, DATEADD(HOUR, 9, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 120000.00, 'COMPLETED'),
('TRP-PAST-03', 'RT-HAN-DAN', 'BUS-03', 'DRV-03', DATEADD(DAY, -5, DATEADD(HOUR, 17, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), DATEADD(DAY, -4, DATEADD(HOUR, 7, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 450000.00, 'COMPLETED'),
('TRP-PAST-04', 'RT-SGN-DLI', 'BUS-02', 'DRV-01', DATEADD(DAY, -4, DATEADD(HOUR, 9, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), DATEADD(DAY, -4, DATEADD(HOUR, 17, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 250000.00, 'COMPLETED'),
('TRP-PAST-05', 'RT-HAN-HPH', 'BUS-08', 'DRV-04', DATEADD(DAY, -3, DATEADD(HOUR, 6, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), DATEADD(DAY, -3, DATEADD(HOUR, 8, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 110000.00, 'COMPLETED'),
('TRP-PAST-06', 'RT-SGN-DAN', 'BUS-05', 'DRV-05', DATEADD(DAY, -2, DATEADD(HOUR, 13, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), DATEADD(DAY, -1, DATEADD(HOUR, 7, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 480000.00, 'COMPLETED'),
('TRP-PAST-07', 'RT-SGN-NTR', 'BUS-09', 'DRV-06', DATEADD(DAY, -1, DATEADD(HOUR, 20, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), DATEADD(HOUR, 5, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2)), 320000.00, 'COMPLETED');
GO

-- 10.2. CHUYẾN HÔM NAY (TODAY) - Demo Tài xế check-in và khởi hành
INSERT INTO trips (trip_id, route_id, bus_id, driver_id, departure_time, arrival_time, price, status) VALUES 
('TRP-TODAY-01', 'RT-SGN-DLI', 'BUS-01', 'DRV-01', 
 DATEADD(HOUR, 14, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2)), 
 DATEADD(HOUR, 22, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2)), 
 220000.00, 'SCHEDULED'),

('TRP-TODAY-02', 'RT-HAN-NBI', 'BUS-04', 'DRV-02', 
 DATEADD(HOUR, 8, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2)), 
 DATEADD(HOUR, 10, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2)), 
 120000.00, 'DEPARTED'),

('TRP-TODAY-03', 'RT-HAN-DAN', 'BUS-03', 'DRV-03', 
 DATEADD(HOUR, 20, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2)), 
 DATEADD(HOUR, 34, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2)), 
 450000.00, 'SCHEDULED');
GO

-- 10.3. CHUYẾN TƯƠNG LAI (UPCOMING) - Khách hàng tìm kiếm và đặt vé
INSERT INTO trips (trip_id, route_id, bus_id, driver_id, departure_time, arrival_time, price, status) VALUES 
('TRP-FUT-01', 'RT-SGN-DLI', 'BUS-02', 'DRV-01', 
 DATEADD(DAY, 1, DATEADD(HOUR, 8, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 
 DATEADD(DAY, 1, DATEADD(HOUR, 16, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 
 250000.00, 'SCHEDULED'),

('TRP-FUT-02', 'RT-HAN-NBI', 'BUS-04', 'DRV-02', 
 DATEADD(DAY, 1, DATEADD(HOUR, 9, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 
 DATEADD(DAY, 1, DATEADD(HOUR, 11, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 
 120000.00, 'SCHEDULED'),

('TRP-FUT-03', 'RT-SGN-DAN', 'BUS-05', 'DRV-05', 
 DATEADD(DAY, 2, DATEADD(HOUR, 11, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 
 DATEADD(DAY, 3, DATEADD(HOUR, 5, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 
 480000.00, 'SCHEDULED'),

('TRP-FUT-04', 'RT-HAN-HPH', 'BUS-08', 'DRV-04', 
 DATEADD(DAY, 2, DATEADD(HOUR, 14, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 
 DATEADD(DAY, 2, DATEADD(HOUR, 16, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 
 110000.00, 'SCHEDULED'),

('TRP-FUT-05', 'RT-SGN-NTR', 'BUS-09', 'DRV-06', 
 DATEADD(DAY, 3, DATEADD(HOUR, 21, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 
 DATEADD(DAY, 4, DATEADD(HOUR, 6, CAST(CAST(SYSDATETIME() AS DATE) AS DATETIME2))), 
 320000.00, 'SCHEDULED');
GO

-- ==============================================================================
-- 11. ĐƠN ĐẶT VÉ (BOOKINGS), VÉ (TICKETS) & THANH TOÁN (PAYMENTS)
-- ==============================================================================

-- 11.1. BOOKINGS CHO CÁC CHUYẾN QUÁ KHỨ (Tạo doanh thu thực tế cho báo cáo)
INSERT INTO bookings (booking_id, booking_code, customer_id, channel, created_at, expired_at, total_amount, status) VALUES 
('BKG-P01', 'BKG10001', 'USR-CUS-1', 'ONLINE', DATEADD(DAY, -7, SYSDATETIME()), DATEADD(DAY, -7, DATEADD(MINUTE, 30, SYSDATETIME())), 440000.00, 'CONFIRMED'),
('BKG-P02', 'BKG10002', 'USR-CUS-2', 'ONLINE', DATEADD(DAY, -6, SYSDATETIME()), DATEADD(DAY, -6, DATEADD(MINUTE, 30, SYSDATETIME())), 240000.00, 'CONFIRMED'),
('BKG-P03', 'BKG10003', 'USR-CUS-3', 'ONLINE', DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, -5, DATEADD(MINUTE, 30, SYSDATETIME())), 900000.00, 'CONFIRMED'),
('BKG-P04', 'BKG10004', 'USR-CUS-1', 'ONLINE', DATEADD(DAY, -4, SYSDATETIME()), DATEADD(DAY, -4, DATEADD(MINUTE, 30, SYSDATETIME())), 500000.00, 'CONFIRMED'),
('BKG-P05', 'BKG10005', 'USR-CUS-2', 'ONLINE', DATEADD(DAY, -3, SYSDATETIME()), DATEADD(DAY, -3, DATEADD(MINUTE, 30, SYSDATETIME())), 330000.00, 'CONFIRMED'),
('BKG-P06', 'BKG10006', 'USR-CUS-3', 'ONLINE', DATEADD(DAY, -2, SYSDATETIME()), DATEADD(DAY, -2, DATEADD(MINUTE, 30, SYSDATETIME())), 960000.00, 'CONFIRMED'),
('BKG-P07', 'BKG10007', 'USR-GUEST-1', 'COUNTER', DATEADD(DAY, -1, SYSDATETIME()), DATEADD(DAY, -1, DATEADD(MINUTE, 30, SYSDATETIME())), 640000.00, 'CONFIRMED');
GO

-- VÉ CHO CÁC CHUYẾN QUÁ KHỨ (Trạng thái CHECKED_IN hoàn tất chuyến)
INSERT INTO tickets (ticket_id, ticket_code, booking_id, trip_id, seat_id, passenger_name, passenger_phone, price, status) VALUES 
('TCK-P01-1', 'TCK10001', 'BKG-P01', 'TRP-PAST-01', 'S-BUS-01-A01', N'Nguyễn Văn A', '0988000111', 220000.00, 'CHECKED_IN'),
('TCK-P01-2', 'TCK10002', 'BKG-P01', 'TRP-PAST-01', 'S-BUS-01-A02', N'Nguyễn Thị Mai', '0988000111', 220000.00, 'CHECKED_IN'),
('TCK-P02-1', 'TCK10003', 'BKG-P02', 'TRP-PAST-02', 'S-BUS-04-A01', N'Trần Thị Bích', '0988000222', 120000.00, 'CHECKED_IN'),
('TCK-P02-2', 'TCK10004', 'BKG-P02', 'TRP-PAST-02', 'S-BUS-04-A02', N'Lê Minh Khang', '0988000222', 120000.00, 'CHECKED_IN'),
('TCK-P03-1', 'TCK10005', 'BKG-P03', 'TRP-PAST-03', 'S-BUS-03-A01', N'Lê Hoàng Nam', '0988000333', 450000.00, 'CHECKED_IN'),
('TCK-P03-2', 'TCK10006', 'BKG-P03', 'TRP-PAST-03', 'S-BUS-03-A02', N'Vũ Phương Thảo', '0988000333', 450000.00, 'CHECKED_IN'),
('TCK-P04-1', 'TCK10007', 'BKG-P04', 'TRP-PAST-04', 'S-BUS-02-A01', N'Nguyễn Văn A', '0988000111', 250000.00, 'CHECKED_IN'),
('TCK-P04-2', 'TCK10008', 'BKG-P04', 'TRP-PAST-04', 'S-BUS-02-A02', N'Đặng Thu Hà', '0988000111', 250000.00, 'CHECKED_IN'),
('TCK-P05-1', 'TCK10009', 'BKG-P05', 'TRP-PAST-05', 'S-BUS-08-A01', N'Trần Thị Bích', '0988000222', 110000.00, 'CHECKED_IN'),
('TCK-P05-2', 'TCK10010', 'BKG-P05', 'TRP-PAST-05', 'S-BUS-08-A02', N'Ngô Gia Bảo', '0988000222', 110000.00, 'CHECKED_IN'),
('TCK-P05-3', 'TCK10011', 'BKG-P05', 'TRP-PAST-05', 'S-BUS-08-A03', N'Ngô Thanh Hằng', '0988000222', 110000.00, 'CHECKED_IN'),
('TCK-P06-1', 'TCK10012', 'BKG-P06', 'TRP-PAST-06', 'S-BUS-05-A01', N'Lê Hoàng Nam', '0988000333', 480000.00, 'CHECKED_IN'),
('TCK-P06-2', 'TCK10013', 'BKG-P06', 'TRP-PAST-06', 'S-BUS-05-A02', N'Dương Thúy Vy', '0988000333', 480000.00, 'CHECKED_IN'),
('TCK-P07-1', 'TCK10014', 'BKG-P07', 'TRP-PAST-07', 'S-BUS-09-A01', N'Khách Vãng Lai B', '0933222333', 320000.00, 'CHECKED_IN'),
('TCK-P07-2', 'TCK10015', 'BKG-P07', 'TRP-PAST-07', 'S-BUS-09-A02', N'Phan Văn Cường', '0933222333', 320000.00, 'CHECKED_IN');
GO

-- THANH TOÁN CHO CÁC CHUYẾN QUÁ KHỨ (SUCCESS - Tạo doanh thu tổng 4.010.000 VNĐ trong tuần qua)
INSERT INTO payments (payment_id, booking_id, method, amount, paid_at, transaction_code, status) VALUES 
('PAY-P01', 'BKG-P01', 'BANK_TRANSFER', 440000.00, DATEADD(DAY, -7, SYSDATETIME()), 'VQR-BKG10001', 'SUCCESS'),
('PAY-P02', 'BKG-P02', 'BANK_TRANSFER', 240000.00, DATEADD(DAY, -6, SYSDATETIME()), 'VQR-BKG10002', 'SUCCESS'),
('PAY-P03', 'BKG-P03', 'BANK_TRANSFER', 900000.00, DATEADD(DAY, -5, SYSDATETIME()), 'VQR-BKG10003', 'SUCCESS'),
('PAY-P04', 'BKG-P04', 'BANK_TRANSFER', 500000.00, DATEADD(DAY, -4, SYSDATETIME()), 'VQR-BKG10004', 'SUCCESS'),
('PAY-P05', 'BKG-P05', 'BANK_TRANSFER', 330000.00, DATEADD(DAY, -3, SYSDATETIME()), 'VQR-BKG10005', 'SUCCESS'),
('PAY-P06', 'BKG-P06', 'BANK_TRANSFER', 960000.00, DATEADD(DAY, -2, SYSDATETIME()), 'VQR-BKG10006', 'SUCCESS'),
('PAY-P07', 'BKG-P07', 'CASH',          640000.00, DATEADD(DAY, -1, SYSDATETIME()), 'CASH-PAY-P07',  'SUCCESS');
GO

-- 11.2. BOOKINGS CHO CHUYẾN HÔM NAY (Phục vụ Tài xế Nguyễn Văn Một DRV-01 soát vé)
INSERT INTO bookings (booking_id, booking_code, customer_id, channel, created_at, expired_at, total_amount, status) VALUES 
('BKG-TODAY-01', 'BKG20001', 'USR-CUS-1', 'ONLINE', DATEADD(HOUR, -2, SYSDATETIME()), DATEADD(HOUR, 2, SYSDATETIME()), 440000.00, 'CONFIRMED'),
('BKG-TODAY-02', 'BKG20002', 'USR-CUS-2', 'ONLINE', DATEADD(HOUR, -1, SYSDATETIME()), DATEADD(HOUR, 3, SYSDATETIME()), 220000.00, 'CONFIRMED');
GO

-- VÉ CHUYẾN HÔM NAY: 2 vé CONFIRMED (chờ soát vé) và 1 vé đã CHECKED_IN
INSERT INTO tickets (ticket_id, ticket_code, booking_id, trip_id, seat_id, passenger_name, passenger_phone, price, status) VALUES 
('TCK-TD01-1', 'TCK20001', 'BKG-TODAY-01', 'TRP-TODAY-01', 'S-BUS-01-A01', N'Nguyễn Văn A', '0988000111', 220000.00, 'CONFIRMED'),
('TCK-TD01-2', 'TCK20002', 'BKG-TODAY-01', 'TRP-TODAY-01', 'S-BUS-01-A02', N'Nguyễn Thị Mai', '0988000111', 220000.00, 'CONFIRMED'),
('TCK-TD02-1', 'TCK20003', 'BKG-TODAY-02', 'TRP-TODAY-01', 'S-BUS-01-A03', N'Trần Thị Bích', '0988000222', 220000.00, 'CHECKED_IN');
GO

INSERT INTO payments (payment_id, booking_id, method, amount, paid_at, transaction_code, status) VALUES 
('PAY-TD01', 'BKG-TODAY-01', 'BANK_TRANSFER', 440000.00, DATEADD(HOUR, -2, SYSDATETIME()), 'VQR-BKG20001', 'SUCCESS'),
('PAY-TD02', 'BKG-TODAY-02', 'BANK_TRANSFER', 220000.00, DATEADD(HOUR, -1, SYSDATETIME()), 'VQR-BKG20002', 'SUCCESS');
GO
