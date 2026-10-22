-- ==========================================================================================================
-- 10_seed_data.sql - DỮ LIỆU MẪU CHUẨN XÁC ĐỊNH (DETERMINISTIC) HỆ THỐNG ĐẶT VÉ XE KHÁCH
-- ==========================================================================================================
-- BẢNG THIẾT KẾ MẠNG LƯỚI, LỊCH QUAY VÒNG XE & PHÂN CÔNG TÀI XẾ CỐ ĐỊNH (NGHỈ TẠI BẾN >= 240 PHÚT):
-- +--------------------+--------+---------+-------+-------------------+-------------------+------------+------------+
-- | Cặp tuyến          | Cự ly  | TG chạy | Loại  | Giờ đi chiều xuôi | Giờ đi chiều ngược| Số xe (ID) | Tài xế     |
-- +--------------------+--------+---------+-------+-------------------+-------------------+------------+------------+
-- | RT-HAN-DAN/DAN-HAN |  760km |  840 ph | BT-01 | 21:00             | 21:30             | 2 (01..02) | DRV-01..02 |
-- | RT-HAN-DAN/DAN-HAN |  760km |  840 ph | BT-02 | 18:30             | 19:00             | 2 (03..04) | DRV-03..04 |
-- | RT-HAN-SPA/SPA-HAN |  320km |  330 ph | BT-01 | 06:30             | 16:30             | 1 (05)     | DRV-05     |
-- | RT-HAN-SPA/SPA-HAN |  320km |  330 ph | BT-02 | 08:30             | 18:30             | 1 (06)     | DRV-06     |
-- | RT-SGN-DAN/DAN-SGN |  960km | 1080 ph | BT-01 | 16:00             | 16:30             | 2 (07..08) | DRV-07..08 |
-- | RT-SGN-DAN/DAN-SGN |  960km | 1080 ph | BT-02 | 18:30             | 19:00             | 2 (09..10) | DRV-09..10 |
-- | RT-SGN-DLI/DLI-SGN |  300km |  480 ph | BT-01 | 05:00             | 17:00             | 1 (11)     | DRV-11     |
-- | RT-SGN-DLI/DLI-SGN |  300km |  480 ph | BT-02 | 07:30             | 19:30             | 1 (12)     | DRV-12     |
-- | RT-SGN-NTR/NTR-SGN |  430km |  510 ph | BT-01 | 09:00             | 09:30             | 2 (13..14) | DRV-13..14 |
-- | RT-SGN-NTR/NTR-SGN |  430km |  510 ph | BT-02 | 21:00             | 21:30             | 2 (15..16) | DRV-15..16 |
-- | RT-DAN-NTR/NTR-DAN |  530km |  570 ph | BT-01 | 08:00             | 08:30             | 2 (17..18) | DRV-17..18 |
-- | RT-DAN-NTR/NTR-DAN |  530km |  570 ph | BT-02 | 19:30             | 20:00             | 2 (19..20) | DRV-19..20 |
-- | RT-HAN-SGN/SGN-HAN | 1720km | 1800 ph | BT-01 | 18:00             | 06:00             | 3 (21..23) | DRV-21..23 |
-- | RT-HAN-SGN/SGN-HAN | 1720km | 1800 ph | BT-02 | 20:30             | 08:30             | 3 (24..26) | DRV-24..26 |
-- | RT-HAN-HPH/HPH-HAN |  120km |  110 ph | BT-03 | 06,10,14,18:00    | 08,12,16,20:00    | 3 (27..29) | DRV-27..29 |
-- | RT-SGN-CTH/CTH-SGN |  165km |  200 ph | BT-03 | 05:00,10:30,16,21:30 | 07,12:30,18,23:30 | 3 (30..32) | DRV-30..32 |
-- +--------------------+--------+---------+-------+-------------------+-------------------+------------+------------+
-- Xe dự phòng INACTIVE (0 chuyến): BUS-33 (BT-01), BUS-34 (BT-02). Tài xế dự phòng (0 chuyến): DRV-33..DRV-36.
-- Giả định: Chu kỳ 3 xe tuyến ngắn phân vai (Role 0: F1->R2->F4; Role 1: R1->F3->R4; Role 2: F2->R3) giúp mọi xe/tài xế
-- kể cả xe 9 chỗ luôn nghỉ >= 250 phút (>= 240 phút) giữa 2 chuyến liên tiếp và không quá 3 chuyến/ngày.
-- ==========================================================================================================

SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

SET NOCOUNT ON;

-- 0. GUARD KIỂM TRA CSDL RỖNG & KHAI BÁO THAM SỐ
IF EXISTS (SELECT 1 FROM dbo.users)
   OR EXISTS (SELECT 1 FROM dbo.provinces)
   OR EXISTS (SELECT 1 FROM dbo.stations)
   OR EXISTS (SELECT 1 FROM dbo.routes)
   OR EXISTS (SELECT 1 FROM dbo.bus_types)
   OR EXISTS (SELECT 1 FROM dbo.buses)
   OR EXISTS (SELECT 1 FROM dbo.trips)
   OR EXISTS (SELECT 1 FROM dbo.bookings)
   OR EXISTS (SELECT 1 FROM dbo.tickets)
   OR EXISTS (SELECT 1 FROM dbo.payments)
BEGIN
    THROW 50000, N'CSDL đã có dữ liệu. Vui lòng làm rỗng toàn bộ các bảng trước khi chạy 10_seed_data.sql.', 1;
END;

DECLARE @DaysPast INT = 7, @DaysFuture INT = 7;
DECLARE @Now DATETIME2 = SYSDATETIME();
DECLARE @Today DATE = CAST(@Now AS DATE);
DECLARE @TodayDt DATETIME2 = CAST(@Today AS DATETIME2);
DECLARE @Hash VARCHAR(255) = '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S';

-- ==========================================================================================================
-- 1. PROVINCES (8 tỉnh/thành sau sáp nhập 2025, giữ ID cũ)
-- ==========================================================================================================
BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.provinces (province_id, name) VALUES
    ('PRV-01', N'Hà Nội'),
    ('PRV-02', N'Hồ Chí Minh'),
    ('PRV-03', N'Đà Nẵng'),
    ('PRV-04', N'Lâm Đồng'),
    ('PRV-06', N'Hải Phòng'),
    ('PRV-07', N'Khánh Hòa'),
    ('PRV-08', N'Lào Cai'),
    ('PRV-10', N'Cần Thơ');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- ==========================================================================================================
-- 2. BUS_TYPES (3 loại xe chuẩn)
-- ==========================================================================================================
BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.bus_types (type_id, name, total_seats, floors) VALUES
    ('BT-01', N'Xe Giường Nằm 34', 34, 2),
    ('BT-02', N'Xe Limousine Giường Nằm 22', 22, 2),
    ('BT-03', N'Xe Limousine 9 Chỗ', 9, 1);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- ==========================================================================================================
