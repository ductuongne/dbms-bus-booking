SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

CREATE OR ALTER FUNCTION dbo.fn_TinhGiaVe(
    @trip_id VARCHAR(50),
    @seat_id VARCHAR(50)
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @price DECIMAL(12,2) = NULL;

    SELECT @price = t.price
    FROM trips t
    JOIN seats s ON s.seat_id = @seat_id AND s.bus_id = t.bus_id
    WHERE t.trip_id = @trip_id;

    RETURN @price;
END;
GO


-- fn_LaySoDoGhe: sơ đồ ghế của chuyến (trạng thái động + giá qua fn_TinhGiaVe).
-- thứ tự ghế do câu truy vấn gọi hàm quyết định: ORDER BY seat_number.
CREATE OR ALTER FUNCTION dbo.fn_LaySoDoGhe(
    @tripId VARCHAR(50)
)
RETURNS TABLE
AS
RETURN
(
    SELECT s.seat_id, s.seat_number,
           COALESCE(a.status, 'AVAILABLE') AS status,
           dbo.fn_TinhGiaVe(@tripId, s.seat_id) AS price
    FROM seats s
    JOIN trips t ON t.bus_id = s.bus_id AND t.trip_id = @tripId
    OUTER APPLY (
        SELECT TOP 1 tk.status
        FROM tickets tk JOIN bookings b ON b.booking_id = tk.booking_id
        WHERE tk.trip_id = @tripId AND tk.seat_id = s.seat_id
          AND (tk.status = 'CONFIRMED'
               OR (tk.status = 'PENDING' AND b.expired_at > SYSDATETIME()))
        ORDER BY CASE WHEN tk.status = 'CONFIRMED' THEN 0 ELSE 1 END
    ) a
);
GO

-- ==============================================================================
-- FINANCIAL & REPORTING FUNCTIONS (Người 4)
-- ==============================================================================

-- 3. fn_TongTienDaThanhToan: tổng tiền các giao dịch SUCCESS của một booking
CREATE OR ALTER FUNCTION dbo.fn_TongTienDaThanhToan(
    @booking_id VARCHAR(50)
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @total DECIMAL(12,2);

    SELECT @total = ISNULL(SUM(amount), 0)
    FROM payments
    WHERE booking_id = @booking_id AND status = 'SUCCESS';

    RETURN @total;
END;
GO

-- 4. fn_TrangThaiThanhToan: PAID / UNPAID / NOT_FOUND của một booking
CREATE OR ALTER FUNCTION dbo.fn_TrangThaiThanhToan(
    @booking_id VARCHAR(50)
)
RETURNS VARCHAR(20)
AS
BEGIN
    DECLARE @result VARCHAR(20) = 'NOT_FOUND';

    IF EXISTS (SELECT 1 FROM bookings WHERE booking_id = @booking_id)
    BEGIN
        IF EXISTS (SELECT 1 FROM payments WHERE booking_id = @booking_id AND status = 'SUCCESS')
            SET @result = 'PAID';
        ELSE
            SET @result = 'UNPAID';
    END

    RETURN @result;
END;
GO

-- 5. fn_DoanhThuTheoKhoang: tổng doanh thu (giao dịch SUCCESS) trong khoảng ngày [from, to]
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

-- 6. fn_TyLeLapDay: tỷ lệ ghế đã bán của một chuyến (0 - 100)
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

-- 7. fn_DoanhThuTheoNgay: bảng doanh thu từng ngày trong khoảng [from, to]
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



-- 8. fn_LayVeTheoChuyen: danh sách vé kèm số ghế theo chuyến và trạng thái vé
CREATE OR ALTER FUNCTION dbo.fn_LayVeTheoChuyen(
    @tripId VARCHAR(50),
    @status VARCHAR(20) = NULL
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        tk.ticket_id, 
        tk.ticket_code, 
        tk.booking_id, 
        tk.trip_id, 
        tk.seat_id, 
        s.seat_number,
        tk.passenger_name, 
        tk.passenger_phone, 
        tk.price, 
        tk.status
    FROM tickets tk
    JOIN seats s ON s.seat_id = tk.seat_id
    WHERE tk.trip_id = @tripId
      AND (@status IS NULL OR tk.status = @status)
);
GO
