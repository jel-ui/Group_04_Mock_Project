# Nội dung gửi lead

Anh/chị ơi, em đã hoàn thiện và chạy đủ bộ automation Personal Details được giao: ED_01–02, ED_20–51 và ED_102–103. Kết quả full run bản cuối trên OrangeHRM demo ngày 16/11/2026 là 34 Pass / 2 Fail / 0 Skip; typecheck và dry-run đều đạt. ED_102–103, validation độ dài và dữ liệu sau reload đã pass.

Hai case còn Fail là ED_47 và ED_48, có bằng chứng lỗi ứng dụng so với expected:

- ED_47: seed nhân viên 460 có Employee Id `K70207`; cập nhật nhân viên 461 sang cùng mã. Server trả HTTP 200; đọc lại cả hai hồ sơ đều có `K70207`, không hiện `Employee Id already exists`.
- ED_48: seed nhân viên 462 có Employee Id `K91736`; cập nhật nhân viên 463 sang `k91736`. Server trả HTTP 200; đọc lại xác nhận cả hai giá trị này đã lưu, không hiện lỗi trùng như expected manual.

BA US-01 AC4 / VR-03 và BR-02 yêu cầu Employee Id duy nhất; manual cũng ghi ED_47–48 là Fail. Nhờ anh/chị review và ghi nhận defect validation trùng mã. Riêng quy tắc không phân biệt hoa/thường ở ED_48 cần BA xác nhận rõ vì được nêu cụ thể trong manual, chưa mô tả rõ trong BA.

Em giữ nguyên expected để bộ test tiếp tục phát hiện sai lệch. Gói bàn giao có source, step definitions, Page Object, test data, hướng dẫn chạy, HTML screenshot và request/response cùng kết quả GET sau cập nhật. Dữ liệu thử nghiệm đã được dọn sau run; empNumber ở trên là bằng chứng của lượt chạy này, không còn là bản ghi để mở lại. Có thể tái hiện bằng lệnh `node scripts/run-personal-details.cjs --name ED_47` hoặc `--name ED_48`.