-- 3. USERS (223 users: 1 ADMIN, 6 STAFF, 36 DRIVER, 150 CUSTOMER, 30 GUEST)
-- ==========================================================================================================
BEGIN TRY
    BEGIN TRANSACTION;

    -- 3.1. Tài khoản mẫu cố định (1 ADMIN, 2 STAFF, 12 DRIVER, 5 CUSTOMER, 1 GUEST) + 4 STAFF mở rộng
    INSERT INTO dbo.users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active) VALUES
    ('USR-ADMIN-1', N'Quản Trị Viên Hệ Thống', 'admin@example.com', '0901234567', @Hash, 'ADMIN', 0, 1),
    ('USR-STF-1', N'Nhân viên Bán vé Hoàng Mai', 'staff@example.com', '0902223334', @Hash, 'STAFF', 0, 1),
    ('USR-STF-2', N'Nhân viên Bán vé Miền Đông', 'staff2@example.com', '0902223335', @Hash, 'STAFF', 0, 1),
    ('USR-STF-3', N'Nhân viên Điều hành Mỹ Đình', 'staff3@example.com', '0902223336', @Hash, 'STAFF', 0, 1),
    ('USR-STF-4', N'Nhân viên Điều hành Đà Nẵng', 'staff4@example.com', '0902223337', @Hash, 'STAFF', 0, 1),
    ('USR-STF-5', N'Nhân viên Bán vé Miền Tây', 'staff5@example.com', '0902223338', @Hash, 'STAFF', 0, 1),
    ('USR-STF-6', N'Nhân viên Bán vé Cần Thơ', 'staff6@example.com', '0902223339', @Hash, 'STAFF', 0, 1),
    ('USR-DRV-1', N'Tài xế Nguyễn Văn Một', 'driver1@example.com', '0911000001', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-2', N'Tài xế Trần Văn Hai', 'driver2@example.com', '0911000002', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-3', N'Tài xế Lê Hoàng Ba', 'driver3@example.com', '0911000003', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-4', N'Tài xế Phạm Quốc Bốn', 'driver4@example.com', '0911000004', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-5', N'Tài xế Võ Văn Năm', 'driver5@example.com', '0911000005', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-6', N'Tài xế Đặng Tuấn Sáu', 'driver6@example.com', '0911000006', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-7', N'Tài xế Bùi Gia Bảy', 'driver7@example.com', '0911000007', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-8', N'Tài xế Trương Đình Tám', 'driver8@example.com', '0911000008', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-9', N'Tài xế Nguyễn Văn Chín', 'driver9@example.com', '0911000009', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-10', N'Tài xế Hoàng Văn Mười', 'driver10@example.com', '0911000010', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-11', N'Tài xế Đoàn Văn Mười Một', 'driver11@example.com', '0911000011', @Hash, 'DRIVER', 0, 1),
    ('USR-DRV-12', N'Tài xế Phan Văn Mười Hai', 'driver12@example.com', '0911000012', @Hash, 'DRIVER', 0, 1),
    ('USR-CUS-1', N'Nguyễn Văn A', 'nva@example.com', '0988000111', @Hash, 'CUSTOMER', 150, 1),
    ('USR-CUS-2', N'Trần Thị Bích', 'bichtran@example.com', '0988000222', @Hash, 'CUSTOMER', 80, 1),
    ('USR-CUS-3', N'Lê Hoàng Nam', 'namle@example.com', '0988000333', @Hash, 'CUSTOMER', 220, 1),
    ('USR-CUS-4', N'Phạm Minh Thư', 'thupham@example.com', '0988000444', @Hash, 'CUSTOMER', 50, 1),
    ('USR-CUS-5', N'Vũ Quốc Đạt', 'datvu@example.com', '0988000555', @Hash, 'CUSTOMER', 190, 1),
    ('USR-GUEST-1', N'Khách Vãng Lai B', 'guestb@example.com', '0933222333', NULL, 'GUEST', 0, 1);

    -- 3.2. Sinh tập hợp cho DRIVER 13..36 (24 tài xế), CUSTOMER 6..150 (145 khách), GUEST 2..30 (29 khách vãng lai)
    ;WITH Ho AS (
        SELECT idx, val FROM (VALUES
            (0,N'Nguyễn'),(1,N'Trần'),(2,N'Lê'),(3,N'Phạm'),(4,N'Hoàng'),
            (5,N'Huỳnh'),(6,N'Phan'),(7,N'Vũ'),(8,N'Võ'),(9,N'Đặng'),
            (10,N'Bùi'),(11,N'Đỗ'),(12,N'Hồ'),(13,N'Ngô'),(14,N'Dương')
        ) v(idx, val)
    ),
    Dem AS (
        SELECT idx, val FROM (VALUES
            (0,N'Văn'),(1,N'Thị'),(2,N'Hoàng'),(3,N'Minh'),(4,N'Quốc'),
            (5,N'Gia'),(6,N'Thanh'),(7,N'Đức'),(8,N'Ngọc'),(9,N'Xuân'),
            (10,N'Hữu'),(11,N'Tuấn'),(12,N'Phương'),(13,N'Bảo'),(14,N'Đình')
        ) v(idx, val)
    ),
    Ten AS (
        SELECT idx, val FROM (VALUES
            (0,N'Anh'),(1,N'Bình'),(2,N'Châu'),(3,N'Dũng'),(4,N'Giang'),
            (5,N'Hà'),(6,N'Hải'),(7,N'Hiếu'),(8,N'Hùng'),(9,N'Hương'),
            (10,N'Khánh'),(11,N'Kiên'),(12,N'Lan'),(13,N'Linh'),(14,N'Long'),
            (15,N'Mai'),(16,N'Nghĩa'),(17,N'Phong'),(18,N'Phúc'),(19,N'Quân')
        ) v(idx, val)
    ),
    N10 AS (SELECT n FROM (VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9)) v(n)),
    Nums AS (
        SELECT a.n * 100 + b.n * 10 + c.n + 1 AS n
        FROM N10 a CROSS JOIN N10 b CROSS JOIN N10 c
        WHERE a.n * 100 + b.n * 10 + c.n + 1 <= 200
    )
    INSERT INTO dbo.users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active)
    -- 24 tài xế mới: USR-DRV-13 .. USR-DRV-36
    SELECT
        'USR-DRV-' + CAST(n AS VARCHAR(10)),
        N'Tài xế ' + h.val + N' ' + d.val + N' ' + t.val,
        'driver' + CAST(n AS VARCHAR(10)) + '@example.com',
        '09110000' + RIGHT('00' + CAST(n AS VARCHAR(10)), 2),
        @Hash,
        'DRIVER',
        0,
        1
    FROM Nums x
    JOIN Ho h ON h.idx = x.n % 15
    JOIN Dem d ON d.idx = (x.n / 15) % 15
    JOIN Ten t ON t.idx = (x.n % 20)
    WHERE x.n BETWEEN 13 AND 36

    UNION ALL

    -- 145 khách hàng thành viên: USR-CUS-6 .. USR-CUS-150
    SELECT
        'USR-CUS-' + CAST(x.n AS VARCHAR(10)),
        h.val + N' ' + d.val + N' ' + t.val,
        'khachhang' + CAST(x.n AS VARCHAR(10)) + '@example.com',
        CASE x.n % 5 WHEN 0 THEN '03' WHEN 1 THEN '05' WHEN 2 THEN '07' WHEN 3 THEN '08' ELSE '09' END
            + '65' + RIGHT('000000' + CAST(100000 + x.n * 37 AS VARCHAR(10)), 6),
        @Hash,
        'CUSTOMER',
        (x.n * 25) % 600 + 10,
        1
    FROM Nums x
    JOIN Ho h ON h.idx = (x.n + 3) % 15
    JOIN Dem d ON d.idx = ((x.n + 3) / 15) % 15
    JOIN Ten t ON t.idx = ((x.n + 7) % 20)
    WHERE x.n BETWEEN 6 AND 150

    UNION ALL

    -- 29 khách vãng lai: USR-GUEST-2 .. USR-GUEST-30
    SELECT
        'USR-GUEST-' + CAST(x.n AS VARCHAR(10)),
        h.val + N' ' + d.val + N' ' + t.val,
        'guest' + CAST(x.n AS VARCHAR(10)) + '@example.com',
        '0398' + RIGHT('000000' + CAST(200000 + x.n * 53 AS VARCHAR(10)), 6),
        NULL,
        'GUEST',
        0,
        1
    FROM Nums x
    JOIN Ho h ON h.idx = (x.n + 9) % 15
    JOIN Dem d ON d.idx = ((x.n + 9) / 15 + 8) % 15
    JOIN Ten t ON t.idx = ((x.n + 13) % 20)
    WHERE x.n BETWEEN 2 AND 30;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- ==========================================================================================================
-- 4. DRIVERS (36 tài xế: DRV-01..DRV-32 chạy chính trên BUS-01..BUS-32, DRV-33..DRV-36 dự phòng)
-- ==========================================================================================================
BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @LicExp DATE = CASE WHEN @Today > '2029-01-01' THEN DATEADD(YEAR, 3, @Today) ELSE '2030-12-31' END;

    INSERT INTO dbo.drivers (driver_id, user_id, license_number, license_expiry) VALUES
    ('DRV-01', 'USR-DRV-1',  'B2-12345678', @LicExp),
    ('DRV-02', 'USR-DRV-2',  'D-87654321',  @LicExp),
    ('DRV-03', 'USR-DRV-3',  'E-11223344',  @LicExp),
    ('DRV-04', 'USR-DRV-4',  'E-55667788',  @LicExp),
    ('DRV-05', 'USR-DRV-5',  'D-99887766',  @LicExp),
    ('DRV-06', 'USR-DRV-6',  'E-44332211',  @LicExp),
    ('DRV-07', 'USR-DRV-7',  'E-33445566',  @LicExp),
    ('DRV-08', 'USR-DRV-8',  'D-66778899',  @LicExp),
    ('DRV-09', 'USR-DRV-9',  'E-77889900',  @LicExp),
    ('DRV-10', 'USR-DRV-10', 'D-11335577',  @LicExp),
    ('DRV-11', 'USR-DRV-11', 'E-22446688',  @LicExp),
    ('DRV-12', 'USR-DRV-12', 'E-99001122',  @LicExp);

    ;WITH Nums AS (
        SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + 12 AS n
        FROM (VALUES (1),(2),(3),(4),(5),(6)) a(n)
        CROSS JOIN (VALUES (1),(2),(3),(4)) b(n)
    )
    INSERT INTO dbo.drivers (driver_id, user_id, license_number, license_expiry)
    SELECT
        'DRV-' + RIGHT('00' + CAST(n AS VARCHAR(10)), 2),
        'USR-DRV-' + CAST(n AS VARCHAR(10)),
        CASE WHEN n % 2 = 0 THEN 'E-' ELSE 'D-' END + CAST(30000000 + n * 12345 AS VARCHAR(20)),
        DATEADD(DAY, n * 15, @LicExp)
    FROM Nums;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- ==========================================================================================================
-- 5. STATIONS (10 bến xe liên tỉnh theo địa danh hành chính mới)
-- ==========================================================================================================
BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.stations (station_id, name, province_id, address) VALUES
    ('STA-01', N'Bến xe Miền Đông',          'PRV-02', N'292 Đinh Bộ Lĩnh, Phường Bình Thạnh, TP. Hồ Chí Minh'),
    ('STA-02', N'Bến xe Liên tỉnh Đà Lạt',   'PRV-04', N'Số 1 Tô Hiến Thành, Phường Xuân Hương - Đà Lạt, Lâm Đồng'),
    ('STA-03', N'Bến xe Mỹ Đình',            'PRV-01', N'Số 20 Phạm Hùng, Phường Mỹ Đình, Hà Nội'),
    ('STA-04', N'Bến xe Giáp Bát',           'PRV-01', N'Km 6 Giải Phóng, Phường Giáp Bát, Hà Nội'),
    ('STA-06', N'Bến xe Trung tâm Đà Nẵng',  'PRV-03', N'185 Tôn Đức Thắng, Phường Hòa Minh, Đà Nẵng'),
    ('STA-07', N'Bến xe Miền Tây',           'PRV-02', N'395 Kinh Dương Vương, Phường An Lạc, TP. Hồ Chí Minh'),
    ('STA-11', N'Bến xe Cầu Rào',            'PRV-06', N'Số 1 Thiên Lôi, Phường Lê Chân, Hải Phòng'),
    ('STA-12', N'Bến xe Phía Nam Nha Trang', 'PRV-07', N'Km 6 Đường 23 Tháng 10, Phường Nam Nha Trang, Khánh Hòa'),
    ('STA-15', N'Bến xe Sa Pa',              'PRV-08', N'Đường Điện Biên Phủ, Phường Sa Pa, Lào Cai'),
    ('STA-17', N'Bến xe Trung tâm Cần Thơ',  'PRV-10', N'Khu đô thị Nam Cần Thơ, Phường Hưng Phú, Cần Thơ');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- ==========================================================================================================
