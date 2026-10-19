-- financial_reports_execution_plan.sql
-- Người 4: minh chứng Execution Plan cho index báo cáo doanh thu (Rubric mục Indexes).
--
-- CÁCH CHẠY (SQL Server Management Studio / Azure Data Studio, trên DB bus_management):
--   1. Bật "Include Actual Execution Plan" (Ctrl + M) trước khi Execute.
--   2. Chạy toàn bộ file một lần. Kết quả có 2 tab plan: TRƯỚC và SAU khi tạo index.
--   3. Chụp 2 plan và copy phần Messages (STATISTICS IO / TIME) đưa vào báo cáo chương Index.
--
-- AN TOÀN: toàn bộ dữ liệu giả và việc DROP/CREATE INDEX nằm trong MỘT transaction,
-- cuối file ROLLBACK nên không để lại dữ liệu hay thay đổi index nào trong DB.
-- Không dùng DROP/TRUNCATE bảng, không DELETE/UPDATE dữ liệu có sẵn.
--
-- YÊU CẦU: đã chạy 12_financial_payments.sql (trigger thanh toán) và
--          13_financial_reports.sql (sp_BaoCaoDoanhThu, index).
--          Bảng users có ít nhất 1 người dùng.

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @CustomerId VARCHAR(50) = (SELECT TOP 1 user_id FROM users ORDER BY user_id);
    IF @CustomerId IS NULL
        THROW 50061, N'Cần ít nhất 1 người dùng trong bảng users để tạo dữ liệu giả', 1;

    -- 1. Sinh 50.000 booking CONFIRMED + 50.000 giao dịch SUCCESS trải đều 365 ngày gần nhất
    DECLARE @Rows INT = 50000;

    ;WITH Numbers AS (
        SELECT TOP (@Rows) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
        FROM sys.all_objects a CROSS JOIN sys.all_objects b
    )
    INSERT INTO bookings (booking_id, booking_code, customer_id, channel, created_at, expired_at, total_amount, status)
    SELECT
        'PERF-B' + CAST(n AS VARCHAR(10)),
        'PF' + RIGHT('000000' + CAST(n AS VARCHAR(10)), 6),
        @CustomerId,
        'ONLINE',
        DATEADD(DAY, -(n % 365), SYSDATETIME()),
        DATEADD(DAY, -(n % 365), SYSDATETIME()),
        CAST(100000 + (n % 20) * 10000 AS DECIMAL(12,2)),
        'CONFIRMED'
    FROM Numbers;

    INSERT INTO payments (payment_id, booking_id, method, amount, paid_at, transaction_code, status)
    SELECT
        'PERF-P' + SUBSTRING(booking_id, 7, 10),
        booking_id,
        CASE WHEN RIGHT(booking_id, 1) IN ('0', '2', '4', '6', '8') THEN 'CASH' ELSE 'BANK_TRANSFER' END,
        total_amount,
        created_at,
        'PERF-TX-' + SUBSTRING(booking_id, 7, 10),
        'SUCCESS'
    FROM bookings
    WHERE booking_id LIKE 'PERF-B%';

    -- 2. TRƯỚC: bỏ index báo cáo (trong transaction, ROLLBACK sẽ khôi phục)
    IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_payments_status_paid_at' AND object_id = OBJECT_ID('payments'))
        DROP INDEX idx_payments_status_paid_at ON payments;

    DECLARE @From DATE = CAST(DATEADD(DAY, -30, SYSDATETIME()) AS DATE);
    DECLARE @To DATE = CAST(SYSDATETIME() AS DATE);

    PRINT N'===== TRƯỚC KHI CÓ INDEX idx_payments_status_paid_at =====';
    SET STATISTICS IO ON;
    SET STATISTICS TIME ON;
    EXEC dbo.sp_BaoCaoDoanhThu @from_date = @From, @to_date = @To, @group_by = 'DAY';
    SET STATISTICS TIME OFF;
    SET STATISTICS IO OFF;

    -- 3. SAU: tạo index non-clustered (status, paid_at) INCLUDE (booking_id, method, amount)
    CREATE NONCLUSTERED INDEX idx_payments_status_paid_at
    ON payments(status, paid_at) INCLUDE (booking_id, method, amount);

    PRINT N'===== SAU KHI CÓ INDEX idx_payments_status_paid_at =====';
    SET STATISTICS IO ON;
    SET STATISTICS TIME ON;
    EXEC dbo.sp_BaoCaoDoanhThu @from_date = @From, @to_date = @To, @group_by = 'DAY';
    SET STATISTICS TIME OFF;
    SET STATISTICS IO OFF;

    -- Kết quả mong đợi:
    --   TRƯỚC: Clustered Index Scan trên payments (đọc toàn bảng), logical reads lớn.
    --   SAU  : Index Seek trên idx_payments_status_paid_at, không Key Lookup (covering),
    --          logical reads giảm rõ rệt.

    ROLLBACK TRANSACTION;
    PRINT N'Đã ROLLBACK: dữ liệu giả và thay đổi index không được lưu.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH
