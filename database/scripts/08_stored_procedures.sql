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

        -- Khóa chống phantom và kiểm tra ghế bận (PENDING, CONFIRMED hoặc đã lên xe CHECKED_IN)
        IF EXISTS (
            SELECT 1 FROM tickets WITH (UPDLOCK, HOLDLOCK)
            WHERE trip_id = @trip_id AND seat_id IN (SELECT seat_id FROM @P)
              AND status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
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
                    SET @GuestEmail = @ContactPhone + '@guest.daisy.vn';
                    IF EXISTS (SELECT 1 FROM users WHERE email = @GuestEmail)
                    BEGIN
                        SET @GuestEmail = @ContactPhone + '_' + LOWER(SUBSTRING(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 1, 6)) + '@guest.daisy.vn';
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

        UPDATE p SET p.status = 'FAILED'
        FROM payments p JOIN @Expired e ON e.booking_id = p.booking_id
        WHERE p.status = 'PENDING';

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
                     AND (tk.status IN ('CONFIRMED', 'CHECKED_IN')
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
            THROW 50061, N'Thông tin chuyến xe không hợp lệ (kiểm tra xe, tài xế, thời gian hoặc giá vé)', 1;

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
            THROW 50061, N'Thông tin cập nhật chuyến xe không hợp lệ (kiểm tra xe, tài xế, thời gian hoặc giá vé)', 1;

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

        IF NOT EXISTS (SELECT 1 FROM trips WITH (HOLDLOCK) WHERE trip_id = @trip_id AND status IN ('SCHEDULED', 'DEPARTED'))
            THROW 50073, N'Vé không check-in được (chuyến xe không ở trạng thái sẵn sàng hoặc đang chạy)', 1;

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
-- QUẢN TRỊ PHƯƠNG TIỆN, TUYẾN ĐƯỜNG & BẾN XE (FLEET, ROUTE & STATION MANAGEMENT)
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

-- ==============================================================================
-- BÁO CÁO TÀI CHÍNH & THỐNG KÊ DOANH THU (FINANCIAL & REPORTING PROCEDURES)
-- ==============================================================================

-- 24. sp_TraCuuThanhToan: tra cứu các giao dịch thanh toán của booking (xác thực bằng mã booking + SĐT)
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

-- 25. sp_BaoCaoDoanhThu: doanh thu trong khoảng ngày, gom theo DAY hoặc MONTH
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
                CAST(p.paid_at AS DATE) AS period,
                COUNT(*) AS payment_count,
                SUM(p.amount) AS total_revenue
            FROM payments p
            JOIN bookings bk ON bk.booking_id = p.booking_id
            WHERE p.status = 'SUCCESS' AND bk.status <> 'CANCELLED'
              AND p.paid_at >= @fromTime AND p.paid_at < @toTime
            GROUP BY CAST(p.paid_at AS DATE)
            ORDER BY period;
        ELSE
            SELECT
                DATEFROMPARTS(YEAR(p.paid_at), MONTH(p.paid_at), 1) AS period,
                COUNT(*) AS payment_count,
                SUM(p.amount) AS total_revenue
            FROM payments p
            JOIN bookings bk ON bk.booking_id = p.booking_id
            WHERE p.status = 'SUCCESS' AND bk.status <> 'CANCELLED'
              AND p.paid_at >= @fromTime AND p.paid_at < @toTime
            GROUP BY DATEFROMPARTS(YEAR(p.paid_at), MONTH(p.paid_at), 1)
            ORDER BY period;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- 26. sp_BaoCaoDoanhThuTuyen: số vé bán và doanh thu theo tuyến trong khoảng ngày
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

-- 27. sp_BaoCaoLapDay: tỷ lệ lấp đầy các chuyến khởi hành trong khoảng ngày
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



-- 28. sp_LayDanhSachChuyenAdmin: danh sách chuyến quản trị kèm thông tin ghế và phân trang
CREATE OR ALTER PROCEDURE dbo.sp_LayDanhSachChuyenAdmin
    @date VARCHAR(10) = NULL,
    @status VARCHAR(20) = NULL,
    @routeId VARCHAR(50) = NULL,
    @offset INT = 0,
    @limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    IF @offset < 0 SET @offset = 0;
    IF @limit < 1 SET @limit = 10;

    SELECT
        t.trip_id,
        t.route_id,
        t.bus_id,
        t.driver_id,
        t.departure_time,
        t.arrival_time,
        t.price,
        t.status,
        (SELECT COUNT(*) FROM seats s WHERE s.bus_id = t.bus_id) AS total_seats,
        (SELECT COUNT(DISTINCT tk.seat_id)
         FROM tickets tk
         WHERE tk.trip_id = t.trip_id AND tk.status IN ('CONFIRMED', 'CHECKED_IN')
        ) AS booked_seats,
        (SELECT COUNT(DISTINCT tk.seat_id)
         FROM tickets tk
         JOIN bookings b ON b.booking_id = tk.booking_id
         WHERE tk.trip_id = t.trip_id AND tk.status = 'PENDING' AND b.expired_at > SYSDATETIME()
        ) AS pending_seats,
        COUNT(*) OVER() AS totalCount
    FROM trips t
    WHERE (@date IS NULL OR CAST(t.departure_time AS DATE) = TRY_CAST(@date AS DATE))
      AND (@status IS NULL OR t.status = @status)
      AND (@routeId IS NULL OR t.route_id = @routeId)
    ORDER BY t.departure_time ASC, t.trip_id ASC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
END;
GO

-- 29. sp_LayThongTinVe: Tra cứu thông tin đơn đặt vé và danh sách vé theo mã booking hoặc số điện thoại
CREATE OR ALTER PROCEDURE dbo.sp_LayThongTinVe
    @booking_code VARCHAR(20) = NULL,
    @phone VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Bảng tạm lưu danh sách booking_id tìm được
    DECLARE @MatchedBookings TABLE (
        booking_id VARCHAR(50) PRIMARY KEY
    );

    IF @booking_code IS NOT NULL AND LTRIM(RTRIM(@booking_code)) <> ''
    BEGIN
        INSERT INTO @MatchedBookings (booking_id)
        SELECT booking_id
        FROM bookings
        WHERE booking_code = LTRIM(RTRIM(@booking_code));
    END
    ELSE IF @phone IS NOT NULL AND LTRIM(RTRIM(@phone)) <> ''
    BEGIN
        DECLARE @CleanPhone VARCHAR(20) = LTRIM(RTRIM(@phone));
        DECLARE @NormPhone VARCHAR(20) = REPLACE(REPLACE(@CleanPhone, '+84', '0'), ' ', '');

        INSERT INTO @MatchedBookings (booking_id)
        SELECT DISTINCT b.booking_id
        FROM bookings b
        JOIN users u ON u.user_id = b.customer_id
        LEFT JOIN tickets tk ON tk.booking_id = b.booking_id
        WHERE u.phone = @CleanPhone
           OR tk.passenger_phone = @CleanPhone
           OR REPLACE(REPLACE(u.phone, '+84', '0'), ' ', '') = @NormPhone
           OR REPLACE(REPLACE(tk.passenger_phone, '+84', '0'), ' ', '') = @NormPhone;
    END

    -- Recordset 1: Thông tin booking (kèm thông tin khách hàng)
    SELECT
        b.booking_id,
        b.booking_code,
        b.customer_id,
        b.channel,
        b.created_at,
        b.expired_at,
        b.total_amount,
        b.status,
        u.full_name AS customer_name,
        u.phone AS customer_phone
    FROM bookings b
    JOIN @MatchedBookings mb ON mb.booking_id = b.booking_id
    JOIN users u ON u.user_id = b.customer_id
    ORDER BY b.created_at DESC;

    -- Recordset 2: Danh sách vé chi tiết từ view vw_ChiTietVe
    SELECT
        v.ticket_id,
        v.ticket_code,
        v.booking_id,
        v.trip_id,
        v.seat_id,
        v.seat_number,
        v.passenger_name,
        v.passenger_phone,
        v.price,
        v.status,
        v.departure_time,
        v.arrival_time,
        v.route_id,
        v.departure_station,
        v.arrival_station,
        v.departure_province,
        v.arrival_province
    FROM dbo.vw_ChiTietVe v
    JOIN @MatchedBookings mb ON mb.booking_id = v.booking_id
    ORDER BY v.booking_id, v.seat_number ASC;
END;
GO

-- ==============================================================================
-- QUẢN LÝ NGƯỜI DÙNG & TÀI KHOẢN (USER & IDENTITY MANAGEMENT)
-- ==============================================================================

-- 30. sp_TaoNguoiDung: Tạo người dùng hệ thống (Admin, Staff, Driver, Customer)
-- Đảm bảo tính nguyên tử: nếu là DRIVER thì tự động tạo hồ sơ bằng lái trong bảng drivers
CREATE OR ALTER PROCEDURE dbo.sp_TaoNguoiDung
    @user_id VARCHAR(50),
    @full_name NVARCHAR(100),
    @email VARCHAR(100),
    @phone VARCHAR(20),
    @password_hash VARCHAR(255) = NULL,
    @role VARCHAR(20) = 'CUSTOMER',
    @license_number VARCHAR(50) = NULL,
    @license_expiry DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @user_id IS NULL OR LTRIM(RTRIM(@user_id)) = ''
        THROW 50010, N'Mã người dùng không được để trống', 1;
    IF @full_name IS NULL OR LTRIM(RTRIM(@full_name)) = ''
        THROW 50061, N'Họ tên không được để trống', 1;
    IF @phone IS NULL OR LTRIM(RTRIM(@phone)) = ''
        THROW 50061, N'Số điện thoại không được để trống', 1;
    IF @email IS NULL OR LTRIM(RTRIM(@email)) = ''
        THROW 50061, N'Email không được để trống', 1;

    IF EXISTS (SELECT 1 FROM users WHERE phone = @phone)
        THROW 50011, N'Số điện thoại này đã được đăng ký trong hệ thống', 1;
    IF EXISTS (SELECT 1 FROM users WHERE email = @email)
        THROW 50012, N'Email này đã được đăng ký trong hệ thống', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active)
        VALUES (@user_id, @full_name, @email, @phone, @password_hash, @role, 0, 1);

        IF @role = 'DRIVER'
        BEGIN
            DECLARE @driverId VARCHAR(50) = 'DRV-' + REPLACE(@user_id, 'USR-', '');
            DECLARE @licNum VARCHAR(50) = COALESCE(@license_number, 'B2-' + RIGHT(CAST(DATEDIFF_BIG(MILLISECOND, '1970-01-01', SYSDATETIME()) AS VARCHAR(30)), 8));
            DECLARE @licExp DATE = COALESCE(@license_expiry, DATEADD(YEAR, 5, CAST(SYSDATETIME() AS DATE)));

            INSERT INTO drivers (driver_id, user_id, license_number, license_expiry)
            VALUES (@driverId, @user_id, @licNum, @licExp);
        END

        COMMIT TRANSACTION;
        SELECT * FROM users WHERE user_id = @user_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 31. sp_CapNhatNguoiDung: Cập nhật thông tin người dùng
CREATE OR ALTER PROCEDURE dbo.sp_CapNhatNguoiDung
    @user_id VARCHAR(50),
    @full_name NVARCHAR(100),
    @email VARCHAR(100),
    @phone VARCHAR(20),
    @role VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = @user_id)
        THROW 50010, N'Người dùng không tồn tại', 1;

    IF EXISTS (SELECT 1 FROM users WHERE phone = @phone AND user_id <> @user_id)
        THROW 50011, N'Số điện thoại này đã được đăng ký cho người dùng khác', 1;
    IF EXISTS (SELECT 1 FROM users WHERE email = @email AND user_id <> @user_id)
        THROW 50012, N'Email này đã được đăng ký cho người dùng khác', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE users
        SET full_name = @full_name,
            email = @email,
            phone = @phone,
            role = @role
        WHERE user_id = @user_id;

        -- Nếu chuyển thành DRIVER mà chưa có hồ sơ drivers thì tự bổ sung
        IF @role = 'DRIVER' AND NOT EXISTS (SELECT 1 FROM drivers WHERE user_id = @user_id)
        BEGIN
            DECLARE @driverId VARCHAR(50) = 'DRV-' + REPLACE(@user_id, 'USR-', '');
            DECLARE @licNum VARCHAR(50) = 'B2-' + RIGHT(CAST(DATEDIFF_BIG(MILLISECOND, '1970-01-01', SYSDATETIME()) AS VARCHAR(30)), 8);
            INSERT INTO drivers (driver_id, user_id, license_number, license_expiry)
            VALUES (@driverId, @user_id, @licNum, DATEADD(YEAR, 5, CAST(SYSDATETIME() AS DATE)));
        END

        COMMIT TRANSACTION;
        SELECT * FROM users WHERE user_id = @user_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 32. sp_XoaNguoiDung: Xóa hoặc vô hiệu hóa người dùng
