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

