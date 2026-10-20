This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
01_schema.sql
02_constraints.sql
03_indexes.sql
04_functions.sql
05_transactions.sql
06_triggers.sql
07_permissions.sql
08_stored_procedures.sql
09_views.sql
10_seed_data.sql
11_backup_restore.sql
12_financial_payments.sql
13_financial_reports.sql
```

# Files

## File: 01_schema.sql
```sql
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL,
    loyalty_points INT DEFAULT 0,
    is_active BIT DEFAULT 1 -- Đổi BOOLEAN -> BIT, TRUE -> 1
);
GO

CREATE TABLE provinces (
    province_id VARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE stations (
    station_id VARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    province_id VARCHAR(50) NOT NULL,
    address NVARCHAR(255) NOT NULL
);
GO

CREATE TABLE routes (
    route_id VARCHAR(50) PRIMARY KEY,
    departure_station_id VARCHAR(50) NOT NULL,
    arrival_station_id VARCHAR(50) NOT NULL,
    distance_km DECIMAL(10,2) NOT NULL,
    estimated_duration INT NOT NULL
);
GO

CREATE TABLE route_stations (
    route_station_id VARCHAR(50) PRIMARY KEY,
    route_id VARCHAR(50) NOT NULL,
    station_id VARCHAR(50) NOT NULL,
    stop_order INT NOT NULL
);
GO

CREATE TABLE bus_types (
    type_id VARCHAR(50) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    total_seats INT NOT NULL,
    floors INT NOT NULL
);
GO

CREATE TABLE buses (
    bus_id VARCHAR(50) PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    type_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL
);
GO

CREATE TABLE seats (
    seat_id VARCHAR(50) PRIMARY KEY,
    seat_number VARCHAR(10) NOT NULL,
    floor INT NOT NULL DEFAULT 1,
    seat_type VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    bus_id VARCHAR(50) NOT NULL
);
GO

CREATE TABLE drivers (
    driver_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_expiry DATE NOT NULL
);
GO

CREATE TABLE trips (
    trip_id VARCHAR(50) PRIMARY KEY,
    route_id VARCHAR(50) NOT NULL,
    bus_id VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50) NOT NULL,
    departure_time DATETIME2 NOT NULL, -- Đổi TIMESTAMP -> DATETIME2
    arrival_time DATETIME2 NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL
);
GO

CREATE TABLE bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    booking_code VARCHAR(20) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at DATETIME2 NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL
);
GO

CREATE TABLE payments (
    payment_id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    method VARCHAR(20) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_at DATETIME2,
    transaction_code VARCHAR(100),
    status VARCHAR(20) NOT NULL
);
GO

CREATE TABLE tickets (
    ticket_id VARCHAR(50) PRIMARY KEY,
    ticket_code VARCHAR(20) NOT NULL,
    booking_id VARCHAR(50) NOT NULL,
    trip_id VARCHAR(50) NOT NULL,
    seat_id VARCHAR(50) NOT NULL,
    passenger_name NVARCHAR(100) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL
);
GO
```

## File: 02_constraints.sql
```sql
-- 02_constraints.sql

-- ==========================================
-- FOREIGN KEYS
-- ==========================================
ALTER TABLE stations ADD CONSTRAINT fk_station_province FOREIGN KEY (province_id) REFERENCES provinces(province_id);
GO

ALTER TABLE routes ADD CONSTRAINT fk_route_departure FOREIGN KEY (departure_station_id) REFERENCES stations(station_id);
GO
ALTER TABLE routes ADD CONSTRAINT fk_route_arrival FOREIGN KEY (arrival_station_id) REFERENCES stations(station_id);
GO

ALTER TABLE route_stations ADD CONSTRAINT fk_route_station_route FOREIGN KEY (route_id) REFERENCES routes(route_id);
GO
ALTER TABLE route_stations ADD CONSTRAINT fk_route_station_station FOREIGN KEY (station_id) REFERENCES stations(station_id);
GO

ALTER TABLE buses ADD CONSTRAINT fk_bus_type FOREIGN KEY (type_id) REFERENCES bus_types(type_id);
GO

ALTER TABLE seats ADD CONSTRAINT fk_seat_bus FOREIGN KEY (bus_id) REFERENCES buses(bus_id);
GO

ALTER TABLE drivers ADD CONSTRAINT fk_driver_user FOREIGN KEY (user_id) REFERENCES users(user_id);
GO

ALTER TABLE trips ADD CONSTRAINT fk_trip_route FOREIGN KEY (route_id) REFERENCES routes(route_id);
GO
ALTER TABLE trips ADD CONSTRAINT fk_trip_bus FOREIGN KEY (bus_id) REFERENCES buses(bus_id);
GO
ALTER TABLE trips ADD CONSTRAINT fk_trip_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id);
GO

ALTER TABLE bookings ADD CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES users(user_id);
GO

ALTER TABLE payments ADD CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id);
GO

ALTER TABLE tickets ADD CONSTRAINT fk_ticket_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id);
GO
ALTER TABLE tickets ADD CONSTRAINT fk_ticket_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id);
GO
ALTER TABLE tickets ADD CONSTRAINT fk_ticket_seat FOREIGN KEY (seat_id) REFERENCES seats(seat_id);
GO

-- ==========================================
-- UNIQUE CONSTRAINTS
-- ==========================================
ALTER TABLE users ADD CONSTRAINT uq_user_email UNIQUE (email);
GO
ALTER TABLE users ADD CONSTRAINT uq_user_phone UNIQUE (phone);
GO

ALTER TABLE buses ADD CONSTRAINT uq_bus_license_plate UNIQUE (license_plate);
GO

ALTER TABLE drivers ADD CONSTRAINT uq_driver_license_number UNIQUE (license_number);
GO
ALTER TABLE drivers ADD CONSTRAINT uq_driver_user UNIQUE (user_id);
GO

ALTER TABLE bookings ADD CONSTRAINT uq_booking_code UNIQUE (booking_code);
GO

-- uq_payment_transaction_code được định nghĩa dưới dạng Filtered Unique Index trong 03_indexes.sql (do transaction_code có thể NULL)

ALTER TABLE tickets ADD CONSTRAINT uq_ticket_code UNIQUE (ticket_code);
GO

ALTER TABLE seats ADD CONSTRAINT uq_seat_number_per_bus UNIQUE (bus_id, seat_number);
GO

ALTER TABLE route_stations ADD CONSTRAINT uq_route_stop_order UNIQUE (route_id, stop_order);
GO

-- ==========================================
-- CHECK CONSTRAINTS (ENUMS)
-- ==========================================
ALTER TABLE users ADD CONSTRAINT chk_user_role CHECK (role IN ('CUSTOMER', 'STAFF', 'ADMIN', 'DRIVER', 'GUEST'));
GO

ALTER TABLE buses ADD CONSTRAINT chk_bus_status CHECK (status IN ('ACTIVE', 'INACTIVE'));
GO

ALTER TABLE seats ADD CONSTRAINT chk_seat_type CHECK (seat_type IN ('NORMAL', 'VIP', 'SLEEPER'));
GO


ALTER TABLE trips ADD CONSTRAINT chk_trip_status CHECK (status IN ('SCHEDULED', 'DEPARTED', 'COMPLETED', 'CANCELLED'));
GO

