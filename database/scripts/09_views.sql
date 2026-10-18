-- ==============================================================================
-- 09_views.sql
-- KHỞI TẠO CÁC KHUNG NHÌN (VIEWS) TRONG HỆ THỐNG ĐẶT VÉ XE KHÁCH
-- ==============================================================================

-- 1. VIEW LỊCH PHÂN CÔNG TÀI XẾ (DRIVER SCHEDULE VIEW)
-- Tổng hợp thông tin chuyến đi, tài xế, tuyến đường, bến xe và thông số phương tiện
CREATE OR ALTER VIEW vw_LichPhanCongTaiXe
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
    GRANT SELECT ON vw_LichPhanCongTaiXe TO Role_TaiXe;
END
GO

IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_NhanVien' AND type = 'R')
BEGIN
    GRANT SELECT ON vw_LichPhanCongTaiXe TO Role_NhanVien;
END
GO