-- 6. ROUTES (9 cặp tuyến liên tỉnh = 18 tuyến khứ hồi)
-- ==========================================================================================================
BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.routes (route_id, departure_station_id, arrival_station_id, distance_km, estimated_duration) VALUES
    -- 7 cặp tuyến dài (> 200km)
    ('RT-HAN-DAN', 'STA-03', 'STA-06',  760.00,  840),
    ('RT-DAN-HAN', 'STA-06', 'STA-03',  760.00,  840),
    ('RT-HAN-SPA', 'STA-03', 'STA-15',  320.00,  330),
    ('RT-SPA-HAN', 'STA-15', 'STA-03',  320.00,  330),
    ('RT-SGN-DAN', 'STA-01', 'STA-06',  960.00, 1080),
    ('RT-DAN-SGN', 'STA-06', 'STA-01',  960.00, 1080),
    ('RT-SGN-DLI', 'STA-01', 'STA-02',  300.00,  480),
    ('RT-DLI-SGN', 'STA-02', 'STA-01',  300.00,  480),
    ('RT-SGN-NTR', 'STA-01', 'STA-12',  430.00,  510),
    ('RT-NTR-SGN', 'STA-12', 'STA-01',  430.00,  510),
    ('RT-DAN-NTR', 'STA-06', 'STA-12',  530.00,  570),
    ('RT-NTR-DAN', 'STA-12', 'STA-06',  530.00,  570),
    ('RT-HAN-SGN', 'STA-04', 'STA-01', 1720.00, 1800),
    ('RT-SGN-HAN', 'STA-01', 'STA-04', 1720.00, 1800),
    -- 2 cặp tuyến ngắn (< 200km)
    ('RT-HAN-HPH', 'STA-04', 'STA-11',  120.00,  110),
    ('RT-HPH-HAN', 'STA-11', 'STA-04',  120.00,  110),
    ('RT-SGN-CTH', 'STA-07', 'STA-17',  165.00,  200),
    ('RT-CTH-SGN', 'STA-17', 'STA-07',  165.00,  200);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- ==========================================================================================================
-- 7. ROUTE_STATIONS (42 trạm dừng cho toàn bộ 18 tuyến, stop_order liên tục từ 1)
-- ==========================================================================================================
BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.route_stations (route_station_id, route_id, station_id, stop_order) VALUES
    -- Tuyến Miền Đông <-> Đà Nẵng (qua Nha Trang STA-12)
    ('RS-SGN-DAN-1', 'RT-SGN-DAN', 'STA-01', 1),
    ('RS-SGN-DAN-2', 'RT-SGN-DAN', 'STA-12', 2),
    ('RS-SGN-DAN-3', 'RT-SGN-DAN', 'STA-06', 3),
    ('RS-DAN-SGN-1', 'RT-DAN-SGN', 'STA-06', 1),
    ('RS-DAN-SGN-2', 'RT-DAN-SGN', 'STA-12', 2),
    ('RS-DAN-SGN-3', 'RT-DAN-SGN', 'STA-01', 3),
    -- Tuyến Giáp Bát <-> Miền Đông (qua Đà Nẵng STA-06 và Nha Trang STA-12 theo đúng thứ tự địa lý)
    ('RS-HAN-SGN-1', 'RT-HAN-SGN', 'STA-04', 1),
    ('RS-HAN-SGN-2', 'RT-HAN-SGN', 'STA-06', 2),
    ('RS-HAN-SGN-3', 'RT-HAN-SGN', 'STA-12', 3),
    ('RS-HAN-SGN-4', 'RT-HAN-SGN', 'STA-01', 4),
    ('RS-SGN-HAN-1', 'RT-SGN-HAN', 'STA-01', 1),
    ('RS-SGN-HAN-2', 'RT-SGN-HAN', 'STA-12', 2),
    ('RS-SGN-HAN-3', 'RT-SGN-HAN', 'STA-06', 3),
    ('RS-SGN-HAN-4', 'RT-SGN-HAN', 'STA-04', 4),
    -- 14 tuyến còn lại (2 trạm: bến đi = 1, bến đến = 2)
    ('RS-HAN-DAN-1', 'RT-HAN-DAN', 'STA-03', 1),
    ('RS-HAN-DAN-2', 'RT-HAN-DAN', 'STA-06', 2),
    ('RS-DAN-HAN-1', 'RT-DAN-HAN', 'STA-06', 1),
    ('RS-DAN-HAN-2', 'RT-DAN-HAN', 'STA-03', 2),
    ('RS-HAN-SPA-1', 'RT-HAN-SPA', 'STA-03', 1),
    ('RS-HAN-SPA-2', 'RT-HAN-SPA', 'STA-15', 2),
    ('RS-SPA-HAN-1', 'RT-SPA-HAN', 'STA-15', 1),
    ('RS-SPA-HAN-2', 'RT-SPA-HAN', 'STA-03', 2),
    ('RS-SGN-DLI-1', 'RT-SGN-DLI', 'STA-01', 1),
    ('RS-SGN-DLI-2', 'RT-SGN-DLI', 'STA-02', 2),
    ('RS-DLI-SGN-1', 'RT-DLI-SGN', 'STA-02', 1),
    ('RS-DLI-SGN-2', 'RT-DLI-SGN', 'STA-01', 2),
    ('RS-SGN-NTR-1', 'RT-SGN-NTR', 'STA-01', 1),
    ('RS-SGN-NTR-2', 'RT-SGN-NTR', 'STA-12', 2),
    ('RS-NTR-SGN-1', 'RT-NTR-SGN', 'STA-12', 1),
    ('RS-NTR-SGN-2', 'RT-NTR-SGN', 'STA-01', 2),
    ('RS-DAN-NTR-1', 'RT-DAN-NTR', 'STA-06', 1),
    ('RS-DAN-NTR-2', 'RT-DAN-NTR', 'STA-12', 2),
    ('RS-NTR-DAN-1', 'RT-NTR-DAN', 'STA-12', 1),
    ('RS-NTR-DAN-2', 'RT-NTR-DAN', 'STA-06', 2),
    ('RS-HAN-HPH-1', 'RT-HAN-HPH', 'STA-04', 1),
    ('RS-HAN-HPH-2', 'RT-HAN-HPH', 'STA-11', 2),
    ('RS-HPH-HAN-1', 'RT-HPH-HAN', 'STA-11', 1),
    ('RS-HPH-HAN-2', 'RT-HPH-HAN', 'STA-04', 2),
    ('RS-SGN-CTH-1', 'RT-SGN-CTH', 'STA-07', 1),
    ('RS-SGN-CTH-2', 'RT-SGN-CTH', 'STA-17', 2),
    ('RS-CTH-SGN-1', 'RT-CTH-SGN', 'STA-17', 1),
    ('RS-CTH-SGN-2', 'RT-CTH-SGN', 'STA-07', 2);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- ==========================================================================================================
-- 8. BUSES (34 xe: 32 xe ACTIVE chạy tuyến cố định + 2 xe INACTIVE dự phòng)
-- ==========================================================================================================
BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.buses (bus_id, license_plate, type_id, status) VALUES
    -- Cặp 1: HAN-DAN (2 BT-01, 2 BT-02)
    ('BUS-01', '29B-101.01', 'BT-01', 'ACTIVE'),
    ('BUS-02', '43B-102.02', 'BT-01', 'ACTIVE'),
    ('BUS-03', '29B-103.03', 'BT-02', 'ACTIVE'),
    ('BUS-04', '43B-104.04', 'BT-02', 'ACTIVE'),
    -- Cặp 2: HAN-SPA (1 BT-01, 1 BT-02)
    ('BUS-05', '29B-105.05', 'BT-01', 'ACTIVE'),
    ('BUS-06', '24B-106.06', 'BT-02', 'ACTIVE'),
    -- Cặp 3: SGN-DAN (2 BT-01, 2 BT-02)
    ('BUS-07', '51B-107.07', 'BT-01', 'ACTIVE'),
    ('BUS-08', '43B-108.08', 'BT-01', 'ACTIVE'),
    ('BUS-09', '51B-109.09', 'BT-02', 'ACTIVE'),
    ('BUS-10', '43B-110.10', 'BT-02', 'ACTIVE'),
    -- Cặp 4: SGN-DLI (1 BT-01, 1 BT-02)
    ('BUS-11', '51B-111.11', 'BT-01', 'ACTIVE'),
    ('BUS-12', '49B-112.12', 'BT-02', 'ACTIVE'),
    -- Cặp 5: SGN-NTR (2 BT-01, 2 BT-02)
    ('BUS-13', '51B-113.13', 'BT-01', 'ACTIVE'),
    ('BUS-14', '79B-114.14', 'BT-01', 'ACTIVE'),
    ('BUS-15', '51B-115.15', 'BT-02', 'ACTIVE'),
    ('BUS-16', '79B-116.16', 'BT-02', 'ACTIVE'),
    -- Cặp 6: DAN-NTR (2 BT-01, 2 BT-02)
    ('BUS-17', '43B-117.17', 'BT-01', 'ACTIVE'),
    ('BUS-18', '79B-118.18', 'BT-01', 'ACTIVE'),
    ('BUS-19', '43B-119.19', 'BT-02', 'ACTIVE'),
    ('BUS-20', '79B-120.20', 'BT-02', 'ACTIVE'),
    -- Cặp 7: HAN-SGN (3 BT-01, 3 BT-02)
    ('BUS-21', '29B-121.21', 'BT-01', 'ACTIVE'),
    ('BUS-22', '51B-122.22', 'BT-01', 'ACTIVE'),
    ('BUS-23', '29B-123.23', 'BT-01', 'ACTIVE'),
    ('BUS-24', '29B-124.24', 'BT-02', 'ACTIVE'),
    ('BUS-25', '51B-125.25', 'BT-02', 'ACTIVE'),
    ('BUS-26', '29B-126.26', 'BT-02', 'ACTIVE'),
    -- Cặp 8: HAN-HPH (3 BT-03)
    ('BUS-27', '29B-127.27', 'BT-03', 'ACTIVE'),
    ('BUS-28', '15B-128.28', 'BT-03', 'ACTIVE'),
    ('BUS-29', '29B-129.29', 'BT-03', 'ACTIVE'),
    -- Cặp 9: SGN-CTH (3 BT-03)
    ('BUS-30', '51B-130.30', 'BT-03', 'ACTIVE'),
    ('BUS-31', '65B-131.31', 'BT-03', 'ACTIVE'),
    ('BUS-32', '51B-132.32', 'BT-03', 'ACTIVE'),
    -- 2 xe INACTIVE dự phòng
    ('BUS-33', '29B-133.33', 'BT-01', 'INACTIVE'),
    ('BUS-34', '51B-134.34', 'BT-02', 'INACTIVE');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- ==========================================================================================================