ALTER TABLE bookings ADD CONSTRAINT chk_booking_channel CHECK (channel IN ('ONLINE', 'COUNTER'));
GO
ALTER TABLE bookings ADD CONSTRAINT chk_booking_status CHECK (status IN ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED'));
GO

ALTER TABLE payments ADD CONSTRAINT chk_payment_method CHECK (method IN ('CASH', 'BANK_TRANSFER'));
GO
ALTER TABLE payments ADD CONSTRAINT chk_payment_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED'));
GO

ALTER TABLE tickets ADD CONSTRAINT chk_ticket_status CHECK (status IN ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED', 'CHECKED_IN'));
GO
ALTER TABLE tickets ADD CONSTRAINT chk_tickets_price CHECK (price >= 0);
GO

ALTER TABLE trips ADD CONSTRAINT chk_trips_time CHECK (arrival_time > departure_time);
GO
```

## File: 03_indexes.sql
```sql
-- indexes.sql
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

-- Bảng Users
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_email' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_email ON users(email);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_phone' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_phone ON users(phone);

-- Bảng Trips
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_route_id' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_route_id ON trips(route_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_departure_time' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_departure_time ON trips(departure_time);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_status' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_status ON trips(status);

-- Bảng Bookings & Tickets
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_bookings_customer_id' AND object_id = OBJECT_ID('bookings'))
    CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_bookings_code' AND object_id = OBJECT_ID('bookings'))
    CREATE INDEX idx_bookings_code ON bookings(booking_code);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tickets_booking_id' AND object_id = OBJECT_ID('tickets'))
    CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tickets_trip_id' AND object_id = OBJECT_ID('tickets'))
    CREATE INDEX idx_tickets_trip_id ON tickets(trip_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tickets_code' AND object_id = OBJECT_ID('tickets'))
    CREATE INDEX idx_tickets_code ON tickets(ticket_code);

-- Bảng Payments
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_payments_booking_id' AND object_id = OBJECT_ID('payments'))
    CREATE INDEX idx_payments_booking_id ON payments(booking_id);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'uq_payment_transaction_code' AND object_id = OBJECT_ID('payments'))
    CREATE UNIQUE NONCLUSTERED INDEX uq_payment_transaction_code ON payments(transaction_code) WHERE transaction_code IS NOT NULL;
GO


-- Bảng Seats
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_seats_bus_id' AND object_id = OBJECT_ID('seats'))
    CREATE INDEX idx_seats_bus_id ON seats(bus_id);
GO

-- Bảng Stations & Routes & Buses (Fleet & Route Management)
CREATE INDEX idx_stations_province_id ON stations(province_id);
GO
CREATE INDEX idx_routes_departure_station_id ON routes(departure_station_id);
CREATE INDEX idx_routes_arrival_station_id ON routes(arrival_station_id);
GO
CREATE INDEX idx_buses_type_id ON buses(type_id);
GO
CREATE INDEX idx_route_stations_route_id ON route_stations(route_id);
CREATE INDEX idx_route_stations_station_id ON route_stations(station_id);
GO

-- Concurrency & Business Indexes (GĐ1)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'uq_tickets_trip_seat_active' AND object_id = OBJECT_ID('tickets'))
    CREATE UNIQUE INDEX uq_tickets_trip_seat_active ON tickets(trip_id, seat_id) WHERE status IN ('PENDING', 'CONFIRMED');
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_bookings_pending_expired' AND object_id = OBJECT_ID('bookings'))
    CREATE INDEX idx_bookings_pending_expired ON bookings(expired_at) WHERE status = 'PENDING';
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_search' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_search ON trips(departure_time, status) INCLUDE (route_id, bus_id, price);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_bus_time' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_bus_time ON trips(bus_id, departure_time, arrival_time);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_trips_driver_time' AND object_id = OBJECT_ID('trips'))
    CREATE INDEX idx_trips_driver_time ON trips(driver_id, departure_time, arrival_time);
GO
```

## File: 04_functions.sql
```sql
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
```

## File: 05_transactions.sql
```sql
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

-- ==============================================================================
-- 05_transactions.sql
-- Kịch bản giao dịch (Transactions) & Xử lý đồng thời (Concurrency Control)
-- ==============================================================================

-- GIAO DỊCH 1: Tạo xe và tự động sinh danh sách ghế tương ứng (Atomic Bus Creation + Seat Generation)
-- Đảm bảo tính toàn vẹn Atomicity (ACID): Nếu tạo ghế thất bại, xe sẽ bị ROLLBACK hoàn toàn.
CREATE OR ALTER PROCEDURE dbo.sp_TaoXeVaTaoGhe
    @bus_id VARCHAR(50),
    @license_plate VARCHAR(20),
    @type_id VARCHAR(50),
    @status VARCHAR(20) = 'ACTIVE',
    @custom_seats NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- Validate đầu vào
    IF @bus_id IS NULL OR LTRIM(RTRIM(@bus_id)) = ''
        THROW 51001, N'Mã xe không được để trống', 1;
    IF @license_plate IS NULL OR LTRIM(RTRIM(@license_plate)) = ''
        THROW 51002, N'Biển số xe không được để trống', 1;
    IF @type_id IS NULL OR LTRIM(RTRIM(@type_id)) = ''
        THROW 51003, N'Loại xe không được để trống', 1;

    IF @status NOT IN ('ACTIVE', 'INACTIVE')
        THROW 51004, N'Trạng thái xe không hợp lệ (chỉ chấp nhận ACTIVE hoặc INACTIVE)', 1;

    DECLARE @total_seats INT;
    DECLARE @floors INT;
    DECLARE @type_name NVARCHAR(50);

    SELECT @total_seats = total_seats, @floors = floors, @type_name = name
    FROM bus_types
    WHERE type_id = @type_id;

    IF @total_seats IS NULL
        THROW 51005, N'Loại xe không tồn tại trong hệ thống', 1;

    IF EXISTS (SELECT 1 FROM buses WHERE bus_id = @bus_id)
        THROW 51006, N'Mã xe đã tồn tại', 1;

    IF EXISTS (SELECT 1 FROM buses WHERE license_plate = @license_plate)
        THROW 51007, N'Biển số xe đã được đăng ký', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Chèn bản ghi xe
        INSERT INTO buses (bus_id, license_plate, type_id, status)
        VALUES (@bus_id, @license_plate, @type_id, @status);

        -- 2. Sinh ghế
        IF @custom_seats IS NOT NULL AND ISJSON(@custom_seats) = 1
        BEGIN
            -- Tạo ghế từ danh sách tùy biến người dùng truyền vào (JSON array)
            INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id)
            SELECT 
                @bus_id + '-S' + RIGHT('00' + CAST(ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS VARCHAR(10)), 3),
                LTRIM(RTRIM(seat_number)),
                floor,
                COALESCE(seat_type, 'NORMAL'),
                @bus_id
            FROM OPENJSON(@custom_seats)
            WITH (
                seat_number VARCHAR(10) '$.seat_number',
                floor INT '$.floor',
                seat_type VARCHAR(20) '$.seat_type'
            );
        END
        ELSE
        BEGIN
            -- Tự động sinh sơ đồ ghế theo loại xe
            DECLARE @default_seat_type VARCHAR(20) = 'NORMAL';
            IF @type_name LIKE N'%Giường%' OR @type_name LIKE N'%Sleeper%'
                SET @default_seat_type = 'SLEEPER';
            ELSE IF @type_name LIKE N'%Limousine%'
                SET @default_seat_type = 'VIP';

            IF @floors <= 1
            BEGIN
                -- Xe 1 tầng: Đánh số A01..A{N} hoặc 01..{N}
                DECLARE @i INT = 1;
                WHILE @i <= @total_seats
                BEGIN
                    DECLARE @seat_num VARCHAR(10) = 'A' + RIGHT('0' + CAST(@i AS VARCHAR(10)), 2);
                    DECLARE @seat_id VARCHAR(50) = @bus_id + '-S' + RIGHT('00' + CAST(@i AS VARCHAR(10)), 3);
                    INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id)
                    VALUES (@seat_id, @seat_num, 1, @default_seat_type, @bus_id);
                    SET @i = @i + 1;
                END
            END
            ELSE
            BEGIN
                -- Xe 2 tầng (Ví dụ xe giường nằm):
                -- Tầng 1: A01..A{N/2}
                -- Tầng 2: B01..B{N/2}
                DECLARE @seats_f1 INT = CEILING(@total_seats / 2.0);
                DECLARE @idx INT = 1;

                -- Tầng 1
                WHILE @idx <= @seats_f1
                BEGIN
                    DECLARE @snum_f1 VARCHAR(10) = 'A' + RIGHT('0' + CAST(@idx AS VARCHAR(10)), 2);
                    DECLARE @sid_f1 VARCHAR(50) = @bus_id + '-S' + RIGHT('00' + CAST(@idx AS VARCHAR(10)), 3);
                    INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id)
                    VALUES (@sid_f1, @snum_f1, 1, @default_seat_type, @bus_id);
                    SET @idx = @idx + 1;
                END

                -- Tầng 2
                DECLARE @f2_count INT = 1;
                WHILE @idx <= @total_seats
                BEGIN
                    DECLARE @snum_f2 VARCHAR(10) = 'B' + RIGHT('0' + CAST(@f2_count AS VARCHAR(10)), 2);
                    DECLARE @sid_f2 VARCHAR(50) = @bus_id + '-S' + RIGHT('00' + CAST(@idx AS VARCHAR(10)), 3);
                    INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id)
                    VALUES (@sid_f2, @snum_f2, 2, @default_seat_type, @bus_id);
                    SET @f2_count = @f2_count + 1;
                    SET @idx = @idx + 1;
                END
            END
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- GIAO DỊCH 2: Tạo hoặc cập nhật tuyến đường kèm danh sách các trạm dừng (Atomic Route + Route Stations)
-- Đảm bảo toàn vẹn khi cập nhật lộ trình nhiều điểm dừng.
CREATE OR ALTER PROCEDURE dbo.sp_LuuTuyenVaTramDung
    @route_id VARCHAR(50),
    @departure_station_id VARCHAR(50),
    @arrival_station_id VARCHAR(50),
    @distance_km DECIMAL(10,2),
    @estimated_duration INT,
    @intermediate_stations NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @route_id IS NULL OR LTRIM(RTRIM(@route_id)) = ''
        THROW 52001, N'Mã tuyến đường không được để trống', 1;
    IF @departure_station_id = @arrival_station_id
        THROW 52002, N'Bến xuất phát và bến đến không được trùng nhau', 1;
    IF NOT EXISTS (SELECT 1 FROM stations WHERE station_id = @departure_station_id)
        THROW 52003, N'Bến xuất phát không tồn tại', 1;
    IF NOT EXISTS (SELECT 1 FROM stations WHERE station_id = @arrival_station_id)
        THROW 52004, N'Bến đến không tồn tại', 1;
    IF @distance_km <= 0 OR @estimated_duration <= 0
        THROW 52005, N'Khoảng cách và thời gian ước tính phải lớn hơn 0', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF EXISTS (SELECT 1 FROM routes WHERE route_id = @route_id)
        BEGIN
            UPDATE routes
            SET departure_station_id = @departure_station_id,
                arrival_station_id = @arrival_station_id,
                distance_km = @distance_km,
                estimated_duration = @estimated_duration
            WHERE route_id = @route_id;
        END
        ELSE
        BEGIN
            INSERT INTO routes (route_id, departure_station_id, arrival_station_id, distance_km, estimated_duration)
            VALUES (@route_id, @departure_station_id, @arrival_station_id, @distance_km, @estimated_duration);
        END

        -- Xóa trạm dừng cũ của tuyến
        DELETE FROM route_stations WHERE route_id = @route_id;

        -- Thêm lại các trạm dừng theo thứ tự nếu có
        IF @intermediate_stations IS NOT NULL AND ISJSON(@intermediate_stations) = 1
        BEGIN
            INSERT INTO route_stations (route_station_id, route_id, station_id, stop_order)
            SELECT 
                @route_id + '-RS-' + CAST(stop_order AS VARCHAR(10)),
                @route_id,
                LTRIM(RTRIM(station_id)),
                stop_order
            FROM OPENJSON(@intermediate_stations)
            WITH (
                station_id VARCHAR(50) '$.station_id',
                stop_order INT '$.stop_order'
            );
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
```

## File: 06_triggers.sql
```sql
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
```

## File: 07_permissions.sql
```sql
-- ==============================================================================
-- 07_permissions.sql
-- KỊCH BẢN PHÂN QUYỀN HỆ THỐNG ĐẶT VÉ XE KHÁCH (DATABASE ROLE-BASED ACCESS CONTROL)
-- ==============================================================================

-- 1. TẠO 5 DATABASE ROLES CỐT LÕI (NẾU CHƯA TỒN TẠI)
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_Admin' AND type = 'R')
BEGIN
    CREATE ROLE Role_Admin;
END
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_NhanVien' AND type = 'R')
BEGIN
    CREATE ROLE Role_NhanVien;
END
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_KhachHang' AND type = 'R')
BEGIN
    CREATE ROLE Role_KhachHang;
END
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_TaiXe' AND type = 'R')
BEGIN
    CREATE ROLE Role_TaiXe;
END
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_KeToan' AND type = 'R')
BEGIN
    CREATE ROLE Role_KeToan;
END
GO

-- 2. PHÂN QUYỀN Role_Admin (Toàn quyền quản trị cơ sở dữ liệu)
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE TO Role_Admin;
GO

-- 3. PHÂN QUYỀN Role_TaiXe (Tài xế - Nguyên tắc Đặc quyền Tối thiểu)
-- CẤM TUYỆT ĐỐI (DENY) thao tác trên các bảng Đặt vé, Vé và Thanh toán/Doanh thu
DENY SELECT, INSERT, UPDATE, DELETE ON bookings TO Role_TaiXe;
DENY SELECT, INSERT, UPDATE, DELETE ON tickets TO Role_TaiXe;
DENY SELECT, INSERT, UPDATE, DELETE ON payments TO Role_TaiXe;
GO

-- CẤP QUYỀN (GRANT) cho Tài xế: Chỉ xem dữ liệu danh mục cần thiết và View phân công
GRANT SELECT ON buses TO Role_TaiXe;
GRANT SELECT ON routes TO Role_TaiXe;
GRANT SELECT ON stations TO Role_TaiXe;
GRANT SELECT ON trips TO Role_TaiXe;
GO

IF OBJECT_ID('vw_LichPhanCongTaiXe', 'V') IS NOT NULL
BEGIN
    GRANT SELECT ON vw_LichPhanCongTaiXe TO Role_TaiXe;
END
GO

-- 4. PHÂN QUYỀN Role_NhanVien (Nhân viên bán vé và điều hành trạm)
GRANT SELECT, INSERT, UPDATE ON bookings TO Role_NhanVien;
GRANT SELECT, INSERT, UPDATE ON tickets TO Role_NhanVien;
GRANT SELECT ON trips TO Role_NhanVien;
GRANT SELECT ON buses TO Role_NhanVien;
GRANT SELECT ON routes TO Role_NhanVien;
GRANT SELECT ON stations TO Role_NhanVien;
GRANT SELECT ON seats TO Role_NhanVien;
GRANT SELECT, INSERT ON payments TO Role_NhanVien;
DENY DELETE ON bookings TO Role_NhanVien;
DENY DELETE ON tickets TO Role_NhanVien;
GO

-- 5. PHÂN QUYỀN Role_KhachHang (Khách hàng đặt vé và xem chuyến)
GRANT SELECT ON trips TO Role_KhachHang;
GRANT SELECT ON routes TO Role_KhachHang;
GRANT SELECT ON stations TO Role_KhachHang;
GRANT SELECT ON bus_types TO Role_KhachHang;
GRANT SELECT ON seats TO Role_KhachHang;
GRANT SELECT, INSERT ON bookings TO Role_KhachHang;
GRANT SELECT, INSERT ON tickets TO Role_KhachHang;
GRANT SELECT, INSERT ON payments TO Role_KhachHang;
DENY DELETE ON bookings TO Role_KhachHang;
DENY DELETE ON tickets TO Role_KhachHang;
GO

