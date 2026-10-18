-- 12_financial_payments.sql
-- Người 4: Financial - Thanh toán (Payments)
-- Gồm: 2 Function, 1 Trigger, 1 View, 2 Stored Procedure, phân quyền.
-- Mã lỗi nghiệp vụ dùng dải 50080 - 50089:
--   50080: Booking đã được thanh toán
--   50081: Mã giao dịch đã tồn tại
--   50082: Số tiền thanh toán không khớp tổng tiền booking
--   50083: Booking chưa được xác nhận nên chưa thể thanh toán

SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- 1. fn_TongTienDaThanhToan: tổng tiền các giao dịch SUCCESS của một booking
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

-- 2. fn_TrangThaiThanhToan: PAID / UNPAID / NOT_FOUND của một booking
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

-- ==========================================
-- VIEW
-- ==========================================

-- vw_LichSuThanhToan: lịch sử thanh toán kèm thông tin booking và khách hàng
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

-- ==========================================
-- TRIGGER
-- ==========================================

-- trg_KiemTraThanhToan (AFTER INSERT, UPDATE ON payments)
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

-- ==========================================
-- STORED PROCEDURES
-- ==========================================

-- 1. sp_ThanhToan: thanh toán booking (PENDING -> SUCCESS) trong một transaction
CREATE OR ALTER PROCEDURE dbo.sp_ThanhToan
    @booking_id VARCHAR(50),
    @booking_code VARCHAR(20),
    @phone VARCHAR(20),
    @method VARCHAR(20),
    @transaction_code VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @method NOT IN ('CASH', 'BANK_TRANSFER')
        THROW 50061, N'Dữ liệu đặt vé không hợp lệ', 1;

    SET @transaction_code = NULLIF(LTRIM(RTRIM(@transaction_code)), '');

    IF @method = 'BANK_TRANSFER' AND @transaction_code IS NULL
        THROW 50061, N'Dữ liệu đặt vé không hợp lệ', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Khóa booking đến hết transaction để hai lần thanh toán đồng thời không cùng thành công
        DECLARE @Status VARCHAR(20), @ExpiredAt DATETIME2, @TotalAmount DECIMAL(12,2);
        SELECT @Status = status, @ExpiredAt = expired_at, @TotalAmount = total_amount
        FROM bookings WITH (UPDLOCK, HOLDLOCK)
        WHERE booking_id = @booking_id AND booking_code = @booking_code;

        IF @Status IS NULL OR NOT EXISTS (
            SELECT 1 FROM tickets WHERE booking_id = @booking_id AND passenger_phone = @phone
        )
            THROW 50040, N'Booking không tồn tại hoặc thông tin xác thực không đúng', 1;

        IF EXISTS (SELECT 1 FROM payments WITH (UPDLOCK, HOLDLOCK) WHERE booking_id = @booking_id AND status = 'SUCCESS')
            THROW 50080, N'Booking đã được thanh toán', 1;

        IF @Status <> 'CONFIRMED'
            THROW 50083, N'Booking chưa được xác nhận nên chưa thể thanh toán', 1;

        -- Tiền mặt không có mã giao dịch ngoài hệ thống, tự sinh để luôn khác NULL
        DECLARE @PaymentId VARCHAR(50);

        SELECT TOP 1 @PaymentId = payment_id
        FROM payments WITH (UPDLOCK)
        WHERE booking_id = @booking_id AND status = 'PENDING'
        ORDER BY payment_id;

        IF @PaymentId IS NULL
            SET @PaymentId = 'PAY-' + UPPER(SUBSTRING(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 1, 8));

        IF @transaction_code IS NULL
            SET @transaction_code = 'CASH-' + @PaymentId;

        IF EXISTS (SELECT 1 FROM payments WHERE transaction_code = @transaction_code AND payment_id <> @PaymentId)
            THROW 50081, N'Mã giao dịch đã tồn tại', 1;

        IF EXISTS (SELECT 1 FROM payments WHERE payment_id = @PaymentId)
            UPDATE payments
            SET method = @method,
                amount = @TotalAmount,
                paid_at = SYSDATETIME(),
                transaction_code = @transaction_code,
                status = 'SUCCESS'
            WHERE payment_id = @PaymentId;
        ELSE
            INSERT INTO payments (payment_id, booking_id, method, amount, paid_at, transaction_code, status)
            VALUES (@PaymentId, @booking_id, @method, @TotalAmount, SYSDATETIME(), @transaction_code, 'SUCCESS');

        COMMIT TRANSACTION;

        SELECT * FROM payments WHERE payment_id = @PaymentId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 2. sp_TraCuuThanhToan: tra cứu các giao dịch thanh toán của booking (xác thực bằng mã booking + SĐT)
CREATE OR ALTER PROCEDURE dbo.sp_TraCuuThanhToan
    @booking_code VARCHAR(20),
    @phone VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @BookingId VARCHAR(50);
        SELECT @BookingId = booking_id FROM bookings WHERE booking_code = @booking_code;

        IF @BookingId IS NULL OR NOT EXISTS (
            SELECT 1 FROM tickets WHERE booking_id = @BookingId AND passenger_phone = @phone
        )
            THROW 50040, N'Booking không tồn tại hoặc thông tin xác thực không đúng', 1;

        SELECT
            payment_id, booking_id, booking_code, method, amount,
            paid_at, transaction_code, payment_status AS status,
            dbo.fn_TrangThaiThanhToan(booking_id) AS booking_payment_status,
            dbo.fn_TongTienDaThanhToan(booking_id) AS total_paid
        FROM dbo.vw_LichSuThanhToan
        WHERE booking_id = @BookingId
        ORDER BY paid_at DESC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- ==========================================
-- PHÂN QUYỀN
-- ==========================================
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_NhanVien' AND type = 'R')
BEGIN
    GRANT EXECUTE ON dbo.sp_ThanhToan TO Role_NhanVien;
    GRANT EXECUTE ON dbo.sp_TraCuuThanhToan TO Role_NhanVien;
    GRANT SELECT ON dbo.vw_LichSuThanhToan TO Role_NhanVien;
END
GO

IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_KhachHang' AND type = 'R')
BEGIN
    GRANT EXECUTE ON dbo.sp_ThanhToan TO Role_KhachHang;
    GRANT EXECUTE ON dbo.sp_TraCuuThanhToan TO Role_KhachHang;
END
GO

IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_KeToan' AND type = 'R')
BEGIN
    GRANT EXECUTE ON dbo.sp_TraCuuThanhToan TO Role_KeToan;
    GRANT SELECT ON dbo.vw_LichSuThanhToan TO Role_KeToan;
END
GO
