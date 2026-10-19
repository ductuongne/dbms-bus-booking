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