-- 6. PHÂN QUYỀN Role_KeToan (Kế toán tài chính & doanh thu)
GRANT SELECT ON payments TO Role_KeToan;
GRANT SELECT ON bookings TO Role_KeToan;
GRANT SELECT ON tickets TO Role_KeToan;
GRANT SELECT ON trips TO Role_KeToan;
DENY INSERT, UPDATE, DELETE ON trips TO Role_KeToan;
DENY INSERT, UPDATE, DELETE ON buses TO Role_KeToan;
DENY INSERT, UPDATE, DELETE ON routes TO Role_KeToan;
GO
```

## File: 08_stored_procedures.sql
```sql
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

-- 1. sp_GiuCho
CREATE OR ALTER PROCEDURE dbo.sp_GiuCho
    @booking_id VARCHAR(50) OUTPUT,
    @customer_id VARCHAR(50) = NULL,
    @trip_id VARCHAR(50),
    @passengers NVARCHAR(MAX),
    @channel VARCHAR(20) = 'ONLINE',
    @email VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- Validate channel
    IF @channel NOT IN ('ONLINE', 'COUNTER')
        THROW 50061, N'Dữ liệu đặt vé không hợp lệ', 1;

    -- Parse JSON hành khách
    IF @passengers IS NULL OR ISJSON(@passengers) <> 1
        THROW 50061, N'Dữ liệu đặt vé không hợp lệ', 1;

    DECLARE @P TABLE (seat_id VARCHAR(50), name NVARCHAR(100), phone VARCHAR(20));

    INSERT INTO @P (seat_id, name, phone)
    SELECT LTRIM(RTRIM(seat_id)), LTRIM(RTRIM(name)), LTRIM(RTRIM(phone))
    FROM OPENJSON(@passengers)
    WITH (seat_id VARCHAR(50) '$.seat_id', name NVARCHAR(100) '$.name', phone VARCHAR(20) '$.phone');

    DECLARE @SeatCount INT = (SELECT COUNT(*) FROM @P);
    DECLARE @DistinctCount INT = (SELECT COUNT(DISTINCT seat_id) FROM @P);

    IF @SeatCount < 1 OR @SeatCount > 5 OR @SeatCount <> @DistinctCount
        THROW 50061, N'Dữ liệu đặt vé không hợp lệ', 1;

    IF EXISTS (SELECT 1 FROM @P WHERE seat_id IS NULL OR seat_id = '' OR name IS NULL OR name = '' OR phone IS NULL OR phone = '')
        THROW 50061, N'Dữ liệu đặt vé không hợp lệ', 1;

    -- Kiểm tra ghế thuộc xe của chuyến
    DECLARE @BusId VARCHAR(50);
    SELECT @BusId = bus_id FROM trips WHERE trip_id = @trip_id;

    IF EXISTS (
        SELECT 1 FROM @P p
        WHERE NOT EXISTS (SELECT 1 FROM seats s WHERE s.seat_id = p.seat_id AND s.bus_id = @BusId)
    )
        THROW 50010, N'Chuyến hoặc ghế không tồn tại', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate chuyến đi và giữ khóa đến hết transaction
        IF NOT EXISTS (
            SELECT 1
            FROM trips t WITH (HOLDLOCK)
            JOIN buses b ON b.bus_id = t.bus_id
            WHERE t.trip_id = @trip_id AND t.status = 'SCHEDULED'
              AND t.departure_time > SYSDATETIME() AND b.status = 'ACTIVE'
        )
            THROW 50060, N'Chuyến đi không khả dụng', 1;

        -- Giải phóng ghế hết hạn của đúng các ghế đang xin (bookings -> tickets)
        DECLARE @Stale TABLE (booking_id VARCHAR(50));
        INSERT INTO @Stale (booking_id)
        SELECT DISTINCT b.booking_id
        FROM tickets t JOIN bookings b ON b.booking_id = t.booking_id
        WHERE t.trip_id = @trip_id AND t.seat_id IN (SELECT seat_id FROM @P)
          AND t.status = 'PENDING' AND b.status = 'PENDING' AND b.expired_at <= SYSDATETIME();

        UPDATE bookings SET status = 'EXPIRED'
        WHERE booking_id IN (SELECT booking_id FROM @Stale)
          AND status = 'PENDING' AND expired_at <= SYSDATETIME();

        UPDATE tickets SET status = 'EXPIRED'
        WHERE booking_id IN (SELECT booking_id FROM @Stale) AND status = 'PENDING';

        -- Khóa chống phantom và kiểm tra ghế bận
        IF EXISTS (
            SELECT 1 FROM tickets WITH (UPDLOCK, HOLDLOCK)
            WHERE trip_id = @trip_id AND seat_id IN (SELECT seat_id FROM @P)
              AND status IN ('PENDING', 'CONFIRMED')
        )
            THROW 50030, N'Ghế đã được giữ hoặc đã bán', 1;

        -- Kiểm tra và xác định khách hàng (Tài khoản thành viên hoặc Khách vãng lai)
        DECLARE @ContactPhone VARCHAR(20) = (SELECT TOP 1 phone FROM @P);
        DECLARE @ContactName NVARCHAR(100) = (SELECT TOP 1 name FROM @P);

        IF @customer_id IS NOT NULL
        BEGIN
            -- Nếu truyền customer_id, kiểm tra xem có tồn tại không
            IF NOT EXISTS (SELECT 1 FROM users WITH (HOLDLOCK) WHERE user_id = @customer_id)
            BEGIN
                -- Nếu customer_id không tồn tại (vd: token cũ / user bị xóa), tra cứu theo SĐT hành khách
                SELECT TOP 1 @customer_id = user_id FROM users WITH (UPDLOCK, HOLDLOCK) WHERE phone = @ContactPhone;
            END
        END

        -- Nếu chưa có hoặc chưa tìm thấy customer_id
        IF @customer_id IS NULL
        BEGIN
            -- Bước 1: Tra cứu theo SĐT hành khách trong bảng users
            SELECT TOP 1 @customer_id = user_id FROM users WITH (UPDLOCK, HOLDLOCK) WHERE phone = @ContactPhone;

            -- Bước 2: Nếu SĐT chưa từng xuất hiện trong hệ thống, tự động tạo tài khoản GUEST
            IF @customer_id IS NULL
            BEGIN
                DECLARE @GuestEmail VARCHAR(100) = @email;
                IF @GuestEmail IS NULL OR LTRIM(RTRIM(@GuestEmail)) = '' OR EXISTS (SELECT 1 FROM users WHERE email = @GuestEmail)
                BEGIN
                    SET @GuestEmail = @ContactPhone + '@guest.Daisy Booking.vn';
                    IF EXISTS (SELECT 1 FROM users WHERE email = @GuestEmail)
                    BEGIN
                        SET @GuestEmail = @ContactPhone + '_' + LOWER(SUBSTRING(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 1, 6)) + '@guest.Daisy Booking.vn';
                    END
                END

                SET @customer_id = 'USR-' + UPPER(SUBSTRING(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 1, 8));

                INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active)
                VALUES (@customer_id, @ContactName, @GuestEmail, @ContactPhone, NULL, 'GUEST', 0, 1);
            END
        END

        IF @customer_id IS NULL OR NOT EXISTS (SELECT 1 FROM users WHERE user_id = @customer_id)
            THROW 50062, N'Khách hàng không tồn tại', 1;

        -- Tính tổng tiền
        DECLARE @TotalAmount DECIMAL(12,2) = 0;
        SELECT @TotalAmount = SUM(dbo.fn_TinhGiaVe(@trip_id, seat_id)) FROM @P;
        IF @TotalAmount IS NULL THROW 50010, N'Chuyến hoặc ghế không tồn tại', 1;

        -- Sinh booking_id và booking_code
        SET @booking_id = 'BKG-' + UPPER(SUBSTRING(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 1, 8));

        DECLARE @booking_code VARCHAR(20);
        DECLARE @tries INT = 0;
        WHILE @tries < 5
        BEGIN
            SET @booking_code = UPPER(SUBSTRING(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 1, 8));
            IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_code = @booking_code) BREAK;
            SET @tries = @tries + 1;
        END

        IF @tries = 5
            THROW 50031, N'Tranh chấp giữ chỗ, vui lòng thử lại', 1;

        DECLARE @expired_at DATETIME2 = DATEADD(MINUTE, 15, SYSDATETIME());

        INSERT INTO bookings (booking_id, booking_code, customer_id, channel, created_at, expired_at, total_amount, status)
        VALUES (@booking_id, @booking_code, @customer_id, @channel, SYSDATETIME(), @expired_at, @TotalAmount, 'PENDING');

        INSERT INTO tickets (ticket_id, ticket_code, booking_id, trip_id, seat_id, passenger_name, passenger_phone, price, status)
        SELECT 
            'TCK-' + UPPER(SUBSTRING(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 1, 8)),
            UPPER(SUBSTRING(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 1, 8)),
            @booking_id, @trip_id, p.seat_id, p.name, p.phone,
            dbo.fn_TinhGiaVe(@trip_id, p.seat_id), 'PENDING'
        FROM @P p;

        COMMIT TRANSACTION;

        SELECT * FROM bookings WHERE booking_id = @booking_id;
        SELECT * FROM tickets WHERE booking_id = @booking_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        IF ERROR_NUMBER() IN (2601, 2627) AND (ERROR_MESSAGE() LIKE '%uq_tickets_trip_seat_active%' OR ERROR_MESSAGE() LIKE '%uq_user_phone%')
            THROW 50031, N'Tranh chấp giữ chỗ, vui lòng thử lại', 1;
        THROW;
    END CATCH
END;
GO
-- 2. sp_DatVe
CREATE OR ALTER PROCEDURE dbo.sp_DatVe
    @booking_id VARCHAR(50),
    @booking_code VARCHAR(20),
    @phone VARCHAR(20),
    @payment_method VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @trip_id VARCHAR(50);
        SELECT TOP 1 @trip_id = trip_id FROM tickets WHERE booking_id = @booking_id;

        IF @trip_id IS NULL
            THROW 50040, N'Booking không tồn tại hoặc thông tin xác thực không đúng', 1;

        IF NOT EXISTS (SELECT 1 FROM trips WITH (HOLDLOCK) WHERE trip_id = @trip_id)
            THROW 50040, N'Booking không tồn tại hoặc thông tin xác thực không đúng', 1;

        DECLARE @CurrentStatus VARCHAR(20), @ExpiredAt DATETIME2;
        SELECT @CurrentStatus = status, @ExpiredAt = expired_at
        FROM bookings WITH (UPDLOCK, HOLDLOCK)
        WHERE booking_id = @booking_id AND booking_code = @booking_code;

        IF @CurrentStatus IS NULL OR NOT EXISTS (
            SELECT 1 FROM tickets WHERE booking_id = @booking_id AND passenger_phone = @phone
        )
        BEGIN
            THROW 50040, N'Booking không tồn tại hoặc thông tin xác thực không đúng', 1;
        END

        IF @CurrentStatus <> 'PENDING'
        BEGIN
            THROW 50041, N'Trạng thái booking không hợp lệ', 1;
        END

        IF @ExpiredAt <= SYSDATETIME()
        BEGIN
            UPDATE bookings SET status = 'EXPIRED' WHERE booking_id = @booking_id;
            UPDATE tickets SET status = 'EXPIRED' WHERE booking_id = @booking_id AND status = 'PENDING';
            COMMIT TRANSACTION;
            THROW 50042, N'Đã hết hạn giữ chỗ', 1;
        END

        IF EXISTS (
            SELECT 1
            FROM tickets tk
            JOIN dbo.vw_ChiTietChuyenDi v ON v.trip_id = tk.trip_id
            WHERE tk.booking_id = @booking_id
              AND (v.status <> 'SCHEDULED' OR v.departure_time <= SYSDATETIME() OR v.bus_status <> 'ACTIVE')
        )
        BEGIN
            THROW 50060, N'Chuyến đi không khả dụng', 1;
        END

        UPDATE bookings SET status = 'CONFIRMED' WHERE booking_id = @booking_id;
        UPDATE tickets SET status = 'CONFIRMED' WHERE booking_id = @booking_id AND status = 'PENDING';

        IF @payment_method IS NOT NULL
        BEGIN
            IF @payment_method NOT IN ('CASH', 'BANK_TRANSFER')
                THROW 50061, N'Dữ liệu đặt vé không hợp lệ', 1;

            INSERT INTO payments (payment_id, booking_id, method, amount, paid_at, transaction_code, status)
            VALUES (
                'PAY-' + UPPER(SUBSTRING(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 1, 8)),
                @booking_id,
                @payment_method,
                (SELECT total_amount FROM bookings WHERE booking_id = @booking_id),
                NULL,
                NULL,
                'PENDING'
            );
        END

        COMMIT TRANSACTION;

        SELECT * FROM bookings WHERE booking_id = @booking_id;
        SELECT * FROM tickets WHERE booking_id = @booking_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 3. sp_HuyGiuCho
