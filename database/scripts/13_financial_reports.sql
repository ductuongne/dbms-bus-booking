-- 13_financial_reports.sql
-- Người 4: Reporting - Báo cáo doanh thu và thống kê
-- Gồm: 4 View, 3 Function, 3 Stored Procedure, 2 Index phục vụ báo cáo, phân quyền.
-- Doanh thu chỉ tính trên giao dịch SUCCESS (hệ thống không có hủy vé/hoàn tiền).
-- Vé được tính là đã bán khi status IN ('CONFIRMED', 'CHECKED_IN').
-- Mã lỗi nghiệp vụ:
--   50090: Tham số báo cáo không hợp lệ (khoảng ngày sai hoặc kiểu nhóm không hỗ trợ)

SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

-- ==========================================
-- INDEXES (phục vụ truy vấn báo cáo)
-- ==========================================

-- Lọc giao dịch thành công theo khoảng thời gian thanh toán
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_status_paid_at' AND object_id = OBJECT_ID('payments'))
    CREATE NONCLUSTERED INDEX idx_payments_status_paid_at
    ON payments(status, paid_at) INCLUDE (booking_id, method, amount);
GO

-- Đếm và cộng tiền vé đã bán theo chuyến
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tickets_trip_status' AND object_id = OBJECT_ID('tickets'))
    CREATE NONCLUSTERED INDEX idx_tickets_trip_status
    ON tickets(trip_id, status) INCLUDE (booking_id, price);
GO

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- 1. fn_DoanhThuTheoKhoang: tổng doanh thu (giao dịch SUCCESS) trong khoảng ngày [from, to]
CREATE OR ALTER FUNCTION dbo.fn_DoanhThuTheoKhoang(
    @from_date DATE,
    @to_date DATE
)
RETURNS DECIMAL(14,2)
AS
BEGIN
    DECLARE @total DECIMAL(14,2);

    SELECT @total = ISNULL(SUM(amount), 0)
    FROM payments
    WHERE status = 'SUCCESS'
      AND paid_at >= CAST(@from_date AS DATETIME2)
      AND paid_at < DATEADD(DAY, 1, CAST(@to_date AS DATETIME2));

    RETURN @total;
END;
GO

-- 2. fn_TyLeLapDay: tỷ lệ ghế đã bán của một chuyến (0 - 100)
CREATE OR ALTER FUNCTION dbo.fn_TyLeLapDay(
    @trip_id VARCHAR(50)
)
RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @totalSeats INT, @soldSeats INT;

    SELECT @totalSeats = COUNT(*)
    FROM seats s
    JOIN trips t ON t.bus_id = s.bus_id
    WHERE t.trip_id = @trip_id;

    SELECT @soldSeats = COUNT(*)
    FROM tickets
    WHERE trip_id = @trip_id AND status IN ('CONFIRMED', 'CHECKED_IN');

    IF @totalSeats IS NULL OR @totalSeats = 0
        RETURN 0;

    RETURN CAST(@soldSeats * 100.0 / @totalSeats AS DECIMAL(5,2));
END;
GO

-- 3. fn_DoanhThuTheoNgay: bảng doanh thu từng ngày trong khoảng [from, to]
CREATE OR ALTER FUNCTION dbo.fn_DoanhThuTheoNgay(
    @from_date DATE,
    @to_date DATE
)
RETURNS TABLE
AS
RETURN
(
    SELECT
        CAST(paid_at AS DATE) AS report_date,
        COUNT(*) AS payment_count,
        SUM(amount) AS total_revenue
    FROM payments
    WHERE status = 'SUCCESS'
      AND paid_at >= CAST(@from_date AS DATETIME2)
      AND paid_at < DATEADD(DAY, 1, CAST(@to_date AS DATETIME2))
    GROUP BY CAST(paid_at AS DATE)
);
GO

-- ==========================================
-- VIEWS
-- ==========================================

-- 1. vw_DoanhThuTheoNgay: doanh thu mỗi ngày theo phương thức thanh toán
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

-- 2. vw_DoanhThuTheoTuyen: số vé bán và doanh thu theo tuyến, theo ngày thanh toán
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

-- 3. vw_TyLeLapDayChuyen: ghế đã bán, tổng ghế và tỷ lệ lấp đầy từng chuyến
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