CREATE OR ALTER PROCEDURE dbo.sp_XoaNguoiDung
    @user_id VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = @user_id)
        THROW 50010, N'Người dùng không tồn tại', 1;

    -- Kiểm tra nếu người dùng có booking
    IF EXISTS (SELECT 1 FROM bookings WHERE customer_id = @user_id)
        THROW 50013, N'Người dùng đã có lịch sử đặt vé, không thể xóa vật lý (chỉ có thể khóa tài khoản)', 1;

    -- Kiểm tra nếu tài xế đang được phân công chuyến
    IF EXISTS (
        SELECT 1 FROM trips t
        JOIN drivers d ON d.driver_id = t.driver_id
        WHERE d.user_id = @user_id AND t.status IN ('SCHEDULED', 'DEPARTED')
    )
        THROW 50014, N'Tài xế đang được phân công chuyến xe hoạt động, không thể xóa', 1;

    BEGIN TRY
        BEGIN TRANSACTION;
        DELETE FROM drivers WHERE user_id = @user_id;
        DELETE FROM users WHERE user_id = @user_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 33. sp_DangKyKhachHang: Đăng ký khách hàng mới
CREATE OR ALTER PROCEDURE dbo.sp_DangKyKhachHang
    @user_id VARCHAR(50),
    @full_name NVARCHAR(100),
    @email VARCHAR(100),
    @phone VARCHAR(20),
    @password_hash VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM users WHERE phone = @phone)
        THROW 50011, N'Số điện thoại này đã được đăng ký trong hệ thống', 1;
    IF EXISTS (SELECT 1 FROM users WHERE email = @email)
        THROW 50012, N'Email này đã được đăng ký trong hệ thống', 1;

    INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active)
    VALUES (@user_id, @full_name, @email, @phone, @password_hash, 'CUSTOMER', 0, 1);

    SELECT * FROM users WHERE user_id = @user_id;
END;
GO

-- 34. sp_CapNhatGuestThanhKhachHang: Chuyển đổi khách vãng lai sang khách hàng chính thức
CREATE OR ALTER PROCEDURE dbo.sp_CapNhatGuestThanhKhachHang
    @phone VARCHAR(20),
    @full_name NVARCHAR(100),
    @password_hash VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM users WHERE phone = @phone AND role = 'GUEST')
        THROW 50010, N'Không tìm thấy thông tin khách vãng lai tương ứng', 1;

    UPDATE users
    SET full_name = @full_name,
        password_hash = @password_hash,
        role = 'CUSTOMER'
    WHERE phone = @phone AND role = 'GUEST';

    SELECT * FROM users WHERE phone = @phone;
END;
GO