CREATE OR ALTER PROCEDURE dbo.sp_HuyGiuCho
    @booking_id VARCHAR(50),
    @booking_code VARCHAR(20),
    @phone VARCHAR(20),
    @ticket_id VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @CurrentStatus VARCHAR(20);
        SELECT @CurrentStatus = status
        FROM bookings WITH (UPDLOCK, HOLDLOCK)
        WHERE booking_id = @booking_id AND booking_code = @booking_code;

        IF @CurrentStatus IS NULL OR NOT EXISTS (
            SELECT 1 FROM tickets WHERE booking_id = @booking_id AND passenger_phone = @phone
        )
        BEGIN
            THROW 50040, N'Booking không tồn tại hoặc thông tin xác thực không đúng', 1;
        END

        IF @CurrentStatus <> 'PENDING'
        BEGIN
            THROW 50050, N'Không thể hủy booking không ở trạng thái giữ chỗ', 1;
        END

        IF @ticket_id IS NOT NULL
        BEGIN
            UPDATE tickets 
            SET status = 'CANCELLED' 
            WHERE ticket_id = @ticket_id AND booking_id = @booking_id AND status = 'PENDING';

            IF @@ROWCOUNT = 0
            BEGIN
                THROW 50050, N'Không thể hủy booking không ở trạng thái giữ chỗ', 1;
            END

            DECLARE @RemainingCount INT, @RemainingTotal DECIMAL(12,2);
            SELECT 
                @RemainingCount = COUNT(*),
                @RemainingTotal = ISNULL(SUM(price), 0)
            FROM tickets
            WHERE booking_id = @booking_id AND status IN ('PENDING', 'CONFIRMED');

            IF @RemainingCount = 0
            BEGIN
                UPDATE bookings SET status = 'CANCELLED', total_amount = 0 WHERE booking_id = @booking_id;
            END
            ELSE
            BEGIN
                UPDATE bookings SET total_amount = @RemainingTotal WHERE booking_id = @booking_id;
            END
        END
        ELSE
        BEGIN
            UPDATE bookings SET status = 'CANCELLED' WHERE booking_id = @booking_id;
            UPDATE tickets SET status = 'CANCELLED' WHERE booking_id = @booking_id AND status = 'PENDING';
        END

        COMMIT TRANSACTION;

        SELECT * FROM bookings WHERE booking_id = @booking_id;
        SELECT * FROM tickets WHERE booking_id = @booking_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 4. sp_GiaiPhongGheHetHan
CREATE OR ALTER PROCEDURE dbo.sp_GiaiPhongGheHetHan
    @batchSize INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Expired TABLE (booking_id VARCHAR(50));

        ;WITH oldest AS (
            SELECT TOP (@batchSize) booking_id, status
            FROM bookings WITH (UPDLOCK, READPAST)
            WHERE status = 'PENDING' AND expired_at <= SYSDATETIME()
            ORDER BY expired_at
        )
        UPDATE oldest SET status = 'EXPIRED'
        OUTPUT inserted.booking_id INTO @Expired;

        UPDATE t SET status = 'EXPIRED'
        FROM tickets t JOIN @Expired e ON e.booking_id = t.booking_id
        WHERE t.status = 'PENDING';

        COMMIT TRANSACTION;

        SELECT COUNT(*) AS released FROM @Expired;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 5. sp_TraCuuChuyenDi (tra cứu chuyến theo tỉnh đi/tỉnh đến/ngày, có phân trang)
CREATE OR ALTER PROCEDURE dbo.sp_TraCuuChuyenDi
    @fromProvinceId VARCHAR(50),
    @toProvinceId VARCHAR(50),
    @date VARCHAR(10),
    @offset INT = 0,
    @limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    -- Chặn tham số phân trang âm (server đã validate, nhưng SP phải tự bảo vệ)
    IF @offset < 0 SET @offset = 0;
    IF @limit < 1 SET @limit = 10;

    DECLARE @day DATE = TRY_CAST(@date AS DATE);
    IF @day IS NULL THROW 50061, N'Ngày tra cứu không hợp lệ', 1;

    WITH TripSeats AS (
        SELECT 
            v.trip_id,
            v.departure_time,
            v.arrival_time,
            v.price,
            v.bus_type,
            v.route_id,
            v.departure_station,
            v.arrival_station,
            v.departure_province,
            v.arrival_province,
            (
                (SELECT COUNT(*) FROM seats s WHERE s.bus_id = v.bus_id)
                - (SELECT COUNT(DISTINCT tk.seat_id)
                   FROM tickets tk JOIN bookings bk ON bk.booking_id = tk.booking_id
                   WHERE tk.trip_id = v.trip_id
                     AND (tk.status = 'CONFIRMED'
                          OR (tk.status = 'PENDING' AND bk.expired_at > SYSDATETIME())))
            ) AS availableSeats
        FROM dbo.vw_ChiTietChuyenDi v
        WHERE v.departure_province_id = @fromProvinceId
          AND v.arrival_province_id = @toProvinceId
          AND CAST(v.departure_time AS DATE) = @day
          AND v.status = 'SCHEDULED'
          AND v.departure_time > SYSDATETIME()
    )
    SELECT 
        trip_id, departure_time, arrival_time, price, bus_type,
        route_id, departure_station, arrival_station, departure_province, arrival_province,
        availableSeats,
        COUNT(*) OVER() AS totalCount
    FROM TripSeats
    WHERE availableSeats > 0
    ORDER BY departure_time ASC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
END;
GO