-- 9. SEATS (838 ghế cho 34 xe: BT-01=34 ghế SLEEPER, BT-02=22 ghế VIP, BT-03=9 ghế NORMAL)
-- ==========================================================================================================
BEGIN TRY
    BEGIN TRANSACTION;

    ;WITH N10 AS (SELECT n FROM (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10)) v(n)),
    Nums AS (
        SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS idx
        FROM N10 a CROSS JOIN N10 b
    ),
    SeatCalc AS (
        SELECT
            b.bus_id,
            b.type_id,
            n.idx,
            CASE
                WHEN b.type_id = 'BT-01' THEN
                    CASE WHEN n.idx <= 17 THEN 'A' + RIGHT('0' + CAST(n.idx AS VARCHAR(2)), 2)
                         ELSE 'B' + RIGHT('0' + CAST(n.idx - 17 AS VARCHAR(2)), 2) END
                WHEN b.type_id = 'BT-02' THEN
                    CASE WHEN n.idx <= 11 THEN 'A' + RIGHT('0' + CAST(n.idx AS VARCHAR(2)), 2)
                         ELSE 'B' + RIGHT('0' + CAST(n.idx - 11 AS VARCHAR(2)), 2) END
                ELSE 'A' + RIGHT('0' + CAST(n.idx AS VARCHAR(2)), 2)
            END AS seat_number,
            CASE
                WHEN b.type_id = 'BT-01' THEN CASE WHEN n.idx <= 17 THEN 1 ELSE 2 END
                WHEN b.type_id = 'BT-02' THEN CASE WHEN n.idx <= 11 THEN 1 ELSE 2 END
                ELSE 1
            END AS floor_no,
            CASE
                WHEN b.type_id = 'BT-01' THEN 'SLEEPER'
                WHEN b.type_id = 'BT-02' THEN 'VIP'
                ELSE 'NORMAL'
            END AS seat_type
        FROM dbo.buses b
        JOIN dbo.bus_types bt ON bt.type_id = b.type_id
        JOIN Nums n ON n.idx <= bt.total_seats
    )
    INSERT INTO dbo.seats (seat_id, seat_number, floor, seat_type, bus_id)
    SELECT
        'S-' + bus_id + '-' + seat_number,
        seat_number,
        floor_no,
        seat_type,
        bus_id
    FROM SeatCalc;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- ==========================================================================================================
-- 10. TRIPS (44 chuyến/ngày × (@DaysPast + @DaysFuture + 1) = 660 chuyến)
-- ==========================================================================================================
IF OBJECT_ID('tempdb..#TripMeta') IS NOT NULL DROP TABLE #TripMeta;
CREATE TABLE #TripMeta (
    trip_seq INT PRIMARY KEY,
    trip_id VARCHAR(50) NOT NULL,
    d_idx INT NOT NULL,
    day_offset INT NOT NULL,
    slot_id INT NOT NULL,
    route_id VARCHAR(50) NOT NULL,
    bus_id VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50) NOT NULL,
    type_id VARCHAR(50) NOT NULL,
    total_seats INT NOT NULL,
    departure_time DATETIME2 NOT NULL,
    arrival_time DATETIME2 NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    active_groups INT NOT NULL
);

