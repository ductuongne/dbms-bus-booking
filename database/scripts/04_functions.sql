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