-- 6. sp_TaoChuyen
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO
CREATE OR ALTER PROCEDURE dbo.sp_TaoChuyen
    @route_id VARCHAR(50),
    @bus_id VARCHAR(50),
    @driver_id VARCHAR(50),
    @departure_time DATETIME2,
    @arrival_time DATETIME2,
    @price DECIMAL(12,2),
    @trip_id VARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM routes WHERE route_id = @route_id)
           OR NOT EXISTS (SELECT 1 FROM buses WHERE bus_id = @bus_id AND status = 'ACTIVE')
           OR NOT EXISTS (SELECT 1 FROM drivers WHERE driver_id = @driver_id)
           OR @price <= 0 OR @departure_time <= SYSDATETIME() OR @arrival_time <= @departure_time
            THROW 50061, N'Dữ liệu đặt vé không hợp lệ', 1;

        SET @trip_id = 'TRP-' + UPPER(SUBSTRING(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 1, 8));

        INSERT INTO trips (trip_id, route_id, bus_id, driver_id, departure_time, arrival_time, price, status)
        VALUES (@trip_id, @route_id, @bus_id, @driver_id, @departure_time, @arrival_time, @price, 'SCHEDULED');

        COMMIT TRANSACTION;
        SELECT * FROM trips WHERE trip_id = @trip_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 7. sp_HuyChuyen
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO
CREATE OR ALTER PROCEDURE dbo.sp_HuyChuyen
    @trip_id VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @status VARCHAR(20);
        SELECT @status = status FROM trips WITH (XLOCK, HOLDLOCK) WHERE trip_id = @trip_id;
        IF @status IS NULL THROW 50070, N'Chuyến không tồn tại', 1;
        IF @status <> 'SCHEDULED' THROW 50071, N'Trạng thái chuyến không cho phép thao tác', 1;

        UPDATE trips SET status = 'CANCELLED' WHERE trip_id = @trip_id;

        DECLARE @CancelledBookings TABLE (booking_id VARCHAR(50));
        INSERT INTO @CancelledBookings (booking_id)
        SELECT DISTINCT booking_id FROM tickets
        WHERE trip_id = @trip_id AND status IN ('PENDING', 'CONFIRMED');

        UPDATE bookings SET status = 'CANCELLED'
        WHERE booking_id IN (SELECT booking_id FROM @CancelledBookings)
          AND status IN ('PENDING', 'CONFIRMED');
        DECLARE @bookingCount INT = @@ROWCOUNT;

        UPDATE tickets SET status = 'CANCELLED'
        WHERE trip_id = @trip_id AND status IN ('PENDING', 'CONFIRMED');
        DECLARE @ticketCount INT = @@ROWCOUNT;

        COMMIT TRANSACTION;
        SELECT @bookingCount AS cancelled_bookings, @ticketCount AS cancelled_tickets;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 8. sp_SuaChuyen
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO
CREATE OR ALTER PROCEDURE dbo.sp_SuaChuyen
    @trip_id VARCHAR(50),
    @bus_id VARCHAR(50) = NULL,
    @driver_id VARCHAR(50) = NULL,
    @departure_time DATETIME2 = NULL,
    @arrival_time DATETIME2 = NULL,
    @price DECIMAL(12,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @currentBusId VARCHAR(50), @currentDriverId VARCHAR(50), @currentDepartureTime DATETIME2,
                @currentArrivalTime DATETIME2, @currentPrice DECIMAL(12,2), @status VARCHAR(20);
        SELECT @currentBusId = bus_id, @currentDriverId = driver_id, @currentDepartureTime = departure_time,
               @currentArrivalTime = arrival_time, @currentPrice = price, @status = status
        FROM trips WITH (XLOCK, HOLDLOCK) WHERE trip_id = @trip_id;

        IF @status IS NULL THROW 50070, N'Chuyến không tồn tại', 1;
        IF @status <> 'SCHEDULED' THROW 50071, N'Trạng thái chuyến không cho phép thao tác', 1;

        DECLARE @newBusId VARCHAR(50) = COALESCE(@bus_id, @currentBusId);
        DECLARE @newDriverId VARCHAR(50) = COALESCE(@driver_id, @currentDriverId);
        DECLARE @newDepartureTime DATETIME2 = COALESCE(@departure_time, @currentDepartureTime);
        DECLARE @newArrivalTime DATETIME2 = COALESCE(@arrival_time, @currentArrivalTime);
        DECLARE @newPrice DECIMAL(12,2) = COALESCE(@price, @currentPrice);

        IF @newBusId <> @currentBusId OR @newDepartureTime <> @currentDepartureTime OR @newArrivalTime <> @currentArrivalTime
        BEGIN
            DECLARE @ExpiredBookings TABLE (booking_id VARCHAR(50));
            INSERT INTO @ExpiredBookings (booking_id)
            SELECT DISTINCT b.booking_id
            FROM bookings b JOIN tickets t ON t.booking_id = b.booking_id
            WHERE t.trip_id = @trip_id AND t.status = 'PENDING'
              AND b.status = 'PENDING' AND b.expired_at <= SYSDATETIME();

            UPDATE bookings SET status = 'EXPIRED'
            WHERE booking_id IN (SELECT booking_id FROM @ExpiredBookings)
              AND status = 'PENDING' AND expired_at <= SYSDATETIME();

            UPDATE tickets SET status = 'EXPIRED'
            WHERE booking_id IN (SELECT booking_id FROM @ExpiredBookings) AND status = 'PENDING';

            IF EXISTS (SELECT 1 FROM tickets WHERE trip_id = @trip_id AND status IN ('PENDING', 'CONFIRMED'))
                THROW 50072, N'Chuyến đã có vé, không đổi xe/giờ được', 1;
        END

        IF NOT EXISTS (SELECT 1 FROM buses WHERE bus_id = @newBusId AND status = 'ACTIVE')
           OR NOT EXISTS (SELECT 1 FROM drivers WHERE driver_id = @newDriverId)
           OR @newPrice <= 0 OR @newArrivalTime <= @newDepartureTime
           OR ((@departure_time IS NOT NULL OR @arrival_time IS NOT NULL) AND @newDepartureTime <= SYSDATETIME())
            THROW 50061, N'Dữ liệu đặt vé không hợp lệ', 1;

        UPDATE trips
        SET bus_id = @newBusId, driver_id = @newDriverId, departure_time = @newDepartureTime,
            arrival_time = @newArrivalTime, price = @newPrice
        WHERE trip_id = @trip_id;

        COMMIT TRANSACTION;
        SELECT * FROM trips WHERE trip_id = @trip_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 9. sp_DoiTrangThaiChuyen
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO
CREATE OR ALTER PROCEDURE dbo.sp_DoiTrangThaiChuyen
    @trip_id VARCHAR(50),
    @new_status VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @status VARCHAR(20);
        SELECT @status = status FROM trips WITH (XLOCK, HOLDLOCK) WHERE trip_id = @trip_id;
        IF @status IS NULL THROW 50070, N'Chuyến không tồn tại', 1;
        IF NOT ((@status = 'SCHEDULED' AND @new_status = 'DEPARTED')
             OR (@status = 'DEPARTED' AND @new_status = 'COMPLETED'))
            THROW 50071, N'Trạng thái chuyến không cho phép thao tác', 1;

        UPDATE trips SET status = @new_status WHERE trip_id = @trip_id;

        IF @new_status = 'DEPARTED'
        BEGIN
            DECLARE @ExpiredBookings TABLE (booking_id VARCHAR(50));
            INSERT INTO @ExpiredBookings (booking_id)
            SELECT DISTINCT booking_id FROM tickets WHERE trip_id = @trip_id AND status = 'PENDING';

            UPDATE bookings SET status = 'EXPIRED'
            WHERE booking_id IN (SELECT booking_id FROM @ExpiredBookings) AND status = 'PENDING';

            UPDATE tickets SET status = 'EXPIRED'
            WHERE booking_id IN (SELECT booking_id FROM @ExpiredBookings) AND status = 'PENDING';
        END

        COMMIT TRANSACTION;
        SELECT * FROM trips WHERE trip_id = @trip_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 10. sp_CheckIn
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO
CREATE OR ALTER PROCEDURE dbo.sp_CheckIn
    @ticket_code VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @trip_id VARCHAR(50);
        SELECT @trip_id = trip_id FROM tickets WHERE ticket_code = @ticket_code;
        IF @trip_id IS NULL THROW 50074, N'Vé không tồn tại', 1;

        IF NOT EXISTS (SELECT 1 FROM trips WITH (HOLDLOCK) WHERE trip_id = @trip_id AND status = 'SCHEDULED')
            THROW 50073, N'Vé không check-in được', 1;

        UPDATE tickets SET status = 'CHECKED_IN'
        WHERE ticket_code = @ticket_code AND status = 'CONFIRMED';
        IF @@ROWCOUNT = 0 THROW 50073, N'Vé không check-in được', 1;

        COMMIT TRANSACTION;
        SELECT t.ticket_id, t.ticket_code, t.seat_id, t.passenger_name, t.passenger_phone, t.status
        FROM tickets t WHERE t.ticket_code = @ticket_code;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ==============================================================================
-- FLEET, ROUTE & STATION MANAGEMENT STORED PROCEDURES
-- ==============================================================================

-- 11. sp_LayChiTietXe
CREATE OR ALTER PROCEDURE dbo.sp_LayChiTietXe
    @bus_id VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        b.bus_id,
        b.license_plate,
        b.type_id,
        bt.name AS bus_type_name,
        bt.total_seats,
        bt.floors,
        b.status
    FROM buses b
    JOIN bus_types bt ON bt.type_id = b.type_id
    WHERE b.bus_id = @bus_id;

    -- Trả về danh sách ghế của xe
    SELECT 
        s.seat_id,
        s.seat_number,
        s.floor,
        s.seat_type,
        s.bus_id
    FROM seats s
    WHERE s.bus_id = @bus_id
    ORDER BY s.floor ASC, s.seat_number ASC;
END;
GO

-- 12. sp_SuaXe
CREATE OR ALTER PROCEDURE dbo.sp_SuaXe
    @bus_id VARCHAR(50),
    @license_plate VARCHAR(20),
    @type_id VARCHAR(50),
    @status VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM buses WHERE bus_id = @bus_id)
        THROW 51010, N'Xe không tồn tại', 1;

    IF @license_plate IS NULL OR LTRIM(RTRIM(@license_plate)) = ''
        THROW 51011, N'Biển số xe không được để trống', 1;

    IF EXISTS (SELECT 1 FROM buses WHERE license_plate = @license_plate AND bus_id <> @bus_id)
        THROW 51012, N'Biển số xe đã được dùng bởi xe khác', 1;

    IF NOT EXISTS (SELECT 1 FROM bus_types WHERE type_id = @type_id)
        THROW 51013, N'Loại xe không tồn tại', 1;

    IF @status NOT IN ('ACTIVE', 'INACTIVE')
        THROW 51014, N'Trạng thái không hợp lệ', 1;

    UPDATE buses
    SET license_plate = @license_plate,
        type_id = @type_id,
        status = @status
    WHERE bus_id = @bus_id;

    SELECT b.bus_id, b.license_plate, b.type_id, b.status
    FROM buses b WHERE b.bus_id = @bus_id;
END;
GO

-- 13. sp_DoiTrangThaiXe
CREATE OR ALTER PROCEDURE dbo.sp_DoiTrangThaiXe
    @bus_id VARCHAR(50),
    @status VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM buses WHERE bus_id = @bus_id)
        THROW 51010, N'Xe không tồn tại', 1;

    IF @status NOT IN ('ACTIVE', 'INACTIVE')
        THROW 51014, N'Trạng thái không hợp lệ', 1;

    UPDATE buses
    SET status = @status
    WHERE bus_id = @bus_id;

    SELECT b.bus_id, b.license_plate, b.type_id, b.status
    FROM buses b WHERE b.bus_id = @bus_id;
END;
GO

-- 14. sp_XoaXe
CREATE OR ALTER PROCEDURE dbo.sp_XoaXe
    @bus_id VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS (SELECT 1 FROM buses WHERE bus_id = @bus_id)
        THROW 51010, N'Xe không tồn tại', 1;

    -- Kiểm tra xe có chuyến đi sắp tới không
    IF EXISTS (
        SELECT 1 FROM trips 
        WHERE bus_id = @bus_id AND departure_time > SYSDATETIME() AND status <> 'CANCELLED'
    )
        THROW 51015, N'Không thể xóa xe đang có chuyến đi chưa hoàn thành', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Nếu xe có chuyến đi cũ trong lịch sử, đổi trạng thái sang INACTIVE để bảo toàn toàn vẹn dữ liệu
        IF EXISTS (SELECT 1 FROM trips WHERE bus_id = @bus_id)
        BEGIN
            UPDATE buses SET status = 'INACTIVE' WHERE bus_id = @bus_id;
        END
        ELSE
        BEGIN
            -- Nếu chưa từng chạy chuyến nào, xóa ghế và xóa xe
            DELETE FROM seats WHERE bus_id = @bus_id;
            DELETE FROM buses WHERE bus_id = @bus_id;
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 15. sp_TaoLoaiXe
CREATE OR ALTER PROCEDURE dbo.sp_TaoLoaiXe
    @type_id VARCHAR(50),
    @name NVARCHAR(50),
    @total_seats INT,
    @floors INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @type_id IS NULL OR LTRIM(RTRIM(@type_id)) = ''
        THROW 51020, N'Mã loại xe không được để trống', 1;
    IF @name IS NULL OR LTRIM(RTRIM(@name)) = ''
        THROW 51021, N'Tên loại xe không được để trống', 1;
    IF @total_seats <= 0 OR @total_seats > 100
        THROW 51022, N'Số ghế phải từ 1 đến 100', 1;
    IF @floors NOT IN (1, 2)
        THROW 51023, N'Số tầng phải là 1 hoặc 2', 1;

    IF EXISTS (SELECT 1 FROM bus_types WHERE type_id = @type_id)
        THROW 51024, N'Mã loại xe đã tồn tại', 1;

    INSERT INTO bus_types (type_id, name, total_seats, floors)
    VALUES (@type_id, @name, @total_seats, @floors);

    SELECT type_id, name, total_seats, floors
    FROM bus_types WHERE type_id = @type_id;
END;
GO

-- 16. sp_SuaLoaiXe
CREATE OR ALTER PROCEDURE dbo.sp_SuaLoaiXe
    @type_id VARCHAR(50),
    @name NVARCHAR(50),
    @total_seats INT,
    @floors INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM bus_types WHERE type_id = @type_id)
        THROW 51025, N'Loại xe không tồn tại', 1;
    IF @name IS NULL OR LTRIM(RTRIM(@name)) = ''
        THROW 51021, N'Tên loại xe không được để trống', 1;
    IF @total_seats <= 0 OR @total_seats > 100
        THROW 51022, N'Số ghế phải từ 1 đến 100', 1;
    IF @floors NOT IN (1, 2)
        THROW 51023, N'Số tầng phải là 1 hoặc 2', 1;

    UPDATE bus_types
    SET name = @name,
        total_seats = @total_seats,
        floors = @floors
    WHERE type_id = @type_id;

    SELECT type_id, name, total_seats, floors
    FROM bus_types WHERE type_id = @type_id;
END;
GO

-- 17. sp_XoaLoaiXe
CREATE OR ALTER PROCEDURE dbo.sp_XoaLoaiXe
    @type_id VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM bus_types WHERE type_id = @type_id)
        THROW 51025, N'Loại xe không tồn tại', 1;

    IF EXISTS (SELECT 1 FROM buses WHERE type_id = @type_id)
        THROW 51026, N'Không thể xóa loại xe đang được gắn với xe', 1;

    DELETE FROM bus_types WHERE type_id = @type_id;
END;
GO