BEGIN TRY
    BEGIN TRANSACTION;

    -- Bảng 44 khung giờ cố định mỗi ngày kèm quy tắc quay vòng xe (rot_mode: 1=1 xe, 2=2 xe, 3=3 xe dài, 4=3 xe ngắn)
    ;WITH SlotCfg AS (
        SELECT * FROM (VALUES
            -- Cặp 1: HAN-DAN (840 ph, BT-01: 385k, BT-02: 520k) - DRV-01..04 luôn chạy mỗi ngày
            ( 1, 'RT-HAN-DAN', 'BT-01', 34, 1260,  840,  385000.00, 1,  2, 0),
            ( 2, 'RT-DAN-HAN', 'BT-01', 34, 1290,  840,  385000.00, 1,  2, 1),
            ( 3, 'RT-HAN-DAN', 'BT-02', 22, 1110,  840,  520000.00, 3,  2, 0),
            ( 4, 'RT-DAN-HAN', 'BT-02', 22, 1140,  840,  520000.00, 3,  2, 1),
            -- Cặp 2: HAN-SPA (330 ph, BT-01: 210k, BT-02: 285k) - DRV-05..06 luôn chạy mỗi ngày
            ( 5, 'RT-HAN-SPA', 'BT-01', 34,  390,  330,  210000.00, 5,  1, 0),
            ( 6, 'RT-SPA-HAN', 'BT-01', 34,  990,  330,  210000.00, 5,  1, 0),
            ( 7, 'RT-HAN-SPA', 'BT-02', 22,  510,  330,  285000.00, 6,  1, 0),
            ( 8, 'RT-SPA-HAN', 'BT-02', 22, 1110,  330,  285000.00, 6,  1, 0),
            -- Cặp 3: SGN-DAN (1080 ph, BT-01: 465k, BT-02: 630k)
            ( 9, 'RT-SGN-DAN', 'BT-01', 34,  960, 1080,  465000.00, 7,  2, 0),
            (10, 'RT-DAN-SGN', 'BT-01', 34,  990, 1080,  465000.00, 7,  2, 1),
            (11, 'RT-SGN-DAN', 'BT-02', 22, 1110, 1080,  630000.00, 9,  2, 0),
            (12, 'RT-DAN-SGN', 'BT-02', 22, 1140, 1080,  630000.00, 9,  2, 1),
            -- Cặp 4: SGN-DLI (480 ph, BT-01: 200k, BT-02: 270k)
            (13, 'RT-SGN-DLI', 'BT-01', 34,  300,  480,  200000.00, 11, 1, 0),
            (14, 'RT-DLI-SGN', 'BT-01', 34, 1020,  480,  200000.00, 11, 1, 0),
            (15, 'RT-SGN-DLI', 'BT-02', 22,  450,  480,  270000.00, 12, 1, 0),
            (16, 'RT-DLI-SGN', 'BT-02', 22, 1170,  480,  270000.00, 12, 1, 0),
            -- Cặp 5: SGN-NTR (510 ph, BT-01: 250k, BT-02: 340k)
            (17, 'RT-SGN-NTR', 'BT-01', 34,  540,  510,  250000.00, 13, 2, 0),
            (18, 'RT-NTR-SGN', 'BT-01', 34,  570,  510,  250000.00, 13, 2, 1),
            (19, 'RT-SGN-NTR', 'BT-02', 22, 1260,  510,  340000.00, 15, 2, 0),
            (20, 'RT-NTR-SGN', 'BT-02', 22, 1290,  510,  340000.00, 15, 2, 1),
            -- Cặp 6: DAN-NTR (570 ph, BT-01: 290k, BT-02: 390k)
            (21, 'RT-DAN-NTR', 'BT-01', 34,  480,  570,  290000.00, 17, 2, 0),
            (22, 'RT-NTR-DAN', 'BT-01', 34,  510,  570,  290000.00, 17, 2, 1),
            (23, 'RT-DAN-NTR', 'BT-02', 22, 1170,  570,  390000.00, 19, 2, 0),
            (24, 'RT-NTR-DAN', 'BT-02', 22, 1200,  570,  390000.00, 19, 2, 1),
            -- Cặp 7: HAN-SGN (1800 ph, BT-01: 770k, BT-02: 1040k)
            (25, 'RT-HAN-SGN', 'BT-01', 34, 1080, 1800,  770000.00, 21, 3, 0),
            (26, 'RT-SGN-HAN', 'BT-01', 34,  360, 1800,  770000.00, 21, 3, 1),
            (27, 'RT-HAN-SGN', 'BT-02', 22, 1230, 1800, 1040000.00, 24, 3, 0),
            (28, 'RT-SGN-HAN', 'BT-02', 22,  510, 1800, 1040000.00, 24, 3, 1),
            -- Cặp 8: HAN-HPH (110 ph, BT-03: 130k, 4 chuyến/chiều/ngày cách đều 4h)
            (29, 'RT-HAN-HPH', 'BT-03',  9,  360,  110,  130000.00, 27, 4, 0),
            (30, 'RT-HAN-HPH', 'BT-03',  9,  600,  110,  130000.00, 27, 4, 2),
            (31, 'RT-HAN-HPH', 'BT-03',  9,  840,  110,  130000.00, 27, 4, 1),
            (32, 'RT-HAN-HPH', 'BT-03',  9, 1080,  110,  130000.00, 27, 4, 0),
            (33, 'RT-HPH-HAN', 'BT-03',  9,  480,  110,  130000.00, 27, 4, 1),
            (34, 'RT-HPH-HAN', 'BT-03',  9,  720,  110,  130000.00, 27, 4, 0),
            (35, 'RT-HPH-HAN', 'BT-03',  9,  960,  110,  130000.00, 27, 4, 2),
            (36, 'RT-HPH-HAN', 'BT-03',  9, 1200,  110,  130000.00, 27, 4, 1),
            -- Cặp 9: SGN-CTH (200 ph, BT-03: 160k, 4 chuyến/chiều/ngày cách đều 5.5h)
            (37, 'RT-SGN-CTH', 'BT-03',  9,  300,  200,  160000.00, 30, 4, 0),
            (38, 'RT-SGN-CTH', 'BT-03',  9,  630,  200,  160000.00, 30, 4, 2),
            (39, 'RT-SGN-CTH', 'BT-03',  9,  960,  200,  160000.00, 30, 4, 1),
            (40, 'RT-SGN-CTH', 'BT-03',  9, 1290,  200,  160000.00, 30, 4, 0),
            (41, 'RT-CTH-SGN', 'BT-03',  9,  420,  200,  160000.00, 30, 4, 1),
            (42, 'RT-CTH-SGN', 'BT-03',  9,  750,  200,  160000.00, 30, 4, 0),
            (43, 'RT-CTH-SGN', 'BT-03',  9, 1080,  200,  160000.00, 30, 4, 2),
            (44, 'RT-CTH-SGN', 'BT-03',  9, 1410,  200,  160000.00, 30, 4, 1)
        ) v(slot_id, route_id, type_id, total_seats, dep_min, dur_min, price, base_bus_no, rot_mode, rot_param)
    ),
    N10 AS (SELECT n FROM (VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9)) v(n)),
    DaysGen AS (
        SELECT
            a.n * 10 + b.n AS d_idx,
            (a.n * 10 + b.n) - @DaysPast AS day_offset
        FROM N10 a CROSS JOIN N10 b
        WHERE a.n * 10 + b.n <= @DaysPast + @DaysFuture
    ),
    RawTrips AS (
        SELECT
            d.d_idx * 44 + s.slot_id AS trip_seq,
            'TRP-' + RIGHT('00' + CAST(d.d_idx + 1 AS VARCHAR(2)), 2) + '-' + RIGHT('00' + CAST(s.slot_id AS VARCHAR(2)), 2) AS trip_id,
            d.d_idx,
            d.day_offset,
            s.slot_id,
            s.route_id,
            s.type_id,
            s.total_seats,
            s.base_bus_no + CASE
                WHEN s.rot_mode = 1 THEN 0
                WHEN s.rot_mode = 2 THEN (d.d_idx + s.rot_param) % 2
                WHEN s.rot_mode = 3 THEN (d.d_idx + s.rot_param) % 3
                ELSE (s.rot_param - (d.d_idx % 3) + 3) % 3
            END AS bus_no,
            DATEADD(MINUTE, s.dep_min, DATEADD(DAY, d.day_offset, @TodayDt)) AS departure_time,
            DATEADD(MINUTE, s.dep_min + s.dur_min, DATEADD(DAY, d.day_offset, @TodayDt)) AS arrival_time,
            s.price
        FROM DaysGen d
        CROSS JOIN SlotCfg s
    ),
    TripsWithStatus AS (
        SELECT
            rt.*,
            'BUS-' + RIGHT('00' + CAST(rt.bus_no AS VARCHAR(2)), 2) AS bus_id,
            'DRV-' + RIGHT('00' + CAST(rt.bus_no AS VARCHAR(2)), 2) AS driver_id,
            CASE
                WHEN rt.arrival_time < @Now THEN 'COMPLETED'
                WHEN rt.departure_time <= @Now AND rt.arrival_time >= @Now THEN 'DEPARTED'
                WHEN (rt.day_offset IN (4, 5, 6) AND rt.slot_id IN (1, 15, 29))
                  OR (rt.day_offset = 7 AND rt.slot_id = 1) THEN 'CANCELLED'
                ELSE 'SCHEDULED'
            END AS status
        FROM RawTrips rt
    )
    INSERT INTO #TripMeta (
        trip_seq, trip_id, d_idx, day_offset, slot_id, route_id, bus_id, driver_id,
        type_id, total_seats, departure_time, arrival_time, price, status, active_groups
    )
    SELECT
        t.trip_seq, t.trip_id, t.d_idx, t.day_offset, t.slot_id, t.route_id, t.bus_id, t.driver_id,
        t.type_id, t.total_seats, t.departure_time, t.arrival_time, t.price, t.status,
        CASE
            WHEN t.status = 'CANCELLED' THEN 0
            -- Kịch bản Demo ngày mai (day_offset = 1): 3 chuyến sắp đầy (còn 1 ghế), 3 chuyến đầy 100%, 2 chuyến trống 100%
            WHEN t.day_offset = 1 AND t.slot_id IN (1, 3, 9) THEN
                CASE WHEN t.type_id = 'BT-01' THEN 9 WHEN t.type_id = 'BT-02' THEN 6 ELSE 2 END
            WHEN t.day_offset = 1 AND t.slot_id IN (2, 4, 11) THEN
                CASE WHEN t.type_id = 'BT-01' THEN 10 WHEN t.type_id = 'BT-02' THEN 7 ELSE 3 END
            WHEN t.day_offset IN (1, 2) AND t.slot_id IN (25, 27) THEN 0
            -- Chuyến hôm nay của driver1..driver5 (slot 1..6): đảm bảo có >= 4 nhóm để vừa có vé CONFIRMED chờ soát vừa có vé CHECKED_IN
            WHEN t.day_offset = 0 AND t.slot_id BETWEEN 1 AND 6 THEN
                CASE WHEN t.type_id = 'BT-01' THEN 5 ELSE 4 END
            -- Chuyến quá khứ hoặc đã/đang chạy: độ lấp đầy 40-90%
            WHEN t.status IN ('COMPLETED', 'DEPARTED') OR t.day_offset < 0 THEN
                CASE
                    WHEN t.type_id = 'BT-01' THEN 4 + ((t.slot_id + ABS(t.day_offset) * 3) % 5)
                    WHEN t.type_id = 'BT-02' THEN 3 + ((t.slot_id + ABS(t.day_offset) * 3) % 3)
                    ELSE 2
                END
            -- Chuyến SCHEDULED 0..2 ngày tới: độ lấp đầy 30-80% (nhiều chuyến dài trống >= 50%)
            WHEN t.day_offset IN (0, 1, 2) THEN
                CASE
                    WHEN t.type_id = 'BT-01' THEN 3 + ((t.slot_id + t.day_offset * 2) % 5)
                    WHEN t.type_id = 'BT-02' THEN 2 + ((t.slot_id + t.day_offset * 2) % 4)
                    ELSE 1 + ((t.slot_id + t.day_offset) % 2)
                END
            -- Chuyến SCHEDULED 3..4 ngày tới: độ lấp đầy 0-30%
            WHEN t.day_offset IN (3, 4) THEN
                CASE
                    WHEN t.type_id = 'BT-01' THEN (t.slot_id + t.day_offset) % 3
                    WHEN t.type_id = 'BT-02' THEN (t.slot_id + t.day_offset) % 2
                    ELSE CASE WHEN (t.slot_id + t.day_offset) % 3 = 0 THEN 1 ELSE 0 END
                END
            -- Chuyến SCHEDULED 5..7 ngày tới: giảm dần 0-20%
            ELSE
                CASE
                    WHEN t.type_id = 'BT-01' THEN CASE WHEN (t.slot_id + t.day_offset) % 3 = 0 THEN 1 ELSE 0 END
                    WHEN t.type_id = 'BT-02' THEN CASE WHEN (t.slot_id + t.day_offset) % 4 = 0 THEN 1 ELSE 0 END
                    ELSE 0
                END
        END AS active_groups
    FROM TripsWithStatus t;

    INSERT INTO dbo.trips (trip_id, route_id, bus_id, driver_id, departure_time, arrival_time, price, status)
    SELECT trip_id, route_id, bus_id, driver_id, departure_time, arrival_time, price, status
    FROM #TripMeta;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- ==========================================================================================================
-- 11. BOOKINGS, TICKETS & PAYMENTS (Sinh tập hợp từ #TripMeta & mẫu phân hoạch ghế không giao nhau)
-- ==========================================================================================================
IF OBJECT_ID('tempdb..#BookingGen') IS NOT NULL DROP TABLE #BookingGen;
CREATE TABLE #BookingGen (
    booking_seq INT PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    booking_code VARCHAR(20) NOT NULL,
    trip_id VARCHAR(50) NOT NULL,
    trip_seq INT NOT NULL,
    day_offset INT NOT NULL,
    slot_id INT NOT NULL,
    type_id VARCHAR(50) NOT NULL,
    bus_id VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50) NOT NULL,
    trip_status VARCHAR(20) NOT NULL,
    departure_time DATETIME2 NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    grp_no INT NOT NULL,
    s_from INT NOT NULL,
    s_to INT NOT NULL,
    seat_cnt INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    booking_status VARCHAR(20) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    created_at DATETIME2 NOT NULL,
    expired_at DATETIME2 NOT NULL,
    customer_id VARCHAR(50) NOT NULL
);

