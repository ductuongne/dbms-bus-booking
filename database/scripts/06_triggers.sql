SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

-- 1. trg_KiemTraGheThuocXe (AFTER INSERT, UPDATE ON tickets)
CREATE OR ALTER TRIGGER trg_KiemTraGheThuocXe
ON tickets
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra 1: Ghế của vé phải thuộc xe của chuyến
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        JOIN trips t ON t.trip_id = i.trip_id
        JOIN seats s ON s.seat_id = i.seat_id
        WHERE s.bus_id <> t.bus_id
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50020, N'Ghế không thuộc xe của chuyến', 1;
    END

    -- Kiểm tra 2: Mọi vé trong cùng booking phải cùng chuyến
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        JOIN tickets o ON o.booking_id = i.booking_id AND o.trip_id <> i.trip_id
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50023, N'Vé trong cùng booking phải cùng chuyến', 1;
    END
END;
GO

-- 2. trg_KiemTraTrungLichXe (AFTER INSERT, UPDATE ON trips)
CREATE OR ALTER TRIGGER trg_KiemTraTrungLichXe
ON trips
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 
        FROM inserted i
        JOIN trips t ON t.bus_id = i.bus_id AND t.trip_id <> i.trip_id
        WHERE i.status <> 'CANCELLED' AND t.status <> 'CANCELLED'
          AND i.departure_time < t.arrival_time
          AND t.departure_time < i.arrival_time
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50021, N'Xe bị trùng lịch', 1;
    END
END;
GO

-- 3. trg_KiemTraTrungLichTaiXe (AFTER INSERT, UPDATE ON trips)
CREATE OR ALTER TRIGGER trg_KiemTraTrungLichTaiXe
ON trips
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 
        FROM inserted i
        JOIN trips t ON t.driver_id = i.driver_id AND t.trip_id <> i.trip_id
        WHERE i.status <> 'CANCELLED' AND t.status <> 'CANCELLED'
          AND i.departure_time < t.arrival_time
          AND t.departure_time < i.arrival_time
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50022, N'Tài xế bị trùng lịch', 1;
    END
END;
GO