-- 18. sp_TaoTram
CREATE OR ALTER PROCEDURE dbo.sp_TaoTram
    @station_id VARCHAR(50),
    @name NVARCHAR(100),
    @province_id VARCHAR(50),
    @address NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF @station_id IS NULL OR LTRIM(RTRIM(@station_id)) = ''
        THROW 51030, N'Mã bến xe không được để trống', 1;
    IF @name IS NULL OR LTRIM(RTRIM(@name)) = ''
        THROW 51031, N'Tên bến xe không được để trống', 1;
    IF NOT EXISTS (SELECT 1 FROM provinces WHERE province_id = @province_id)
        THROW 51032, N'Tỉnh/thành phố không tồn tại', 1;
    IF @address IS NULL OR LTRIM(RTRIM(@address)) = ''
        THROW 51033, N'Địa chỉ bến xe không được để trống', 1;

    IF EXISTS (SELECT 1 FROM stations WHERE station_id = @station_id)
        THROW 51034, N'Mã bến xe đã tồn tại', 1;

    INSERT INTO stations (station_id, name, province_id, address)
    VALUES (@station_id, @name, @province_id, @address);

    SELECT s.station_id, s.name, s.province_id, p.name AS province_name, s.address
    FROM stations s
    JOIN provinces p ON p.province_id = s.province_id
    WHERE s.station_id = @station_id;
END;
GO

-- 19. sp_SuaTram
CREATE OR ALTER PROCEDURE dbo.sp_SuaTram
    @station_id VARCHAR(50),
    @name NVARCHAR(100),
    @province_id VARCHAR(50),
    @address NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM stations WHERE station_id = @station_id)
        THROW 51035, N'Bến xe không tồn tại', 1;
    IF @name IS NULL OR LTRIM(RTRIM(@name)) = ''
        THROW 51031, N'Tên bến xe không được để trống', 1;
    IF NOT EXISTS (SELECT 1 FROM provinces WHERE province_id = @province_id)
        THROW 51032, N'Tỉnh/thành phố không tồn tại', 1;
    IF @address IS NULL OR LTRIM(RTRIM(@address)) = ''
        THROW 51033, N'Địa chỉ bến xe không được để trống', 1;

    UPDATE stations
    SET name = @name,
        province_id = @province_id,
        address = @address
    WHERE station_id = @station_id;

    SELECT s.station_id, s.name, s.province_id, p.name AS province_name, s.address
    FROM stations s
    JOIN provinces p ON p.province_id = s.province_id
    WHERE s.station_id = @station_id;
END;
GO

-- 20. sp_XoaTram
CREATE OR ALTER PROCEDURE dbo.sp_XoaTram
    @station_id VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM stations WHERE station_id = @station_id)
        THROW 51035, N'Bến xe không tồn tại', 1;

    IF EXISTS (SELECT 1 FROM routes WHERE departure_station_id = @station_id OR arrival_station_id = @station_id)
        THROW 51036, N'Không thể xóa bến xe đang được gán vào tuyến đường', 1;

    IF EXISTS (SELECT 1 FROM route_stations WHERE station_id = @station_id)
        THROW 51037, N'Không thể xóa bến xe đang là trạm dừng trung gian', 1;

    DELETE FROM stations WHERE station_id = @station_id;
END;
GO

-- 21. sp_LayChiTietTuyen
CREATE OR ALTER PROCEDURE dbo.sp_LayChiTietTuyen
    @route_id VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Thông tin cơ bản tuyến
    SELECT 
        r.route_id,
        r.departure_station_id,
        ds.name AS departure_station_name,
        dp.province_id AS departure_province_id,
        dp.name AS departure_province,
        r.arrival_station_id,
        ast.name AS arrival_station_name,
        ap.province_id AS arrival_province_id,
        ap.name AS arrival_province,
        r.distance_km,
        r.estimated_duration
    FROM routes r
    JOIN stations ds ON ds.station_id = r.departure_station_id
    JOIN provinces dp ON dp.province_id = ds.province_id
    JOIN stations ast ON ast.station_id = r.arrival_station_id
    JOIN provinces ap ON ap.province_id = ast.province_id
    WHERE r.route_id = @route_id;

    -- Danh sách các điểm dừng (ordered stops: bao gồm cả bến khởi hành, các điểm trung gian và bến đến)
    SELECT 
        rs.route_station_id,
        rs.route_id,
        rs.station_id,
        s.name AS station_name,
        s.address,
        p.name AS province_name,
        rs.stop_order
    FROM route_stations rs
    JOIN stations s ON s.station_id = rs.station_id
    JOIN provinces p ON p.province_id = s.province_id
    WHERE rs.route_id = @route_id
    ORDER BY rs.stop_order ASC;
END;
GO

-- 22. sp_XoaTuyen
CREATE OR ALTER PROCEDURE dbo.sp_XoaTuyen
    @route_id VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS (SELECT 1 FROM routes WHERE route_id = @route_id)
        THROW 51040, N'Tuyến đường không tồn tại', 1;

    IF EXISTS (SELECT 1 FROM trips WHERE route_id = @route_id)
        THROW 51041, N'Không thể xóa tuyến đường đã có chuyến đi', 1;

    BEGIN TRY
        BEGIN TRANSACTION;
        DELETE FROM route_stations WHERE route_id = @route_id;
        DELETE FROM routes WHERE route_id = @route_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 23. sp_LaySoDoGheXe
CREATE OR ALTER PROCEDURE dbo.sp_LaySoDoGheXe
    @bus_id VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM buses WHERE bus_id = @bus_id)
        THROW 51010, N'Xe không tồn tại', 1;

    SELECT 
        s.seat_id,
        s.seat_number,
        s.floor,
        s.seat_type,
        s.bus_id
    FROM seats s
    WHERE s.bus_id = @bus_id
    ORDER BY s.floor ASC, s.seat_number ASC;
END;
GO
```

## File: 09_views.sql
```sql
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

-- 1. vw_ChiTietChuyenDi (chi tiết chuyến: tuyến, trạm, tỉnh, loại xe, trạng thái xe)
CREATE OR ALTER VIEW dbo.vw_ChiTietChuyenDi
AS
    SELECT
        t.trip_id,
        t.departure_time,
        t.arrival_time,
        t.price,
        t.status,
        t.bus_id,
        t.driver_id,
        t.route_id,
        ds.name AS departure_station,
        ast.name AS arrival_station,
        dp.province_id AS departure_province_id,
        ap.province_id AS arrival_province_id,
        dp.name AS departure_province,
        ap.name AS arrival_province,
        bt.name AS bus_type,
        b.status AS bus_status
    FROM trips t
    JOIN routes r ON r.route_id = t.route_id
    JOIN buses b ON b.bus_id = t.bus_id
    JOIN bus_types bt ON bt.type_id = b.type_id
    JOIN stations ds ON ds.station_id = r.departure_station_id
    JOIN stations ast ON ast.station_id = r.arrival_station_id
    JOIN provinces dp ON dp.province_id = ds.province_id
    JOIN provinces ap ON ap.province_id = ast.province_id;
GO

-- 2. vw_ChiTietVe (chi tiết vé: ghế, chuyến, booking)
CREATE OR ALTER VIEW dbo.vw_ChiTietVe
AS
    SELECT
        tk.ticket_id,
        tk.ticket_code,
        s.seat_number,
        tk.price,
        tk.status,
        tk.passenger_name,
        tk.passenger_phone,
        bk.booking_code,
        bk.expired_at,
        t.departure_time
    FROM tickets tk
    JOIN bookings bk ON bk.booking_id = tk.booking_id
    JOIN seats s ON s.seat_id = tk.seat_id
    JOIN trips t ON t.trip_id = tk.trip_id;
GO

-- 3. vw_LichPhanCongTaiXe (Lịch phân công tài xế)
CREATE OR ALTER VIEW dbo.vw_LichPhanCongTaiXe
AS
SELECT 
    t.trip_id AS trip_id,
    t.driver_id AS driver_id,
    u.user_id AS user_id,
    u.full_name AS driver_name,
    u.phone AS driver_phone,
    d.license_number AS license_number,
    t.departure_time AS departure_time,
    t.arrival_time AS arrival_time,
    t.status AS trip_status,
    r.route_id AS route_id,
    s_dep.name AS departure_station,
    s_arr.name AS arrival_station,
    r.distance_km AS distance_km,
    b.license_plate AS license_plate,
    bt.name AS bus_type,
    bt.total_seats AS total_seats
FROM trips t
INNER JOIN drivers d ON t.driver_id = d.driver_id
INNER JOIN users u ON d.user_id = u.user_id
INNER JOIN routes r ON t.route_id = r.route_id
INNER JOIN stations s_dep ON r.departure_station_id = s_dep.station_id
INNER JOIN stations s_arr ON r.arrival_station_id = s_arr.station_id
INNER JOIN buses b ON t.bus_id = b.bus_id
INNER JOIN bus_types bt ON b.type_id = bt.type_id;
GO

-- Cấp quyền truy cập View cho Role_TaiXe và Role_NhanVien nếu Role đã tồn tại
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_TaiXe' AND type = 'R')
BEGIN
    GRANT SELECT ON dbo.vw_LichPhanCongTaiXe TO Role_TaiXe;
END
GO

IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Role_NhanVien' AND type = 'R')
BEGIN
    GRANT SELECT ON dbo.vw_LichPhanCongTaiXe TO Role_NhanVien;
END
GO

-- ==============================================================================
-- 4. vw_RouteList (Danh sách tuyến đường)
-- ==============================================================================
CREATE OR ALTER VIEW dbo.vw_RouteList
AS
    SELECT
        r.route_id,
        r.departure_station_id,
        ds.name AS departure_station_name,
        dp.province_id AS departure_province_id,
        dp.name AS departure_province,
        r.arrival_station_id,
        ast.name AS arrival_station_name,
        ap.province_id AS arrival_province_id,
        ap.name AS arrival_province,
        r.distance_km,
        r.estimated_duration
    FROM routes r
    JOIN stations ds ON ds.station_id = r.departure_station_id
    JOIN provinces dp ON dp.province_id = ds.province_id
    JOIN stations ast ON ast.station_id = r.arrival_station_id
    JOIN provinces ap ON ap.province_id = ast.province_id;
GO

-- ==============================================================================
-- 5. vw_BusList (Danh sách phương tiện)
-- ==============================================================================
CREATE OR ALTER VIEW dbo.vw_BusList
AS
    SELECT
        b.bus_id,
        b.license_plate,
        b.type_id,
        bt.name AS bus_type_name,
        bt.total_seats,
        bt.floors,
        b.status
    FROM buses b
    JOIN bus_types bt ON bt.type_id = b.type_id;
GO

-- ==============================================================================
-- 6. vw_RouteStations (Điểm dừng của tuyến đường theo thứ tự)
-- ==============================================================================
CREATE OR ALTER VIEW dbo.vw_RouteStations
AS
    SELECT
        rs.route_station_id,
        rs.route_id,
        rs.station_id,
        s.name AS station_name,
        s.address AS station_address,
        p.province_id,
        p.name AS province_name,
        rs.stop_order
    FROM route_stations rs
    JOIN stations s ON s.station_id = rs.station_id
    JOIN provinces p ON p.province_id = s.province_id;
GO

-- ==============================================================================
-- 7. vw_StationList (Danh sách bến xe kèm tỉnh/thành)
-- ==============================================================================
CREATE OR ALTER VIEW dbo.vw_StationList
AS
    SELECT
        s.station_id,
        s.name AS station_name,
        s.province_id,
        p.name AS province_name,
        s.address
    FROM stations s
    JOIN provinces p ON p.province_id = s.province_id;
GO
```

## File: 10_seed_data.sql
```sql
-- 10_seed_data.sql

-- Provinces
SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO

