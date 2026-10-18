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
    @channel VARCHAR(20) = 'ONLINE'
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

    -- Kiểm tra khách hàng
    IF @customer_id IS NULL
    BEGIN
        SELECT TOP 1 @customer_id = user_id FROM users WHERE role = 'GUEST' ORDER BY user_id;
        IF @customer_id IS NULL THROW 50062, N'Khách hàng không tồn tại', 1;
    END
    ELSE
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = @customer_id)
            THROW 50062, N'Khách hàng không tồn tại', 1;
    END

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
        IF ERROR_NUMBER() IN (2601, 2627) AND ERROR_MESSAGE() LIKE '%uq_tickets_trip_seat_active%'
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
