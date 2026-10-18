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
