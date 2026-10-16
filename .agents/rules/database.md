# Database Rules (SQL Server)

- Dùng SQL thuần và Prepared Statement, không dùng ORM.
- Mọi truy vấn phải tham số hóa (`@TenThamSo`), không nối chuỗi SQL. Tên bảng/cột/`ORDER BY` chỉ lấy từ whitelist trong code.
- Không `DROP`, `TRUNCATE`, `DELETE`/`UPDATE` không `WHERE`, hay chạy `python database/db-reset.py` khi chưa có xác nhận rõ ràng của tôi. Nếu công cụ tự hiện câu hỏi xác nhận, chuyển cho tôi, không tự đồng ý.
- Thao tác nhiều bước (ví dụ: đặt vé, thanh toán) phải nằm trong transaction.
- Connection string chỉ nằm trong biến môi trường; không ghi đè `.env` hiện có.
- Không log hoặc trả lỗi gốc của DB ra client.