BEGIN TRY
    BEGIN TRANSACTION;

    -- 11.1. Chuẩn bị danh sách bookings từ mẫu nhóm ghế (grp_no 1..10: hiệu lực; grp_no 11: EXPIRED; grp_no 13: CANCELLED)
    ;WITH GrpTemplate AS (
        SELECT * FROM (VALUES
            ('BT-01',  1,  1,  4), ('BT-01',  2,  5,  8), ('BT-01',  3,  9, 12), ('BT-01',  4, 13, 15),
            ('BT-01',  5, 16, 19), ('BT-01',  6, 20, 22), ('BT-01',  7, 23, 26), ('BT-01',  8, 27, 30),
            ('BT-01',  9, 31, 33), ('BT-01', 10, 34, 34), ('BT-01', 11,  1,  2), ('BT-01', 13,  6,  7),
            ('BT-02',  1,  1,  4), ('BT-02',  2,  5,  7), ('BT-02',  3,  8, 10), ('BT-02',  4, 11, 14),
            ('BT-02',  5, 15, 18), ('BT-02',  6, 19, 21), ('BT-02',  7, 22, 22), ('BT-02', 11,  1,  2),
            ('BT-02', 13,  5,  6),
            ('BT-03',  1,  1,  3), ('BT-03',  2,  4,  7), ('BT-03',  3,  8,  9), ('BT-03', 11,  1,  2),
            ('BT-03', 13,  4,  5)
        ) v(type_id, grp_no, s_from, s_to)
    ),
    RawBookings AS (
        SELECT
            tm.trip_id,
            tm.trip_seq,
            tm.day_offset,
            tm.slot_id,
            tm.type_id,
            tm.bus_id,
            tm.driver_id,
            tm.status AS trip_status,
            tm.departure_time,
            tm.price,
            tm.active_groups,
            gt.grp_no,
            gt.s_from,
            gt.s_to,
            gt.s_to - gt.s_from + 1 AS seat_cnt,
            CAST((gt.s_to - gt.s_from + 1) * tm.price AS DECIMAL(12,2)) AS total_amount,
            CASE
                WHEN gt.grp_no = 11 THEN 'EXPIRED'
                WHEN gt.grp_no = 13 THEN 'CANCELLED'
                -- Chuyến SCHEDULED tương lai (khởi hành sau > 45 phút, không phải chuyến demo đầy/sắp đầy, không phải chuyến DRV-01..05 hôm nay):
                -- đặt nhóm cuối làm PENDING để đạt ~8% PENDING và không giảm tỷ lệ lấp đầy dưới ngưỡng
                WHEN tm.status = 'SCHEDULED'
                     AND tm.departure_time > DATEADD(MINUTE, 45, @Now)
                     AND NOT (tm.day_offset = 1 AND tm.slot_id IN (1, 2, 3, 4, 9, 11))
                     AND NOT (tm.day_offset = 0 AND tm.slot_id BETWEEN 1 AND 6)
                     AND gt.grp_no = tm.active_groups
                     AND (tm.active_groups >= 4 OR (tm.day_offset >= 3 AND tm.active_groups >= 1))
                THEN 'PENDING'
                ELSE 'CONFIRMED'
            END AS booking_status
        FROM #TripMeta tm
        JOIN GrpTemplate gt ON gt.type_id = tm.type_id
        WHERE (gt.grp_no <= tm.active_groups)
           OR (gt.grp_no = 11 AND (tm.slot_id + tm.d_idx) % 9 < 4)
           OR (gt.grp_no = 13 AND ((tm.slot_id + tm.d_idx) % 10 < 3 OR tm.status = 'CANCELLED'))
    ),
    NumberedBookings AS (
        SELECT
            rb.*,
            ROW_NUMBER() OVER (ORDER BY rb.trip_seq, rb.grp_no) AS booking_seq,
            ROW_NUMBER() OVER (PARTITION BY rb.booking_status ORDER BY rb.trip_seq, rb.grp_no) AS status_rn,
            CASE
                WHEN rb.booking_status = 'PENDING' THEN
                    DATEADD(MINUTE, -2 - (rb.grp_no % 8), @Now)
                WHEN rb.departure_time <= @Now THEN
                    DATEADD(MINUTE, -180 - (rb.grp_no * 15) - (rb.slot_id % 30), rb.departure_time)
                ELSE
                    DATEADD(MINUTE, -60 - ((rb.trip_seq * 7 + rb.grp_no * 13) % 360),
                        CASE WHEN rb.departure_time < @Now THEN rb.departure_time ELSE @Now END)
            END AS calc_created_at
        FROM RawBookings rb
    )
    INSERT INTO #BookingGen (
        booking_seq, booking_id, booking_code, trip_id, trip_seq, day_offset, slot_id,
        type_id, bus_id, driver_id, trip_status, departure_time, price, grp_no, s_from, s_to,
        seat_cnt, total_amount, booking_status, channel, created_at, expired_at, customer_id
    )
    SELECT
        nb.booking_seq,
        'BKG-' + RIGHT('00000' + CAST(nb.booking_seq AS VARCHAR(10)), 5),
        'BK' + RIGHT('000000' + CAST(100000 + nb.booking_seq AS VARCHAR(10)), 6),
        nb.trip_id,
        nb.trip_seq,
        nb.day_offset,
        nb.slot_id,
        nb.type_id,
        nb.bus_id,
        nb.driver_id,
        nb.trip_status,
        nb.departure_time,
        nb.price,
        nb.grp_no,
        nb.s_from,
        nb.s_to,
        nb.seat_cnt,
        nb.total_amount,
        nb.booking_status,
        CASE WHEN nb.booking_seq % 4 = 0 THEN 'COUNTER' ELSE 'ONLINE' END AS channel,
        nb.calc_created_at,
        DATEADD(MINUTE, 15, nb.calc_created_at),
        -- Đảm bảo 6 khách demo (USR-CUS-1..5 và USR-GUEST-1) mỗi người có >= 8 booking đủ cả 4 trạng thái
        CASE
            WHEN nb.status_rn <= 18 THEN
                CASE (nb.status_rn - 1) % 6
                    WHEN 0 THEN 'USR-CUS-1'
                    WHEN 1 THEN 'USR-CUS-2'
                    WHEN 2 THEN 'USR-CUS-3'
                    WHEN 3 THEN 'USR-CUS-4'
                    WHEN 4 THEN 'USR-CUS-5'
                    ELSE 'USR-GUEST-1'
                END
            WHEN nb.booking_seq % 6 = 0 THEN
                'USR-GUEST-' + CAST((nb.booking_seq % 30) + 1 AS VARCHAR(10))
            ELSE
                'USR-CUS-' + CAST((nb.booking_seq % 150) + 1 AS VARCHAR(10))
        END AS customer_id
    FROM NumberedBookings nb;

    -- Chèn bảng bookings
    INSERT INTO dbo.bookings (booking_id, booking_code, customer_id, channel, created_at, expired_at, total_amount, status)
    SELECT booking_id, booking_code, customer_id, channel, created_at, expired_at, total_amount, booking_status
    FROM #BookingGen;

    -- 11.2. Chèn bảng tickets (ghế thuộc đúng xe của chuyến, >=1 vé mang SĐT khách đặt, đúng ma trận trạng thái)
    ;WITH BusSeatIndexed AS (
        SELECT
            s.bus_id,
            s.seat_id,
            s.seat_number,
            ROW_NUMBER() OVER (PARTITION BY s.bus_id ORDER BY s.floor ASC, s.seat_number ASC) AS seat_idx
        FROM dbo.seats s
    ),
    RawTickets AS (
        SELECT
            ROW_NUMBER() OVER (ORDER BY bg.booking_seq, bsi.seat_idx) AS ticket_seq,
            ROW_NUMBER() OVER (PARTITION BY bg.booking_seq ORDER BY bsi.seat_idx) AS idx_in_bkg,
            bg.booking_id,
            bg.booking_seq,
            bg.trip_id,
            bg.day_offset,
            bg.slot_id,
            bg.driver_id,
            bg.trip_status,
            bg.booking_status,
            bg.price,
            bg.customer_id,
            bsi.seat_id,
            bsi.seat_idx
        FROM #BookingGen bg
        JOIN BusSeatIndexed bsi
          ON bsi.bus_id = bg.bus_id
         AND bsi.seat_idx BETWEEN bg.s_from AND bg.s_to
    ),
    ActiveTripTicketRank AS (
        SELECT
            rt.*,
            CASE
                WHEN rt.booking_status IN ('CONFIRMED', 'PENDING') THEN
                    ROW_NUMBER() OVER (
                        PARTITION BY rt.trip_id, CASE WHEN rt.booking_status IN ('CONFIRMED', 'PENDING') THEN 1 ELSE 0 END
                        ORDER BY rt.seat_idx
                    )
                ELSE 0
            END AS active_rn_on_trip,
            CASE
                WHEN rt.booking_status IN ('CONFIRMED', 'PENDING') THEN
                    SUM(CASE WHEN rt.booking_status IN ('CONFIRMED', 'PENDING') THEN 1 ELSE 0 END)
                    OVER (PARTITION BY rt.trip_id)
                ELSE 0
            END AS total_active_on_trip
        FROM RawTickets rt
    )
    INSERT INTO dbo.tickets (ticket_id, ticket_code, booking_id, trip_id, seat_id, passenger_name, passenger_phone, price, status)
    SELECT
        'TCK-' + RIGHT('000000' + CAST(atr.ticket_seq AS VARCHAR(10)), 6),
        'TK' + RIGHT('000000' + CAST(100000 + atr.ticket_seq AS VARCHAR(10)), 6),
        atr.booking_id,
        atr.trip_id,
        atr.seat_id,
        CASE
            WHEN atr.idx_in_bkg = 1 THEN u.full_name
            ELSE u.full_name + N' (Khách ' + CAST(atr.idx_in_bkg AS NVARCHAR(5)) + N')'
        END AS passenger_name,
        u.phone AS passenger_phone,
        atr.price,
        CASE
            WHEN atr.booking_status = 'PENDING' THEN 'PENDING'
            WHEN atr.booking_status = 'EXPIRED' THEN 'EXPIRED'
            WHEN atr.booking_status = 'CANCELLED' THEN 'CANCELLED'
            -- booking_status = 'CONFIRMED':
            WHEN atr.trip_status IN ('DEPARTED', 'COMPLETED') THEN
                -- Chuyến DEPARTED/COMPLETED: >= 88% CHECKED_IN (>= 85%), còn lại CONFIRMED
                CASE
                    WHEN atr.active_rn_on_trip * 100 <= atr.total_active_on_trip * 12 THEN 'CONFIRMED'
                    ELSE 'CHECKED_IN'
                END
            WHEN atr.day_offset = 0 AND atr.driver_id IN ('DRV-01', 'DRV-02', 'DRV-03', 'DRV-04', 'DRV-05') THEN
                -- Kịch bản Demo hôm nay cho driver1..driver5 khi chuyến đang SCHEDULED: vài vé đã CHECKED_IN, còn lại CONFIRMED chờ soát
                CASE
                    WHEN atr.active_rn_on_trip <= 3 THEN 'CHECKED_IN'
                    ELSE 'CONFIRMED'
                END
            ELSE 'CONFIRMED'
        END AS status
    FROM ActiveTripTicketRank atr
    JOIN dbo.users u ON u.user_id = atr.customer_id;

    -- 11.3. Chèn bảng payments (đúng ma trận trạng thái, COUNTER chủ yếu CASH, tổng ~60% BANK_TRANSFER / ~40% CASH)
    ;WITH PaymentCandidates AS (
        SELECT
            bg.booking_seq,
            bg.booking_id,
            bg.booking_code,
            bg.booking_status,
            bg.trip_status,
            bg.channel,
            bg.total_amount,
            bg.created_at,
            bg.departure_time,
            CASE
                WHEN bg.channel = 'COUNTER' THEN
                    CASE WHEN bg.booking_seq % 10 = 0 THEN 'BANK_TRANSFER' ELSE 'CASH' END
                ELSE
                    CASE WHEN bg.booking_seq % 13 IN (0, 1, 2) THEN 'CASH' ELSE 'BANK_TRANSFER' END
            END AS method,
            CASE
                WHEN bg.booking_status = 'CONFIRMED' THEN
                    CASE
                        WHEN bg.trip_status IN ('DEPARTED', 'COMPLETED') THEN 'SUCCESS'
                        WHEN bg.booking_seq % 20 = 1 THEN 'PENDING'
                        ELSE 'SUCCESS'
                    END
                ELSE 'FAILED'
            END AS pay_status
        FROM #BookingGen bg
        WHERE (bg.booking_status = 'CONFIRMED' AND (bg.trip_status IN ('DEPARTED', 'COMPLETED') OR bg.booking_seq % 20 <> 0))
           OR (bg.booking_status IN ('EXPIRED', 'CANCELLED') AND bg.booking_seq % 2 = 0)
    ),
    NumberedPayments AS (
        SELECT
            pc.*,
            ROW_NUMBER() OVER (ORDER BY pc.booking_seq) AS pay_seq,
            'PAY-' + RIGHT('00000' + CAST(ROW_NUMBER() OVER (ORDER BY pc.booking_seq) AS VARCHAR(10)), 5) AS payment_id
        FROM PaymentCandidates pc
    )
    INSERT INTO dbo.payments (payment_id, booking_id, method, amount, paid_at, transaction_code, status)
    SELECT
        np.payment_id,
        np.booking_id,
        np.method,
        np.total_amount,
        CASE
            WHEN np.pay_status = 'SUCCESS' THEN DATEADD(MINUTE, 5, np.created_at)
            ELSE NULL
        END AS paid_at,
        CASE
            WHEN np.pay_status = 'SUCCESS' THEN
                CASE
                    WHEN np.method = 'BANK_TRANSFER' THEN 'VQR-' + np.booking_code
                    ELSE 'CASH-' + np.payment_id
                END
            ELSE NULL
        END AS transaction_code,
        np.pay_status
    FROM NumberedPayments np;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

