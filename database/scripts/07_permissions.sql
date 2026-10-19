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

IF OBJECT_ID('dbo.sp_ThanhToan', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_ThanhToan TO Role_NhanVien;
IF OBJECT_ID('dbo.sp_TraCuuThanhToan', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_TraCuuThanhToan TO Role_NhanVien;
IF OBJECT_ID('dbo.vw_LichSuThanhToan', 'V') IS NOT NULL
    GRANT SELECT ON dbo.vw_LichSuThanhToan TO Role_NhanVien;
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

IF OBJECT_ID('dbo.sp_ThanhToan', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_ThanhToan TO Role_KhachHang;
IF OBJECT_ID('dbo.sp_TraCuuThanhToan', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_TraCuuThanhToan TO Role_KhachHang;
GO


