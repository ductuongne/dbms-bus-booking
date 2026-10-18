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

