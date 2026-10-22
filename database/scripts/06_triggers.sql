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

-- 5. trg_DongBoTrangThaiVeKhiBookingHuy (AFTER UPDATE ON bookings)
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

-- 6. trg_KiemTraBangLaiTaiXe (AFTER INSERT, UPDATE ON trips)
-- Đảm bảo bằng lái của tài xế còn hạn sử dụng tại thời điểm chuyến xe khởi hành
CREATE OR ALTER TRIGGER trg_KiemTraBangLaiTaiXe
ON trips
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN drivers d ON d.driver_id = i.driver_id
        WHERE i.status <> 'CANCELLED'
          AND d.license_expiry < CAST(i.departure_time AS DATE)
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50024, N'Bằng lái của tài xế đã hết hạn trước thời điểm chuyến xe khởi hành', 1;
    END
END;
GO

-- 7. trg_KiemTraTrangThaiXeKhiTaoChuyen (AFTER INSERT, UPDATE ON trips)
-- Đảm bảo xe được phân công vào chuyến phải có trạng thái ACTIVE
CREATE OR ALTER TRIGGER trg_KiemTraTrangThaiXeKhiTaoChuyen
ON trips
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN buses b ON b.bus_id = i.bus_id
        WHERE i.status <> 'CANCELLED'
          AND b.status <> 'ACTIVE'
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50025, N'Phương tiện đang tạm dừng hoạt động, không thể phân công vào chuyến xe', 1;
    END
END;
GO

-- 8. trg_NganXoaBookingDaThanhToan (INSTEAD OF DELETE ON bookings)
-- Ngăn chặn xóa vật lý các đơn đặt vé đã xác nhận hoặc đã thanh toán thành công
CREATE OR ALTER TRIGGER trg_NganXoaBookingDaThanhToan
ON bookings
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nếu có bất kỳ booking nào đã CONFIRMED hoặc có thanh toán SUCCESS
    IF EXISTS (
        SELECT 1
        FROM deleted d
        WHERE d.status = 'CONFIRMED'
           OR EXISTS (SELECT 1 FROM payments p WHERE p.booking_id = d.booking_id AND p.status = 'SUCCESS')
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50043, N'Không thể xóa đơn đặt vé đã xác nhận hoặc đã thanh toán thành công (phải dùng thao tác hủy đơn)', 1;
    END

    -- Nếu chỉ là booking PENDING hoặc CANCELLED chưa thanh toán, cho phép xóa an toàn
    DELETE FROM tickets WHERE booking_id IN (SELECT booking_id FROM deleted);
    DELETE FROM payments WHERE booking_id IN (SELECT booking_id FROM deleted);
    DELETE FROM bookings WHERE booking_id IN (SELECT booking_id FROM deleted);
END;
GO

-- 9. trg_NganXoaPaymentThanhCong (INSTEAD OF DELETE ON payments)
-- Bảng thanh toán là sổ cái dòng tiền, cấm xóa các giao dịch SUCCESS
CREATE OR ALTER TRIGGER trg_NganXoaPaymentThanhCong
ON payments
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM deleted d
        WHERE d.status = 'SUCCESS'
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50085, N'Không thể xóa giao dịch thanh toán thành công khỏi sổ cái kế toán', 1;
    END

    DELETE FROM payments WHERE payment_id IN (SELECT payment_id FROM deleted);
END;
GO

-- 10. trg_KiemTraSoVeToiDaCuaChuyen (AFTER INSERT, UPDATE ON tickets)
-- Ngăn chặn bán quá số ghế quy định của xe (Chống Overbooking)
CREATE OR ALTER TRIGGER trg_KiemTraSoVeToiDaCuaChuyen
ON tickets
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT i.trip_id
        FROM inserted i
        JOIN trips t ON t.trip_id = i.trip_id
        JOIN buses b ON b.bus_id = t.bus_id
        JOIN bus_types bt ON bt.type_id = b.type_id
        CROSS APPLY (
            SELECT COUNT(*) AS active_tickets_count
            FROM tickets tk
            WHERE tk.trip_id = i.trip_id
              AND tk.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
        ) c
        WHERE c.active_tickets_count > bt.total_seats
    )
    BEGIN
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW 50026, N'Số lượng vé của chuyến xe vượt quá tổng số ghế của phương tiện', 1;
    END
END;
GO
