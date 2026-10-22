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
-- Tài xế không được thao tác trên bảng Doanh thu/Thanh toán và không được tự ý xóa/thay đổi vé
DENY SELECT, INSERT, UPDATE, DELETE ON payments TO Role_TaiXe;
DENY INSERT, DELETE ON bookings TO Role_TaiXe;
DENY INSERT, DELETE ON tickets TO Role_TaiXe;
GO

-- CẤP QUYỀN (GRANT) cho Tài xế: Xem dữ liệu hành trình, danh sách vé hành khách và điều khiển trạng thái chuyến
GRANT SELECT ON buses TO Role_TaiXe;
GRANT SELECT ON routes TO Role_TaiXe;
GRANT SELECT ON stations TO Role_TaiXe;
GRANT SELECT ON route_stations TO Role_TaiXe;
GRANT SELECT ON provinces TO Role_TaiXe;
GRANT SELECT ON trips TO Role_TaiXe;
GRANT SELECT ON tickets TO Role_TaiXe;
GRANT SELECT ON seats TO Role_TaiXe;
GRANT SELECT ON drivers TO Role_TaiXe;
GO

IF OBJECT_ID('dbo.sp_CheckIn', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_CheckIn TO Role_TaiXe;
IF OBJECT_ID('dbo.sp_DoiTrangThaiChuyen', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_DoiTrangThaiChuyen TO Role_TaiXe;
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
GRANT SELECT ON route_stations TO Role_NhanVien;
GRANT SELECT ON provinces TO Role_NhanVien;
GRANT SELECT ON seats TO Role_NhanVien;
GRANT SELECT ON bus_types TO Role_NhanVien;
GRANT SELECT ON drivers TO Role_NhanVien;
GRANT SELECT ON users TO Role_NhanVien;
GRANT SELECT, INSERT ON payments TO Role_NhanVien;
DENY DELETE ON bookings TO Role_NhanVien;
DENY DELETE ON tickets TO Role_NhanVien;
GO

IF OBJECT_ID('dbo.sp_GiuCho', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_GiuCho TO Role_NhanVien;
IF OBJECT_ID('dbo.sp_DatVe', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_DatVe TO Role_NhanVien;
IF OBJECT_ID('dbo.sp_HuyGiuCho', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_HuyGiuCho TO Role_NhanVien;
IF OBJECT_ID('dbo.sp_ThanhToan', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_ThanhToan TO Role_NhanVien;
IF OBJECT_ID('dbo.sp_TraCuuThanhToan', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_TraCuuThanhToan TO Role_NhanVien;
IF OBJECT_ID('dbo.sp_LayThongTinVe', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_LayThongTinVe TO Role_NhanVien;
IF OBJECT_ID('dbo.sp_CheckIn', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_CheckIn TO Role_NhanVien;
IF OBJECT_ID('dbo.vw_LichSuThanhToan', 'V') IS NOT NULL
    GRANT SELECT ON dbo.vw_LichSuThanhToan TO Role_NhanVien;
IF OBJECT_ID('dbo.fn_LaySoDoGhe', 'IF') IS NOT NULL
    GRANT SELECT ON dbo.fn_LaySoDoGhe TO Role_NhanVien;
IF OBJECT_ID('dbo.fn_TinhGiaVe', 'FN') IS NOT NULL
    GRANT EXECUTE ON dbo.fn_TinhGiaVe TO Role_NhanVien;
GO

-- 5. PHÂN QUYỀN Role_KhachHang (Khách hàng đặt vé và xem chuyến)
GRANT SELECT ON trips TO Role_KhachHang;
GRANT SELECT ON routes TO Role_KhachHang;
GRANT SELECT ON stations TO Role_KhachHang;
GRANT SELECT ON route_stations TO Role_KhachHang;
GRANT SELECT ON provinces TO Role_KhachHang;
GRANT SELECT ON bus_types TO Role_KhachHang;
GRANT SELECT ON buses TO Role_KhachHang;
GRANT SELECT ON seats TO Role_KhachHang;
GRANT SELECT, INSERT, UPDATE ON bookings TO Role_KhachHang;
GRANT SELECT, INSERT, UPDATE ON tickets TO Role_KhachHang;
GRANT SELECT, INSERT ON payments TO Role_KhachHang;
DENY DELETE ON bookings TO Role_KhachHang;
DENY DELETE ON tickets TO Role_KhachHang;
GO

IF OBJECT_ID('dbo.sp_GiuCho', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_GiuCho TO Role_KhachHang;
IF OBJECT_ID('dbo.sp_DatVe', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_DatVe TO Role_KhachHang;
IF OBJECT_ID('dbo.sp_HuyGiuCho', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_HuyGiuCho TO Role_KhachHang;
IF OBJECT_ID('dbo.sp_ThanhToan', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_ThanhToan TO Role_KhachHang;
IF OBJECT_ID('dbo.sp_TraCuuThanhToan', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_TraCuuThanhToan TO Role_KhachHang;
IF OBJECT_ID('dbo.sp_LayThongTinVe', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_LayThongTinVe TO Role_KhachHang;
IF OBJECT_ID('dbo.sp_DangKyKhachHang', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_DangKyKhachHang TO Role_KhachHang;
IF OBJECT_ID('dbo.sp_CapNhatGuestThanhKhachHang', 'P') IS NOT NULL
    GRANT EXECUTE ON dbo.sp_CapNhatGuestThanhKhachHang TO Role_KhachHang;
IF OBJECT_ID('dbo.fn_LaySoDoGhe', 'IF') IS NOT NULL
    GRANT SELECT ON dbo.fn_LaySoDoGhe TO Role_KhachHang;
IF OBJECT_ID('dbo.fn_TinhGiaVe', 'FN') IS NOT NULL
    GRANT EXECUTE ON dbo.fn_TinhGiaVe TO Role_KhachHang;
GO

-- ==============================================================================
-- 6. TẠO 4 SERVER LOGINS & DATABASE USERS TƯƠNG ỨNG VỚI 4 ROLES
-- ==============================================================================

-- 6.1. Login & User cho Quản trị viên (Admin)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'login_admin')
BEGIN
    CREATE LOGIN login_admin WITH PASSWORD = 'AdminStrongPassword@2026', CHECK_POLICY = OFF;
END
GO
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'user_admin')
BEGIN
    CREATE USER user_admin FOR LOGIN login_admin;
END
GO
ALTER ROLE Role_Admin ADD MEMBER user_admin;
GO

-- 6.2. Login & User cho Nhân viên (Staff)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'login_nhanvien')
BEGIN
    CREATE LOGIN login_nhanvien WITH PASSWORD = 'StaffStrongPassword@2026', CHECK_POLICY = OFF;
END
GO
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'user_nhanvien')
BEGIN
    CREATE USER user_nhanvien FOR LOGIN login_nhanvien;
END
GO
ALTER ROLE Role_NhanVien ADD MEMBER user_nhanvien;
GO

-- 6.3. Login & User cho Tài xế (Driver)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'login_taixe')
BEGIN
    CREATE LOGIN login_taixe WITH PASSWORD = 'DriverStrongPassword@2026', CHECK_POLICY = OFF;
END
GO
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'user_taixe')
BEGIN
    CREATE USER user_taixe FOR LOGIN login_taixe;
END
GO
ALTER ROLE Role_TaiXe ADD MEMBER user_taixe;
GO

-- 6.4. Login & User cho Khách hàng (Customer)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'login_khachhang')
BEGIN
    CREATE LOGIN login_khachhang WITH PASSWORD = 'CustomerStrongPassword@2026', CHECK_POLICY = OFF;
END
GO
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'user_khachhang')
BEGIN
    CREATE USER user_khachhang FOR LOGIN login_khachhang;
END
GO
ALTER ROLE Role_KhachHang ADD MEMBER user_khachhang;
GO

-- ==============================================================================
-- 7. MINH HỌA LỆNH REVOKE (THU HỒI QUYỀN ĐÃ CẤP)
-- ==============================================================================
-- Kịch bản nghiệp vụ:
-- Trong đợt kiểm toán doanh thu, Nhân viên (Role_NhanVien) được Quản trị viên tạm cấp quyền
-- xem thông tin nhạy cảm của bảng users và View thống kê tổng quan hệ thống.
-- Sau khi kỳ kiểm toán kết thúc, Quản trị viên thực hiện lệnh REVOKE để thu hồi các quyền này,
-- đảm bảo tuân thủ nghiêm ngặt nguyên tắc Đặc quyền tối thiểu (Least Privilege).

-- Bước 7.1: Tạm cấp quyền cho Role_NhanVien
GRANT SELECT ON dbo.users TO Role_NhanVien;
IF OBJECT_ID('dbo.vw_ThongKeTongQuan', 'V') IS NOT NULL
    GRANT SELECT ON dbo.vw_ThongKeTongQuan TO Role_NhanVien;
GO

-- Bước 7.2: Thu hồi quyền (REVOKE) đã tạm cấp
REVOKE SELECT ON dbo.users FROM Role_NhanVien;
IF OBJECT_ID('dbo.vw_ThongKeTongQuan', 'V') IS NOT NULL
    REVOKE SELECT ON dbo.vw_ThongKeTongQuan FROM Role_NhanVien;
GO



