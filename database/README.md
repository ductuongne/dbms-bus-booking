# Hướng dẫn Quản lý Cơ sở dữ liệu

Script này sẽ đặt lại cơ sở dữ liệu hiện tại và tạo lại từ đầu dựa trên các file `.sql`. 

## 1. Setup

Mở terminal tại thư mục gốc của dự án và chạy:
```bash
pip install pyodbc python-dotenv
```

## 2. Cách sử dụng
```bash
python database/db-reset.py
```

## 3. Cấu hình kết nối (Tùy chọn)
Mặc định, script đã được thiết lập sẵn để tự động kết nối tới localhost và tạo database tên là bus_management
Không thích thì tạo file .env trong folder database mà đổi nhé.
Có 2 thông số đổi đc là tên db với db server
Ví dụ muốn ghi đè cấu hình thì file .env kiểu vầy:
```
DB_SERVER=
DB_NAME=

```