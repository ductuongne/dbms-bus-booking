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