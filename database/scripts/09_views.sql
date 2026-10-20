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

-- ==============================================================================
-- 4. vw_RouteList (Danh sách tuyến đường)
-- ==============================================================================
CREATE OR ALTER VIEW dbo.vw_RouteList
AS
    SELECT
        r.route_id,
        r.departure_station_id,
        ds.name AS departure_station_name,
        dp.province_id AS departure_province_id,
        dp.name AS departure_province,
        r.arrival_station_id,
        ast.name AS arrival_station_name,
        ap.province_id AS arrival_province_id,
        ap.name AS arrival_province,
        r.distance_km,
        r.estimated_duration
    FROM routes r
    JOIN stations ds ON ds.station_id = r.departure_station_id
    JOIN provinces dp ON dp.province_id = ds.province_id
    JOIN stations ast ON ast.station_id = r.arrival_station_id
    JOIN provinces ap ON ap.province_id = ast.province_id;
GO

-- ==============================================================================
-- 5. vw_BusList (Danh sách phương tiện)
-- ==============================================================================
CREATE OR ALTER VIEW dbo.vw_BusList
AS
    SELECT
        b.bus_id,
        b.license_plate,
        b.type_id,
        bt.name AS bus_type_name,
        bt.total_seats,
        bt.floors,
        b.status
    FROM buses b
    JOIN bus_types bt ON bt.type_id = b.type_id;
GO

-- ==============================================================================
-- 6. vw_RouteStations (Điểm dừng của tuyến đường theo thứ tự)
-- ==============================================================================
CREATE OR ALTER VIEW dbo.vw_RouteStations
AS
    SELECT
        rs.route_station_id,
        rs.route_id,
        rs.station_id,
        s.name AS station_name,
        s.address AS station_address,
        p.province_id,
        p.name AS province_name,
        rs.stop_order
    FROM route_stations rs
    JOIN stations s ON s.station_id = rs.station_id
    JOIN provinces p ON p.province_id = s.province_id;
GO

-- ==============================================================================
-- 7. vw_StationList (Danh sách bến xe kèm tỉnh/thành)
-- ==============================================================================
CREATE OR ALTER VIEW dbo.vw_StationList
AS
    SELECT
        s.station_id,
        s.name AS station_name,
        s.province_id,
        p.name AS province_name,
        s.address
    FROM stations s
    JOIN provinces p ON p.province_id = s.province_id;
GO

-- ==============================================================================
-- FINANCIAL & REPORTING VIEWS (Người 4)
-- ==============================================================================

-- 8. vw_LichSuThanhToan: lịch sử thanh toán kèm thông tin booking và khách hàng
CREATE OR ALTER VIEW dbo.vw_LichSuThanhToan
AS
    SELECT
        p.payment_id,
        p.booking_id,
        bk.booking_code,
        bk.channel,
        bk.status AS booking_status,
        bk.total_amount AS booking_total_amount,
        u.full_name AS customer_name,
        u.phone AS customer_phone,
        p.method,
        p.amount,
        p.paid_at,
        p.transaction_code,
        p.status AS payment_status
    FROM payments p
    JOIN bookings bk ON bk.booking_id = p.booking_id
    JOIN users u ON u.user_id = bk.customer_id;
GO

-- 9. vw_DoanhThuTheoNgay: doanh thu mỗi ngày theo phương thức thanh toán
CREATE OR ALTER VIEW dbo.vw_DoanhThuTheoNgay
AS
    SELECT
        CAST(p.paid_at AS DATE) AS report_date,
        p.method,
        COUNT(*) AS payment_count,
        SUM(p.amount) AS total_revenue
    FROM payments p
    WHERE p.status = 'SUCCESS'
    GROUP BY CAST(p.paid_at AS DATE), p.method;
GO

-- 10. vw_DoanhThuTheoTuyen: số vé bán và doanh thu theo tuyến, theo ngày thanh toán
CREATE OR ALTER VIEW dbo.vw_DoanhThuTheoTuyen
AS
    SELECT
        CAST(p.paid_at AS DATE) AS paid_date,
        r.route_id,
        ds.name AS departure_station,
        ast.name AS arrival_station,
        COUNT(tk.ticket_id) AS tickets_sold,
        SUM(tk.price) AS revenue
    FROM payments p
    JOIN tickets tk ON tk.booking_id = p.booking_id
    JOIN trips t ON t.trip_id = tk.trip_id
    JOIN routes r ON r.route_id = t.route_id
    JOIN stations ds ON ds.station_id = r.departure_station_id
    JOIN stations ast ON ast.station_id = r.arrival_station_id
    WHERE p.status = 'SUCCESS'
      AND tk.status IN ('CONFIRMED', 'CHECKED_IN')
    GROUP BY CAST(p.paid_at AS DATE), r.route_id, ds.name, ast.name;
GO

-- 11. vw_TyLeLapDayChuyen: ghế đã bán, tổng ghế và tỷ lệ lấp đầy từng chuyến
CREATE OR ALTER VIEW dbo.vw_TyLeLapDayChuyen
AS
    SELECT
        t.trip_id,
        t.route_id,
        t.departure_time,
        t.status AS trip_status,
        b.license_plate,
        (SELECT COUNT(*) FROM seats s WHERE s.bus_id = t.bus_id) AS total_seats,
        (SELECT COUNT(*) FROM tickets tk
         WHERE tk.trip_id = t.trip_id AND tk.status IN ('CONFIRMED', 'CHECKED_IN')) AS sold_seats,
        dbo.fn_TyLeLapDay(t.trip_id) AS occupancy_percent
    FROM trips t
    JOIN buses b ON b.bus_id = t.bus_id;
GO

-- 12. vw_ThongKeThanhToan: số giao dịch và tổng tiền theo phương thức và trạng thái
CREATE OR ALTER VIEW dbo.vw_ThongKeThanhToan
AS
    SELECT
        method,
        status,
        COUNT(*) AS payment_count,
        SUM(amount) AS total_amount
    FROM payments
    GROUP BY method, status;
GO


