SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

-- 1. vw_ChiTietChuyenDi (chi tiết chuyến: tuyến, trạm, tỉnh, loại xe, trạng thái xe)
CREATE OR ALTER VIEW dbo.vw_ChiTietChuyenDi
AS
    SELECT
        t.trip_id,
        t.departure_time,
        t.arrival_time,
        t.price,
        t.status,
        t.bus_id,
        t.driver_id,
        t.route_id,
        ds.name AS departure_station,
        ast.name AS arrival_station,
        dp.province_id AS departure_province_id,
        ap.province_id AS arrival_province_id,
        dp.name AS departure_province,
        ap.name AS arrival_province,
        bt.name AS bus_type,
        b.status AS bus_status
    FROM trips t
    JOIN routes r ON r.route_id = t.route_id
    JOIN buses b ON b.bus_id = t.bus_id
    JOIN bus_types bt ON bt.type_id = b.type_id
    JOIN stations ds ON ds.station_id = r.departure_station_id
    JOIN stations ast ON ast.station_id = r.arrival_station_id
    JOIN provinces dp ON dp.province_id = ds.province_id
    JOIN provinces ap ON ap.province_id = ast.province_id;
GO

-- 2. vw_ChiTietVe (chi tiết vé: ghế, chuyến, booking)
CREATE OR ALTER VIEW dbo.vw_ChiTietVe
AS
    SELECT
        tk.ticket_id,
        tk.ticket_code,
        s.seat_number,
        tk.price,
        tk.status,
        tk.passenger_name,
        tk.passenger_phone,
        bk.booking_code,
        bk.expired_at,
        t.departure_time
    FROM tickets tk
    JOIN bookings bk ON bk.booking_id = tk.booking_id
    JOIN seats s ON s.seat_id = tk.seat_id
    JOIN trips t ON t.trip_id = tk.trip_id;
GO

-- 3. vw_LichPhanCongTaiXe (Lịch phân công tài xế)
CREATE OR ALTER VIEW dbo.vw_LichPhanCongTaiXe
AS
SELECT 
    t.trip_id AS trip_id,
    t.driver_id AS driver_id,
    u.user_id AS user_id,
    u.full_name AS driver_name,
    u.phone AS driver_phone,
    d.license_number AS license_number,
    t.departure_time AS departure_time,
    t.arrival_time AS arrival_time,
    t.status AS trip_status,
    r.route_id AS route_id,
    s_dep.name AS departure_station,
    s_arr.name AS arrival_station,
    r.distance_km AS distance_km,
    b.license_plate AS license_plate,
    bt.name AS bus_type,
    bt.total_seats AS total_seats
FROM trips t
INNER JOIN drivers d ON t.driver_id = d.driver_id
INNER JOIN users u ON d.user_id = u.user_id
INNER JOIN routes r ON t.route_id = r.route_id
INNER JOIN stations s_dep ON r.departure_station_id = s_dep.station_id
INNER JOIN stations s_arr ON r.arrival_station_id = s_arr.station_id
INNER JOIN buses b ON t.bus_id = b.bus_id
INNER JOIN bus_types bt ON b.type_id = bt.type_id;
GO

-- Cấp quyền truy cập View cho Role_TaiXe và Role_NhanVien nếu Role đã tồn tại
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_TaiXe' AND type = 'R')
BEGIN
    GRANT SELECT ON dbo.vw_LichPhanCongTaiXe TO Role_TaiXe;
END
GO

IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_NhanVien' AND type = 'R')
BEGIN
    GRANT SELECT ON dbo.vw_LichPhanCongTaiXe TO Role_NhanVien;
END
GO