INSERT INTO provinces (province_id, name) VALUES 
('PRV-01', N'Hà Nội'),
('PRV-02', N'Hồ Chí Minh'),
('PRV-03', N'Đà Nẵng'),
('PRV-04', N'Lâm Đồng'),
('PRV-05', N'Ninh Bình'),
('PRV-06', N'Hải Phòng'),
('PRV-07', N'Khánh Hòa');
GO

-- Bus Types
INSERT INTO bus_types (type_id, name, total_seats, floors) VALUES 
('BT-01', N'Xe Giường Nằm 34', 34, 2),
('BT-02', N'Xe Limousine 22', 22, 1),
('BT-03', N'Xe Ghế Ngồi 45', 45, 1);
GO

-- Users (Admin, Customer, Guest)
INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active) VALUES 
('USR-ADMIN-1', N'System Administrator', 'admin@example.com', '0901234567', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'ADMIN', 0, 1),
('USR-CUS-1', N'Nguyễn Văn A', 'nva@example.com', '0988000111', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'CUSTOMER', 150, 1),
('USR-GUEST-1', N'Khách Vãng Lai B', 'guestb@example.com', '0933222333', NULL, 'GUEST', 0, 1);
GO

-- Stations
INSERT INTO stations (station_id, name, province_id, address) VALUES 
('STA-01', N'Bến xe Miền Đông', 'PRV-02', N'292 Đinh Bộ Lĩnh, Bình Thạnh, TP. Hồ Chí Minh'),
('STA-02', N'Bến xe Liên Tỉnh Đà Lạt', 'PRV-04', N'Số 1 Tô Hiến Thành, Phường 3, TP. Đà Lạt, Lâm Đồng'),
('STA-03', N'Bến xe Mỹ Đình', 'PRV-01', N'Số 20 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm, Hà Nội'),
('STA-04', N'Bến xe Giáp Bát', 'PRV-01', N'Km 6 Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội'),
('STA-05', N'Bến xe Ninh Bình', 'PRV-05', N'Đường Lê Thái Tổ, Phường Nam Thành, TP. Ninh Bình'),
('STA-06', N'Bến xe Trung tâm Đà Nẵng', 'PRV-03', N'185 Tôn Đức Thắng, Hòa Minh, Liên Chiểu, Đà Nẵng'),
('STA-07', N'Bến xe Miền Tây', 'PRV-02', N'395 Kinh Dương Vương, An Lạc, Bình Tân, TP. Hồ Chí Minh'),
('STA-08', N'Trạm Dừng Chân Madagui', 'PRV-04', N'Km 152 Quốc Lộ 20, Đạ Huoai, Lâm Đồng'),
('STA-09', N'Trạm Dừng Chân Bảo Lộc', 'PRV-04', N'280 Trần Phú, Lộc Sơn, TP. Bảo Lộc, Lâm Đồng'),
('STA-10', N'Trạm Dừng Phủ Lý', 'PRV-01', N'Quốc Lộ 1A, TP. Phủ Lý, Hà Nam');
GO

-- Routes
INSERT INTO routes (route_id, departure_station_id, arrival_station_id, distance_km, estimated_duration) VALUES 
('RT-SGN-DLI', 'STA-01', 'STA-02', 300.5, 480),
('RT-HAN-NBI', 'STA-04', 'STA-05', 95.0, 90),
('RT-HAN-DAN', 'STA-03', 'STA-06', 760.0, 840),
('RT-SGN-DAN', 'STA-01', 'STA-06', 960.0, 1080);
GO

-- Intermediate Route Stations (Ordered stops)
INSERT INTO route_stations (route_station_id, route_id, station_id, stop_order) VALUES 
('RS-SGN-DLI-1', 'RT-SGN-DLI', 'STA-01', 1),
('RS-SGN-DLI-2', 'RT-SGN-DLI', 'STA-08', 2),
('RS-SGN-DLI-3', 'RT-SGN-DLI', 'STA-09', 3),
('RS-SGN-DLI-4', 'RT-SGN-DLI', 'STA-02', 4),
('RS-HAN-NBI-1', 'RT-HAN-NBI', 'STA-04', 1),
('RS-HAN-NBI-2', 'RT-HAN-NBI', 'STA-10', 2),
('RS-HAN-NBI-3', 'RT-HAN-NBI', 'STA-05', 3),
('RS-HAN-DAN-1', 'RT-HAN-DAN', 'STA-03', 1),
('RS-HAN-DAN-2', 'RT-HAN-DAN', 'STA-06', 2);
GO

-- Users (Drivers)
INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active) VALUES 
('USR-DRV-1', N'Tài xế Nguyễn Văn Một', 'driver1@example.com', '0911000001', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'DRIVER', 0, 1),
('USR-DRV-2', N'Tài xế Trần Văn Hai', 'driver2@example.com', '0911000002', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'DRIVER', 0, 1);
GO

-- Drivers
INSERT INTO drivers (driver_id, user_id, license_number, license_expiry) VALUES 
('DRV-01', 'USR-DRV-1', 'B2-12345678', '2030-12-31'),
('DRV-02', 'USR-DRV-2', 'D-87654321', '2030-12-31');
GO

-- Buses
INSERT INTO buses (bus_id, license_plate, type_id, status) VALUES 
('BUS-01', '51B-12345', 'BT-01', 'ACTIVE'),
('BUS-02', '51B-67890', 'BT-02', 'ACTIVE'),
('BUS-03', '29B-888.12', 'BT-02', 'ACTIVE'),
('BUS-04', '29B-999.88', 'BT-03', 'ACTIVE');
GO

-- Seats for BUS-01 (34 seats: A01-A17 Tầng 1, B01-B17 Tầng 2, SLEEPER)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('SEA-01', 'A01', 1, 'SLEEPER', 'BUS-01'), ('SEA-02', 'A02', 1, 'SLEEPER', 'BUS-01'), ('SEA-03', 'A03', 1, 'SLEEPER', 'BUS-01'),
('SEA-04', 'A04', 1, 'SLEEPER', 'BUS-01'), ('SEA-05', 'A05', 1, 'SLEEPER', 'BUS-01'), ('SEA-06', 'A06', 1, 'SLEEPER', 'BUS-01'),
('SEA-07', 'A07', 1, 'SLEEPER', 'BUS-01'), ('SEA-08', 'A08', 1, 'SLEEPER', 'BUS-01'), ('SEA-09', 'A09', 1, 'SLEEPER', 'BUS-01'),
('SEA-10', 'A10', 1, 'SLEEPER', 'BUS-01'), ('SEA-11', 'A11', 1, 'SLEEPER', 'BUS-01'), ('SEA-12', 'A12', 1, 'SLEEPER', 'BUS-01'),
('SEA-13', 'A13', 1, 'SLEEPER', 'BUS-01'), ('SEA-14', 'A14', 1, 'SLEEPER', 'BUS-01'), ('SEA-15', 'A15', 1, 'SLEEPER', 'BUS-01'),
('SEA-16', 'A16', 1, 'SLEEPER', 'BUS-01'), ('SEA-17', 'A17', 1, 'SLEEPER', 'BUS-01'),
('SEA-18', 'B01', 2, 'SLEEPER', 'BUS-01'), ('SEA-19', 'B02', 2, 'SLEEPER', 'BUS-01'), ('SEA-20', 'B03', 2, 'SLEEPER', 'BUS-01'),
('SEA-21', 'B04', 2, 'SLEEPER', 'BUS-01'), ('SEA-22', 'B05', 2, 'SLEEPER', 'BUS-01'), ('SEA-23', 'B06', 2, 'SLEEPER', 'BUS-01'),
('SEA-24', 'B07', 2, 'SLEEPER', 'BUS-01'), ('SEA-25', 'B08', 2, 'SLEEPER', 'BUS-01'), ('SEA-26', 'B09', 2, 'SLEEPER', 'BUS-01'),
('SEA-27', 'B10', 2, 'SLEEPER', 'BUS-01'), ('SEA-28', 'B11', 2, 'SLEEPER', 'BUS-01'), ('SEA-29', 'B12', 2, 'SLEEPER', 'BUS-01'),
('SEA-30', 'B13', 2, 'SLEEPER', 'BUS-01'), ('SEA-31', 'B14', 2, 'SLEEPER', 'BUS-01'), ('SEA-32', 'B15', 2, 'SLEEPER', 'BUS-01'),
('SEA-33', 'B16', 2, 'SLEEPER', 'BUS-01'), ('SEA-34', 'B17', 2, 'SLEEPER', 'BUS-01');
GO

-- Seats for BUS-02 (22 seats: A01-A22 Tầng 1, VIP)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('SEA-02-01', 'A01', 1, 'VIP', 'BUS-02'), ('SEA-02-02', 'A02', 1, 'VIP', 'BUS-02'), ('SEA-02-03', 'A03', 1, 'VIP', 'BUS-02'),
('SEA-02-04', 'A04', 1, 'VIP', 'BUS-02'), ('SEA-02-05', 'A05', 1, 'VIP', 'BUS-02'), ('SEA-02-06', 'A06', 1, 'VIP', 'BUS-02'),
('SEA-02-07', 'A07', 1, 'VIP', 'BUS-02'), ('SEA-02-08', 'A08', 1, 'VIP', 'BUS-02'), ('SEA-02-09', 'A09', 1, 'VIP', 'BUS-02'),
('SEA-02-10', 'A10', 1, 'VIP', 'BUS-02'), ('SEA-02-11', 'A11', 1, 'VIP', 'BUS-02'), ('SEA-02-12', 'A12', 1, 'VIP', 'BUS-02'),
('SEA-02-13', 'A13', 1, 'VIP', 'BUS-02'), ('SEA-02-14', 'A14', 1, 'VIP', 'BUS-02'), ('SEA-02-15', 'A15', 1, 'VIP', 'BUS-02'),
('SEA-02-16', 'A16', 1, 'VIP', 'BUS-02'), ('SEA-02-17', 'A17', 1, 'VIP', 'BUS-02'), ('SEA-02-18', 'A18', 1, 'VIP', 'BUS-02'),
('SEA-02-19', 'A19', 1, 'VIP', 'BUS-02'), ('SEA-02-20', 'A20', 1, 'VIP', 'BUS-02'), ('SEA-02-21', 'A21', 1, 'VIP', 'BUS-02'),
('SEA-02-22', 'A22', 1, 'VIP', 'BUS-02');
GO

-- Seats for BUS-03 (22 seats: A01-A22 Tầng 1, VIP)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('SEA-03-01', 'A01', 1, 'VIP', 'BUS-03'), ('SEA-03-02', 'A02', 1, 'VIP', 'BUS-03'), ('SEA-03-03', 'A03', 1, 'VIP', 'BUS-03'),
('SEA-03-04', 'A04', 1, 'VIP', 'BUS-03'), ('SEA-03-05', 'A05', 1, 'VIP', 'BUS-03'), ('SEA-03-06', 'A06', 1, 'VIP', 'BUS-03'),
('SEA-03-07', 'A07', 1, 'VIP', 'BUS-03'), ('SEA-03-08', 'A08', 1, 'VIP', 'BUS-03'), ('SEA-03-09', 'A09', 1, 'VIP', 'BUS-03'),
('SEA-03-10', 'A10', 1, 'VIP', 'BUS-03'), ('SEA-03-11', 'A11', 1, 'VIP', 'BUS-03'), ('SEA-03-12', 'A12', 1, 'VIP', 'BUS-03'),
('SEA-03-13', 'A13', 1, 'VIP', 'BUS-03'), ('SEA-03-14', 'A14', 1, 'VIP', 'BUS-03'), ('SEA-03-15', 'A15', 1, 'VIP', 'BUS-03'),
('SEA-03-16', 'A16', 1, 'VIP', 'BUS-03'), ('SEA-03-17', 'A17', 1, 'VIP', 'BUS-03'), ('SEA-03-18', 'A18', 1, 'VIP', 'BUS-03'),
('SEA-03-19', 'A19', 1, 'VIP', 'BUS-03'), ('SEA-03-20', 'A20', 1, 'VIP', 'BUS-03'), ('SEA-03-21', 'A21', 1, 'VIP', 'BUS-03'),
('SEA-03-22', 'A22', 1, 'VIP', 'BUS-03');
GO