DROP TABLE #BookingGen;
DROP TABLE #TripMeta;
GO

-- ==========================================================================================================
-- 12. KHỐI KIỂM TRA TOÀN VẸN DỮ LIỆU (20 TRUY VẤN KIỂM TRA - MỖI TRUY VẤN TRẢ VỀ 0 DÒNG VI PHẠM)
-- ==========================================================================================================
DECLARE @CheckNow DATETIME2 = SYSDATETIME();
DECLARE @CheckToday DATE = CAST(@CheckNow AS DATE);

-- 12.1. Tuyến có 2 bến cùng tỉnh (0 dòng)
SELECT r.route_id, s1.province_id AS dep_prv, s2.province_id AS arr_prv
FROM dbo.routes r
JOIN dbo.stations s1 ON s1.station_id = r.departure_station_id
JOIN dbo.stations s2 ON s2.station_id = r.arrival_station_id
WHERE s1.province_id = s2.province_id;

-- 12.2. Tuyến thiếu chiều ngược hoặc lệch thông số chiều ngược (0 dòng)
SELECT r1.route_id
FROM dbo.routes r1
LEFT JOIN dbo.routes r2
  ON r2.departure_station_id = r1.arrival_station_id
 AND r2.arrival_station_id = r1.departure_station_id
 AND r2.distance_km = r1.distance_km
 AND r2.estimated_duration = r1.estimated_duration
WHERE r2.route_id IS NULL;

-- 12.3. Trùng ghế hiệu lực trong cùng chuyến (0 dòng)
SELECT trip_id, seat_id, COUNT(*) AS active_cnt
FROM dbo.tickets
WHERE status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
GROUP BY trip_id, seat_id
HAVING COUNT(*) > 1;

-- 12.4. Chồng lịch xe hoặc chồng lịch tài xế (0 dòng)
SELECT t1.trip_id AS trip_1, t2.trip_id AS trip_2, 'BUS_OVERLAP' AS reason
FROM dbo.trips t1
JOIN dbo.trips t2 ON t1.bus_id = t2.bus_id AND t1.trip_id < t2.trip_id
WHERE t1.departure_time < t2.arrival_time AND t2.departure_time < t1.arrival_time
UNION ALL
SELECT t1.trip_id AS trip_1, t2.trip_id AS trip_2, 'DRIVER_OVERLAP' AS reason
FROM dbo.trips t1
JOIN dbo.trips t2 ON t1.driver_id = t2.driver_id AND t1.trip_id < t2.trip_id
WHERE t1.departure_time < t2.arrival_time AND t2.departure_time < t1.arrival_time;

-- 12.5. Xe không liên tục (bến đi <> bến đến chuyến trước) hoặc nghỉ < 240 phút (0 dòng)
;WITH BusSeq AS (
    SELECT
        t.bus_id,
        t.trip_id,
        r.departure_station_id,
        r.arrival_station_id,
        t.departure_time,
        t.arrival_time,
        LAG(r.arrival_station_id) OVER (PARTITION BY t.bus_id ORDER BY t.departure_time) AS prev_arrival_station_id,
        LAG(t.arrival_time) OVER (PARTITION BY t.bus_id ORDER BY t.departure_time) AS prev_arrival_time
    FROM dbo.trips t
    JOIN dbo.routes r ON r.route_id = t.route_id
)
SELECT bus_id, trip_id, prev_arrival_station_id, departure_station_id,
       DATEDIFF(MINUTE, prev_arrival_time, departure_time) AS rest_minutes
FROM BusSeq
WHERE prev_arrival_time IS NOT NULL
  AND (departure_station_id <> prev_arrival_station_id
       OR DATEDIFF(MINUTE, prev_arrival_time, departure_time) < 240);

-- 12.6. Tài xế chạy > 1 cặp tuyến hoặc > 1 xe (0 dòng)
SELECT
    t.driver_id,
    COUNT(DISTINCT t.bus_id) AS bus_cnt,
    COUNT(DISTINCT CASE WHEN r.departure_station_id < r.arrival_station_id
                        THEN r.departure_station_id + '-' + r.arrival_station_id
                        ELSE r.arrival_station_id + '-' + r.departure_station_id END) AS route_pair_cnt
FROM dbo.trips t
JOIN dbo.routes r ON r.route_id = t.route_id
GROUP BY t.driver_id
HAVING COUNT(DISTINCT t.bus_id) > 1
    OR COUNT(DISTINCT CASE WHEN r.departure_station_id < r.arrival_station_id
                           THEN r.departure_station_id + '-' + r.arrival_station_id
                           ELSE r.arrival_station_id + '-' + r.departure_station_id END) > 1;

-- 12.7. Xe 34/22 chạy tuyến ngắn hoặc xe 9 chỗ chạy tuyến dài (0 dòng)
SELECT t.trip_id, r.distance_km, b.type_id
FROM dbo.trips t
JOIN dbo.routes r ON r.route_id = t.route_id
JOIN dbo.buses b ON b.bus_id = t.bus_id
WHERE (r.distance_km > 200 AND b.type_id = 'BT-03')
   OR (r.distance_km < 200 AND b.type_id IN ('BT-01', 'BT-02'));

-- 12.8. Tuyến dài thiếu 1 trong 2 loại xe mỗi chiều mỗi ngày, hoặc lệch nhau < 2 giờ (0 dòng)
SELECT
    CAST(t.departure_time AS DATE) AS trip_date,
    t.route_id,
    SUM(CASE WHEN b.type_id = 'BT-01' THEN 1 ELSE 0 END) AS bt01_cnt,
    SUM(CASE WHEN b.type_id = 'BT-02' THEN 1 ELSE 0 END) AS bt02_cnt,
    ABS(DATEDIFF(MINUTE,
        MIN(CASE WHEN b.type_id = 'BT-01' THEN t.departure_time END),
        MIN(CASE WHEN b.type_id = 'BT-02' THEN t.departure_time END))) AS diff_minutes
FROM dbo.trips t
JOIN dbo.routes r ON r.route_id = t.route_id
JOIN dbo.buses b ON b.bus_id = t.bus_id
WHERE r.distance_km > 200
GROUP BY CAST(t.departure_time AS DATE), t.route_id
HAVING SUM(CASE WHEN b.type_id = 'BT-01' THEN 1 ELSE 0 END) <> 1
    OR SUM(CASE WHEN b.type_id = 'BT-02' THEN 1 ELSE 0 END) <> 1
    OR ABS(DATEDIFF(MINUTE,
        MIN(CASE WHEN b.type_id = 'BT-01' THEN t.departure_time END),
        MIN(CASE WHEN b.type_id = 'BT-02' THEN t.departure_time END))) < 120;

-- 12.9. Tuyến ngắn không đủ 4 chuyến/chiều/ngày (0 dòng)
SELECT
    CAST(t.departure_time AS DATE) AS trip_date,
    t.route_id,
    COUNT(*) AS trip_cnt
FROM dbo.trips t
JOIN dbo.routes r ON r.route_id = t.route_id
WHERE r.distance_km < 200
GROUP BY CAST(t.departure_time AS DATE), t.route_id
HAVING COUNT(*) <> 4;

-- 12.10. Xe 22 không đắt hơn xe 34 cùng tuyến, hoặc cùng tuyến + loại xe có nhiều mức giá (0 dòng)
SELECT r.route_id
FROM dbo.routes r
LEFT JOIN dbo.trips t1 ON t1.route_id = r.route_id
LEFT JOIN dbo.buses b1 ON b1.bus_id = t1.bus_id
GROUP BY r.route_id, r.distance_km
HAVING (r.distance_km > 200 AND MIN(CASE WHEN b1.type_id = 'BT-02' THEN t1.price END) <= MAX(CASE WHEN b1.type_id = 'BT-01' THEN t1.price END))
    OR COUNT(DISTINCT CASE WHEN b1.type_id = 'BT-01' THEN t1.price END) > 1
    OR COUNT(DISTINCT CASE WHEN b1.type_id = 'BT-02' THEN t1.price END) > 1
    OR COUNT(DISTINCT CASE WHEN b1.type_id = 'BT-03' THEN t1.price END) > 1;