-- 4. vw_ThongKeThanhToan: số giao dịch và tổng tiền theo phương thức và trạng thái
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

-- ==========================================
-- STORED PROCEDURES
-- ==========================================

-- 1. sp_BaoCaoDoanhThu: doanh thu trong khoảng ngày, gom theo DAY hoặc MONTH
CREATE OR ALTER PROCEDURE dbo.sp_BaoCaoDoanhThu
    @from_date DATE,
    @to_date DATE,
    @group_by VARCHAR(10) = 'DAY'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @from_date IS NULL OR @to_date IS NULL OR @from_date > @to_date
           OR @group_by NOT IN ('DAY', 'MONTH')
            THROW 50090, N'Tham số báo cáo không hợp lệ', 1;

        DECLARE @fromTime DATETIME2 = CAST(@from_date AS DATETIME2);
        DECLARE @toTime DATETIME2 = DATEADD(DAY, 1, CAST(@to_date AS DATETIME2));

        IF @group_by = 'DAY'
            SELECT
                CAST(paid_at AS DATE) AS period,
                COUNT(*) AS payment_count,
                SUM(amount) AS total_revenue
            FROM payments
            WHERE status = 'SUCCESS' AND paid_at >= @fromTime AND paid_at < @toTime
            GROUP BY CAST(paid_at AS DATE)
            ORDER BY period;
        ELSE
            SELECT
                DATEFROMPARTS(YEAR(paid_at), MONTH(paid_at), 1) AS period,
                COUNT(*) AS payment_count,
                SUM(amount) AS total_revenue
            FROM payments
            WHERE status = 'SUCCESS' AND paid_at >= @fromTime AND paid_at < @toTime
            GROUP BY DATEFROMPARTS(YEAR(paid_at), MONTH(paid_at), 1)
            ORDER BY period;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- 2. sp_BaoCaoDoanhThuTuyen: số vé bán và doanh thu theo tuyến trong khoảng ngày
CREATE OR ALTER PROCEDURE dbo.sp_BaoCaoDoanhThuTuyen
    @from_date DATE,
    @to_date DATE
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @from_date IS NULL OR @to_date IS NULL OR @from_date > @to_date
            THROW 50090, N'Tham số báo cáo không hợp lệ', 1;

        SELECT
            route_id,
            departure_station,
            arrival_station,
            SUM(tickets_sold) AS tickets_sold,
            SUM(revenue) AS revenue
        FROM dbo.vw_DoanhThuTheoTuyen
        WHERE paid_date BETWEEN @from_date AND @to_date
        GROUP BY route_id, departure_station, arrival_station
        ORDER BY revenue DESC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- 3. sp_BaoCaoLapDay: tỷ lệ lấp đầy các chuyến khởi hành trong khoảng ngày
CREATE OR ALTER PROCEDURE dbo.sp_BaoCaoLapDay
    @from_date DATE,
    @to_date DATE
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @from_date IS NULL OR @to_date IS NULL OR @from_date > @to_date
            THROW 50090, N'Tham số báo cáo không hợp lệ', 1;

        SELECT
            trip_id, route_id, departure_time, trip_status, license_plate,
            total_seats, sold_seats, occupancy_percent
        FROM dbo.vw_TyLeLapDayChuyen
        WHERE departure_time >= CAST(@from_date AS DATETIME2)
          AND departure_time < DATEADD(DAY, 1, CAST(@to_date AS DATETIME2))
          AND trip_status <> 'CANCELLED'
        ORDER BY departure_time;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- ==========================================
-- PHÂN QUYỀN
-- ==========================================
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_KeToan' AND type = 'R')
BEGIN
    GRANT EXECUTE ON dbo.sp_BaoCaoDoanhThu TO Role_KeToan;
    GRANT EXECUTE ON dbo.sp_BaoCaoDoanhThuTuyen TO Role_KeToan;
    GRANT EXECUTE ON dbo.sp_BaoCaoLapDay TO Role_KeToan;
    GRANT SELECT ON dbo.vw_DoanhThuTheoNgay TO Role_KeToan;
    GRANT SELECT ON dbo.vw_DoanhThuTheoTuyen TO Role_KeToan;
    GRANT SELECT ON dbo.vw_TyLeLapDayChuyen TO Role_KeToan;
    GRANT SELECT ON dbo.vw_ThongKeThanhToan TO Role_KeToan;
END
GO