-- Seats for BUS-04 (45 seats: A01-A45 Tầng 1, NORMAL)
INSERT INTO seats (seat_id, seat_number, floor, seat_type, bus_id) VALUES 
('SEA-04-01', 'A01', 1, 'NORMAL', 'BUS-04'), ('SEA-04-02', 'A02', 1, 'NORMAL', 'BUS-04'), ('SEA-04-03', 'A03', 1, 'NORMAL', 'BUS-04'),
('SEA-04-04', 'A04', 1, 'NORMAL', 'BUS-04'), ('SEA-04-05', 'A05', 1, 'NORMAL', 'BUS-04'), ('SEA-04-06', 'A06', 1, 'NORMAL', 'BUS-04'),
('SEA-04-07', 'A07', 1, 'NORMAL', 'BUS-04'), ('SEA-04-08', 'A08', 1, 'NORMAL', 'BUS-04'), ('SEA-04-09', 'A09', 1, 'NORMAL', 'BUS-04'),
('SEA-04-10', 'A10', 1, 'NORMAL', 'BUS-04'), ('SEA-04-11', 'A11', 1, 'NORMAL', 'BUS-04'), ('SEA-04-12', 'A12', 1, 'NORMAL', 'BUS-04'),
('SEA-04-13', 'A13', 1, 'NORMAL', 'BUS-04'), ('SEA-04-14', 'A14', 1, 'NORMAL', 'BUS-04'), ('SEA-04-15', 'A15', 1, 'NORMAL', 'BUS-04'),
('SEA-04-16', 'A16', 1, 'NORMAL', 'BUS-04'), ('SEA-04-17', 'A17', 1, 'NORMAL', 'BUS-04'), ('SEA-04-18', 'A18', 1, 'NORMAL', 'BUS-04'),
('SEA-04-19', 'A19', 1, 'NORMAL', 'BUS-04'), ('SEA-04-20', 'A20', 1, 'NORMAL', 'BUS-04'), ('SEA-04-21', 'A21', 1, 'NORMAL', 'BUS-04'),
('SEA-04-22', 'A22', 1, 'NORMAL', 'BUS-04'), ('SEA-04-23', 'A23', 1, 'NORMAL', 'BUS-04'), ('SEA-04-24', 'A24', 1, 'NORMAL', 'BUS-04'),
('SEA-04-25', 'A25', 1, 'NORMAL', 'BUS-04'), ('SEA-04-26', 'A26', 1, 'NORMAL', 'BUS-04'), ('SEA-04-27', 'A27', 1, 'NORMAL', 'BUS-04'),
('SEA-04-28', 'A28', 1, 'NORMAL', 'BUS-04'), ('SEA-04-29', 'A29', 1, 'NORMAL', 'BUS-04'), ('SEA-04-30', 'A30', 1, 'NORMAL', 'BUS-04'),
('SEA-04-31', 'A31', 1, 'NORMAL', 'BUS-04'), ('SEA-04-32', 'A32', 1, 'NORMAL', 'BUS-04'), ('SEA-04-33', 'A33', 1, 'NORMAL', 'BUS-04'),
('SEA-04-34', 'A34', 1, 'NORMAL', 'BUS-04'), ('SEA-04-35', 'A35', 1, 'NORMAL', 'BUS-04'), ('SEA-04-36', 'A36', 1, 'NORMAL', 'BUS-04'),
('SEA-04-37', 'A37', 1, 'NORMAL', 'BUS-04'), ('SEA-04-38', 'A38', 1, 'NORMAL', 'BUS-04'), ('SEA-04-39', 'A39', 1, 'NORMAL', 'BUS-04'),
('SEA-04-40', 'A40', 1, 'NORMAL', 'BUS-04'), ('SEA-04-41', 'A41', 1, 'NORMAL', 'BUS-04'), ('SEA-04-42', 'A42', 1, 'NORMAL', 'BUS-04'),
('SEA-04-43', 'A43', 1, 'NORMAL', 'BUS-04'), ('SEA-04-44', 'A44', 1, 'NORMAL', 'BUS-04'), ('SEA-04-45', 'A45', 1, 'NORMAL', 'BUS-04');
GO

-- Trips
INSERT INTO trips (trip_id, route_id, bus_id, driver_id, departure_time, arrival_time, price, status) VALUES 
('TRP-01', 'RT-SGN-DLI', 'BUS-01', 'DRV-01', 
 DATEADD(HOUR, 8, CAST(DATEADD(DAY, 3, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)), 
 DATEADD(HOUR, 14, CAST(DATEADD(DAY, 3, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)), 
 200000.00, 'SCHEDULED'),
('TRP-02', 'RT-SGN-DLI', 'BUS-02', 'DRV-02', 
 DATEADD(HOUR, 10, CAST(DATEADD(DAY, 3, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)), 
 DATEADD(HOUR, 16, CAST(DATEADD(DAY, 3, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)), 
 250000.00, 'SCHEDULED'),
('TRP-03', 'RT-HAN-NBI', 'BUS-03', 'DRV-01',
 DATEADD(HOUR, 7, CAST(DATEADD(DAY, 1, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)),
 DATEADD(HOUR, 9, CAST(DATEADD(DAY, 1, CAST(SYSDATETIME() AS DATE)) AS DATETIME2)),
 120000.00, 'SCHEDULED');
GO

-- Bookings & Tickets
INSERT INTO bookings (booking_id, booking_code, customer_id, channel, created_at, expired_at, total_amount, status) VALUES 
('BKG-SEED-PENDING', 'BKG00001', 'USR-CUS-1', 'ONLINE', SYSDATETIME(), DATEADD(MINUTE, 10, SYSDATETIME()), 200000.00, 'PENDING'),
('BKG-SEED-CONFIRMED', 'BKG00002', 'USR-GUEST-1', 'ONLINE', SYSDATETIME(), DATEADD(MINUTE, 15, SYSDATETIME()), 200000.00, 'CONFIRMED');
GO

INSERT INTO tickets (ticket_id, ticket_code, booking_id, trip_id, seat_id, passenger_name, passenger_phone, price, status) VALUES 
('TCK-SEED-01', 'TCK00001', 'BKG-SEED-PENDING', 'TRP-01', 'SEA-01', N'Nguyễn Văn A', '0988000111', 200000.00, 'PENDING'),
('TCK-SEED-02', 'TCK00002', 'BKG-SEED-CONFIRMED', 'TRP-01', 'SEA-02', N'Khách Vãng Lai B', '0933222333', 200000.00, 'CONFIRMED');
GO
```

## File: 11_backup_restore.sql
```sql
-- ==============================================================================
-- 11_backup_restore.sql
-- KỊCH BẢN T-SQL SAO LƯU VÀ PHỤC HỒI HỆ THỐNG ĐẶT VÉ XE KHÁCH (FULL BACKUP & RESTORE)
-- ==============================================================================

-- ==============================================================================
-- PHẦN 1: STORED PROCEDURE VÀ KỊCH BẢN FULL BACKUP
-- ==============================================================================
CREATE OR ALTER PROCEDURE sp_FullBackupBusDatabase
    @BackupFolder NVARCHAR(500) = N'C:\SQLBackups'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @DbName NVARCHAR(128) = DB_NAME();
    DECLARE @BackupPath NVARCHAR(1000);
    DECLARE @BackupName NVARCHAR(256);
    DECLARE @Timestamp NVARCHAR(30);

    -- Tạo timestamp định dạng YYYYMMDD_HHMMSS
    SET @Timestamp = REPLACE(REPLACE(REPLACE(CONVERT(NVARCHAR(20), GETDATE(), 120), '-', ''), ':', ''), ' ', '_');
    SET @BackupPath = @BackupFolder + '\' + @DbName + '_Full_' + @Timestamp + '.bak';
    SET @BackupName = @DbName + '-Full Database Backup (' + @Timestamp + ')';

    PRINT N'Bắt đầu sao lưu toàn phần cơ sở dữ liệu: ' + @DbName;
    PRINT N'Đường dẫn tệp sao lưu: ' + @BackupPath;

    BACKUP DATABASE @DbName
    TO DISK = @BackupPath
    WITH 
        FORMAT,                 -- Khởi tạo media set mới
        INIT,                   -- Ghi đè file backup nếu trùng tên
        NAME = @BackupName,
        SKIP,                   -- Bỏ qua kiểm tra hạn sử dụng tape
        NOREWIND,
        NOUNLOAD,
        COMPRESSION,            -- Nén dữ liệu để tối ưu dung lượng đĩa
        STATS = 10,             -- Thông báo tiến độ mỗi 10%
        CHECKSUM;               -- Xác thực tính toàn vẹn dữ liệu
        
    PRINT N'Sao lưu cơ sở dữ liệu thành công!';
END
GO

-- ==============================================================================
-- PHẦN 2: STORED PROCEDURE PHỤC HỒI DATABASE (RESTORE)
-- ==============================================================================
CREATE OR ALTER PROCEDURE sp_RestoreBusDatabase
    @BackupFilePath NVARCHAR(1000)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DbName NVARCHAR(128) = DB_NAME();

    PRINT N'Bắt đầu phục hồi cơ sở dữ liệu: ' + @DbName + N' từ: ' + @BackupFilePath;

    -- Thực thi khôi phục động an toàn từ master
    DECLARE @Sql NVARCHAR(MAX);

    SET @Sql = N'
        USE master;
        ALTER DATABASE [' + @DbName + N'] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        
        RESTORE DATABASE [' + @DbName + N']
        FROM DISK = @FilePath
        WITH 
            FILE = 1,
            NOUNLOAD,
            REPLACE,
            STATS = 10,
            RECOVERY;

        ALTER DATABASE [' + @DbName + N'] SET MULTI_USER;
    ';

    EXEC sp_executesql @Sql, N'@FilePath NVARCHAR(1000)', @FilePath = @BackupFilePath;

    PRINT N'Phục hồi cơ sở dữ liệu thành công và đã mở lại trạng thái MULTI_USER!';
END
GO

-- ==============================================================================
-- PHẦN 3: LỆNH THAO TÁC MẪU TRỰC TIẾP (DIRECT T-SQL TEMPLATE)
-- ==============================================================================
/*
-- 1. Chạy sao lưu thủ công bằng lệnh trực tiếp:
BACKUP DATABASE [bus_management]
TO DISK = N'C:\SQLBackups\bus_management_Full.bak'
WITH 
    FORMAT,
    INIT,
    NAME = N'bus_management-Full Database Backup',
    COMPRESSION,
    STATS = 10,
    CHECKSUM;
GO

-- 2. Chạy phục hồi thủ công bằng lệnh trực tiếp:
USE master;
GO
ALTER DATABASE [bus_management] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO
RESTORE DATABASE [bus_management]
FROM DISK = N'C:\SQLBackups\bus_management_Full.bak'
WITH 
    FILE = 1,
    REPLACE,
    STATS = 10,
    RECOVERY;
GO
ALTER DATABASE [bus_management] SET MULTI_USER;
GO
*/
```

## File: 12_financial_payments.sql
```sql
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
```

## File: 13_financial_reports.sql
```sql
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
```
