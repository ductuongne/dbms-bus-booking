---
name: AGENTS
description: Quy định và hướng dẫn làm việc cho AI trong dự án Đặt vé xe khách.
---

# Hướng Dẫn Dành Cho AI

> **LƯU Ý BẮT BUỘC CHO MỌI AI AGENT:**
> Trước khi thực hiện bất kỳ nhiệm vụ nào, bạn **BẮT BUỘC** phải đọc các quy định trong `.agents/rules/` và kiểm tra các công cụ tại `.agents/skills/` (nếu có). Tuân thủ tuyệt đối, hỏi lại người dùng nếu họ có ý định làm điều vượt ra ngoài quy tắc.

---

## 1. Tổng quan

Hệ thống đặt vé xe khách theo mô hình monorepo.

| Thư mục | Công nghệ chính / Vai trò |
|---|---|
| `frontend/` | React + TypeScript + Vite, giao diện người dùng |
| `backend/` | Express + TypeScript, API và nghiệp vụ |
| `database/` | SQL Server, chứa sơ đồ và file `.sql` (schema, data seed) |
| `.agents/` | `rules/` là quy định bắt buộc, `skills/` là kỹ năng agent có thể dùng |

## 2. Lệnh thường dùng

```bash
npm install     # cài đặt thư viện
npm run dev     # chạy môi trường dev
npm test        # test
npm run lint    # lint / format
```

- **Luôn dùng `npm run dev`** trong quá trình chỉnh sửa ứng dụng. **KHÔNG chạy `npm run build`** trong phiên làm việc của agent.

## 3. Quy trình làm việc

1. Với việc lớn hoặc chưa rõ yêu cầu: nêu kế hoạch ngắn và hỏi lại trước khi làm.
2. Chạy lint/test liên quan sau khi sửa.
3. Báo cáo ngắn trong chat: đã sửa file nào, vì sao, và chưa kiểm chứng điều gì.
4. Nếu không chắc, nói rõ và hỏi lại, không đoán.


## 5. Tuyệt đối không

- Không xóa hoặc ghi đè dữ liệu khi chưa được xác nhận.
- Không commit `.env`, key, token, các file nhạy cảm.
- Không thêm thư viện mới khi chưa hỏi người dùng.