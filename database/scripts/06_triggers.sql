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

-- 4. trg_KiemTraThanhToan (AFTER INSERT, UPDATE ON payments)
-- Khi một giao dịch chuyển sang SUCCESS:
--   * số tiền phải khớp tổng tiền booking
--   * booking không được có giao dịch SUCCESS khác
CREATE OR ALTER TRIGGER trg_KiemTraThanhToan
ON payments
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NewSuccess TABLE (payment_id VARCHAR(50), booking_id VARCHAR(50), amount DECIMAL(12,2));

    INSERT INTO @NewSuccess (payment_id, booking_id, amount)
    SELECT i.payment_id, i.booking_id, i.amount
    FROM inserted i
    LEFT JOIN deleted d ON d.payment_id = i.payment_id
    WHERE i.status = 'SUCCESS' AND (d.payment_id IS NULL OR d.status <> 'SUCCESS');

    IF EXISTS (
        SELECT 1
        FROM @NewSuccess n
        JOIN bookings bk ON bk.booking_id = n.booking_id
        WHERE n.amount <> bk.total_amount
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50082, N'Số tiền thanh toán không khớp tổng tiền booking', 1;
    END

    IF EXISTS (
        SELECT 1
        FROM @NewSuccess n
        JOIN payments o ON o.booking_id = n.booking_id
                       AND o.payment_id <> n.payment_id
                       AND o.status = 'SUCCESS'
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50080, N'Booking đã được thanh toán', 1;
    END
END;
GO

-- 5. trg_CapNhatDiemTichLuyKhachHang (AFTER INSERT, UPDATE ON payments)
-- Tự động tích lũy điểm thưởng thành viên khi thanh toán thành công (1 điểm cho mỗi 10.000 VNĐ)
CREATE OR ALTER TRIGGER trg_CapNhatDiemTichLuyKhachHang
ON payments
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ xử lý các giao dịch chuyển sang trạng thái SUCCESS
    ;WITH NewlyPaid AS (
        SELECT i.payment_id, i.booking_id, i.amount
        FROM inserted i
        LEFT JOIN deleted d ON d.payment_id = i.payment_id
        WHERE i.status = 'SUCCESS' AND (d.payment_id IS NULL OR d.status <> 'SUCCESS')
    )
    UPDATE u
    SET u.loyalty_points = u.loyalty_points + CAST(FLOOR(np.amount / 10000.0) AS INT)
    FROM users u
    JOIN bookings b ON b.customer_id = u.user_id
    JOIN NewlyPaid np ON np.booking_id = b.booking_id;
END;
GO

-- 6. trg_DongBoTrangThaiVeKhiBookingHuy (AFTER UPDATE ON bookings)
-- Tự động cập nhật trạng thái vé thành CANCELLED khi đơn đặt vé bị CANCELLED hoặc EXPIRED
CREATE OR ALTER TRIGGER trg_DongBoTrangThaiVeKhiBookingHuy
ON bookings
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(status)
    BEGIN
        UPDATE t
        SET t.status = 'CANCELLED'
        FROM tickets t
        JOIN inserted i ON i.booking_id = t.booking_id
        JOIN deleted d ON d.booking_id = i.booking_id
        WHERE i.status IN ('CANCELLED', 'EXPIRED')
          AND d.status NOT IN ('CANCELLED', 'EXPIRED')
          AND t.status NOT IN ('CANCELLED', 'CHECKED_IN');
    END
END;
GO



