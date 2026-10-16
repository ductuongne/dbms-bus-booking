# Code Style Rules

## 1. Cấm tuyệt đối

- Đặt logic nghiệp vụ trong controller, component hoặc repository.
- Viết SQL ngoài repository; gọi API trực tiếp trong component; đọc `process.env` ngoài `config/`.
- Lách các luật trên bằng file trung gian, barrel `index.ts` hoặc lý do "tạm thời".
- Sửa ESLint, `tsconfig`, Vite hoặc scripts để né lỗi.
- Dùng `any`, `@ts-ignore`, `@ts-nocheck` hoặc ép kiểu để che lỗi. Chưa rõ kiểu thì dùng `unknown` và thu hẹp kiểu trước khi dùng.
- Hard-code secret hoặc để lại log debug.
- Refactor hoặc rename file hàng loạt ngoài phạm vi yêu cầu. Khi sửa code có sẵn, chỉ chỉnh phần cần thiết và giữ phong cách của file đó.

## 2. Đặt tên
- Biến: camelCase, danh từ, mảng số nhiều (userId, users).
- Hàm: camelCase, bắt đầu bằng động từ (getUser).
- Sự kiện: handleXxx (nội bộ), onXxx (props).
- Boolean: camelCase, bắt đầu is/has/can/should. Cấm phủ định kép (isVisible, cấm isNotHidden).
- Class/Type/Interface: PascalCase, số ít. Cấm tiền tố I/T (User, cấm IUser).
- Props/DTO: PascalCase + hậu tố (ButtonProps, UserDto).
- Hằng số: UPPER_SNAKE_CASE.
- Enum: PascalCase, giá trị UPPER_SNAKE_CASE.
- Thư mục: kebab-case.
- File FE: Component/Page=PascalCase, Hook=useCamelCase, Util=camelCase.
- File BE: camelCase + hậu tố (user.controller.ts).
- Viết tắt: Viết hoa chữ đầu (userId, cấm userID).
- Lặp ngữ cảnh: Không đưa tên class vào thuộc tính (User.name, cấm User.userName).

Không rename file/chuẩn hóa hàng loạt chỉ để đồng nhất.

## 3. Frontend (React)

- Chỉ dùng function component và hooks; tuân thủ Rules of Hooks.
- Tách logic nghiệp vụ và xử lý dữ liệu khỏi JSX khi cần. Mỗi component/page chính nên có file riêng.
- Gọi API qua Axios instance và service hiện có; không gọi API trực tiếp trong component.
- Không sao chép server state sang nhiều component nếu không cần. Đặt state gần nơi sử dụng nhất.
- Danh sách dùng `key` ổn định từ ID nghiệp vụ. Route cần bảo vệ phải dùng `ProtectedRoute` và role constants hiện có.
- Dùng `lucide-react` khi đã có icon phù hợp; đảm bảo HTML đúng ngữ nghĩa và ảnh có `alt`.
- Quản lý cấu hình, token và interceptor tại nơi tập trung hiện có; không rải logic này trong component.

## 4. Backend (Express)

- Tuân thủ luồng `routes → controller → service → repository`:
  - `routes`: endpoint và middleware.
  - `controller`: nhận request, gọi service, trả response.
  - `service`: xử lý nghiệp vụ, không phụ thuộc `req`/`res`.
  - `repository`: nơi duy nhất thực hiện truy vấn SQL hoặc gọi stored procedure.
- Dùng `async/await`, không trộn callback hoặc `.then()` trong cùng luồng.
- Validate `body`, `params`, `query` trước khi xử lý nghiệp vụ; tái sử dụng schema/validator hiện có.
- Giữ format response và cơ chế `AppError`/`errorHandler` hiện có. Không nuốt lỗi hoặc trả chi tiết nội bộ cho client.
- Đọc `process.env` qua module config hiện có; không hard-code thông tin nhạy cảm.
