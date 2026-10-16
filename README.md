# Hệ Thống Quản Lý Đặt Vé Xe (DBMS Project)

## Cấu trúc dự án
- `/client`: Frontend viết bằng React + TypeScript + Vite.
- `/server`: Backend viết bằng Express + TypeScript, kết nối SQL Server (mssql).
- `/database`: Chứa toàn bộ scripts thiết kế CSDL (Schema, Procedures, Triggers, Views, Functions, Transactions, Permissions).

## Hướng dẫn cài đặt & chạy
1. **Database**: Chạy các script trong thư mục `database/scripts/` theo thứ tự từ `schema.sql` -> `constraints.sql` -> `indexes.sql` -> `functions.sql` -> `views.sql` -> `stored_procedures.sql` -> `triggers.sql` -> `seed_data.sql`.
2. **Server**:
   ```bash
   cd server
   npm install
   cp .env.example .env # Cấu hình thông tin SQL Server
   npm run dev
   ```
3. **Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