-- 12.11. Ghế của vé không thuộc xe của chuyến (0 dòng)
SELECT tk.ticket_id, tk.trip_id, tk.seat_id
FROM dbo.tickets tk
JOIN dbo.trips t ON t.trip_id = tk.trip_id
JOIN dbo.seats s ON s.seat_id = tk.seat_id
WHERE s.bus_id <> t.bus_id;

-- 12.12. Booking có vé thuộc nhiều chuyến khác nhau hoặc số vé ngoài khoảng 1..5 (0 dòng)
SELECT b.booking_id, COUNT(tk.ticket_id) AS ticket_cnt, COUNT(DISTINCT tk.trip_id) AS trip_cnt
FROM dbo.bookings b
LEFT JOIN dbo.tickets tk ON tk.booking_id = b.booking_id
GROUP BY b.booking_id
HAVING COUNT(tk.ticket_id) NOT BETWEEN 1 AND 5
    OR COUNT(DISTINCT tk.trip_id) <> 1;

-- 12.13. total_amount của booking khác tổng price các vé (0 dòng)
SELECT b.booking_id, b.total_amount, SUM(tk.price) AS sum_ticket_price
FROM dbo.bookings b
JOIN dbo.tickets tk ON tk.booking_id = b.booking_id
GROUP BY b.booking_id, b.total_amount
HAVING b.total_amount <> SUM(tk.price);

-- 12.14. price của vé khác price của chuyến (0 dòng)
SELECT tk.ticket_id, tk.price AS ticket_price, t.price AS trip_price
FROM dbo.tickets tk
JOIN dbo.trips t ON t.trip_id = tk.trip_id
WHERE tk.price <> t.price;

-- 12.15. Payment SUCCESS sai tiền, > 1 SUCCESS/booking, hoặc sai định dạng mã giao dịch/thời gian (0 dòng)
SELECT p.payment_id, p.booking_id, p.amount, b.total_amount
FROM dbo.payments p
JOIN dbo.bookings b ON b.booking_id = p.booking_id
WHERE (p.status = 'SUCCESS' AND (
          p.amount <> b.total_amount
       OR p.paid_at IS NULL
       OR p.paid_at < b.created_at
       OR p.paid_at > @CheckNow
       OR (p.method = 'BANK_TRANSFER' AND p.transaction_code <> 'VQR-' + b.booking_code)
       OR (p.method = 'CASH' AND p.transaction_code <> 'CASH-' + p.payment_id)
      ))
   OR (p.status IN ('PENDING', 'FAILED') AND (p.paid_at IS NOT NULL OR p.transaction_code IS NOT NULL))
UNION ALL
SELECT MIN(payment_id), booking_id, SUM(amount), COUNT(*)
FROM dbo.payments
WHERE status = 'SUCCESS'
GROUP BY booking_id
HAVING COUNT(*) > 1;

-- 12.16. Trạng thái chuyến lệch thời gian hoặc chuyến CANCELLED có vé hiệu lực (0 dòng)
SELECT t.trip_id, t.status, t.departure_time, t.arrival_time
FROM dbo.trips t
WHERE (t.arrival_time < @CheckNow AND t.status <> 'COMPLETED')
   OR (t.departure_time <= @CheckNow AND t.arrival_time >= @CheckNow AND t.status <> 'DEPARTED')
   OR (t.departure_time > @CheckNow AND t.status NOT IN ('SCHEDULED', 'CANCELLED'))
   OR (t.status = 'CANCELLED' AND EXISTS (
       SELECT 1 FROM dbo.tickets tk
       WHERE tk.trip_id = t.trip_id AND tk.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
   ));

-- 12.17. Trạng thái vé/booking/payment sai ma trận (0 dòng)
SELECT b.booking_id, b.status AS booking_status, t.status AS trip_status
FROM dbo.bookings b
JOIN dbo.tickets tk ON tk.booking_id = b.booking_id
JOIN dbo.trips t ON t.trip_id = tk.trip_id
LEFT JOIN dbo.payments p ON p.booking_id = b.booking_id
WHERE (b.status = 'PENDING' AND (
          t.status <> 'SCHEDULED'
       OR b.expired_at <= @CheckNow
       OR tk.status <> 'PENDING'
       OR p.payment_id IS NOT NULL
      ))
   OR (b.status = 'CONFIRMED' AND (
          tk.status NOT IN ('CONFIRMED', 'CHECKED_IN')
       OR (t.status = 'SCHEDULED' AND tk.status = 'CHECKED_IN'
           AND NOT (CAST(t.departure_time AS DATE) = @CheckToday AND t.driver_id IN ('DRV-01','DRV-02','DRV-03','DRV-04','DRV-05')))
       OR p.status = 'FAILED'
      ))
   OR (b.status = 'EXPIRED' AND (
          tk.status <> 'EXPIRED'
       OR p.status IN ('SUCCESS', 'PENDING')
      ))
   OR (b.status = 'CANCELLED' AND (
          tk.status <> 'CANCELLED'
       OR p.status = 'SUCCESS'
      ))
   OR (t.status IN ('DEPARTED', 'COMPLETED') AND (b.status = 'PENDING' OR tk.status = 'PENDING'));

-- 12.18. route_stations không liên tục từ 1 hoặc sai trạm đầu/cuối (0 dòng)
;WITH RouteStopStats AS (
    SELECT
        r.route_id,
        r.departure_station_id,
        r.arrival_station_id,
        COUNT(rs.route_station_id) AS cnt,
        MIN(rs.stop_order) AS min_ord,
        MAX(rs.stop_order) AS max_ord,
        MAX(CASE WHEN rs.stop_order = 1 THEN rs.station_id END) AS first_sta,
        MAX(CASE WHEN rs.stop_order = r_max.max_stop THEN rs.station_id END) AS last_sta
    FROM dbo.routes r
    LEFT JOIN dbo.route_stations rs ON rs.route_id = r.route_id
    OUTER APPLY (
        SELECT MAX(stop_order) AS max_stop FROM dbo.route_stations WHERE route_id = r.route_id
    ) r_max
    GROUP BY r.route_id, r.departure_station_id, r.arrival_station_id
)
SELECT route_id, cnt, min_ord, max_ord, first_sta, last_sta
FROM RouteStopStats
WHERE cnt < 2
   OR min_ord <> 1
   OR max_ord <> cnt
   OR first_sta <> departure_station_id
   OR last_sta <> arrival_station_id;

-- 12.19. User DRIVER thiếu dòng trong drivers hoặc bằng lái hết hạn trước chuyến chạy (0 dòng)
SELECT u.user_id
FROM dbo.users u
LEFT JOIN dbo.drivers d ON d.user_id = u.user_id
WHERE (u.role = 'DRIVER' AND d.driver_id IS NULL)
   OR (u.role <> 'DRIVER' AND d.driver_id IS NOT NULL)
UNION ALL
SELECT d.user_id
FROM dbo.drivers d
JOIN dbo.trips t ON t.driver_id = d.driver_id
WHERE d.license_expiry < CAST(t.departure_time AS DATE);

-- 12.20. Số ghế thực tế trong bảng seats khác bus_types.total_seats (0 dòng)
SELECT b.bus_id, bt.total_seats, COUNT(s.seat_id) AS actual_seats
FROM dbo.buses b
JOIN dbo.bus_types bt ON bt.type_id = b.type_id
LEFT JOIN dbo.seats s ON s.bus_id = b.bus_id
GROUP BY b.bus_id, bt.total_seats
HAVING COUNT(s.seat_id) <> bt.total_seats;

-- ==========================================================================================================
-- 13. THỐNG KÊ SỐ DÒNG TỪNG BẢNG VÀ PHÂN BỐ TRẠNG THÁI
-- ==========================================================================================================
SELECT
    (SELECT COUNT(*) FROM dbo.provinces)      AS provinces_cnt,
    (SELECT COUNT(*) FROM dbo.stations)       AS stations_cnt,
    (SELECT COUNT(*) FROM dbo.routes)         AS routes_cnt,
    (SELECT COUNT(*) FROM dbo.route_stations) AS route_stations_cnt,
    (SELECT COUNT(*) FROM dbo.bus_types)      AS bus_types_cnt,
    (SELECT COUNT(*) FROM dbo.buses)          AS buses_cnt,
    (SELECT COUNT(*) FROM dbo.seats)          AS seats_cnt,
    (SELECT COUNT(*) FROM dbo.users)          AS users_cnt,
    (SELECT COUNT(*) FROM dbo.drivers)        AS drivers_cnt,
    (SELECT COUNT(*) FROM dbo.trips)          AS trips_cnt,
    (SELECT COUNT(*) FROM dbo.bookings)       AS bookings_cnt,
    (SELECT COUNT(*) FROM dbo.tickets)        AS tickets_cnt,
    (SELECT COUNT(*) FROM dbo.payments)       AS payments_cnt;

SELECT 'TRIPS_STATUS' AS category, status, COUNT(*) AS cnt,
       CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2)) AS pct
FROM dbo.trips GROUP BY status
UNION ALL
SELECT 'BOOKINGS_STATUS', status, COUNT(*),
       CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2))
FROM dbo.bookings GROUP BY status
UNION ALL
SELECT 'BOOKINGS_CHANNEL', channel, COUNT(*),
       CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2))
FROM dbo.bookings GROUP BY channel
UNION ALL
SELECT 'TICKETS_STATUS', status, COUNT(*),
       CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2))
FROM dbo.tickets GROUP BY status
UNION ALL
SELECT 'PAYMENTS_STATUS', status, COUNT(*),
       CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2))
FROM dbo.payments GROUP BY status
UNION ALL
SELECT 'PAYMENTS_METHOD', method, COUNT(*),
       CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2))
FROM dbo.payments GROUP BY method;
GO