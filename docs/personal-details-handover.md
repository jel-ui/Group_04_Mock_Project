# Bàn giao automation Personal Details của Khởi

Phạm vi: **36 case** ED_01–02, ED_20–51, ED_102–103. Framework: Cucumber + Playwright + TypeScript, Page Object riêng cho Personal Details.

File ZIP bàn giao: `deliverables/Khoi-Personal-Details.zip`. File này có source cần để chạy bộ Personal Details, kết quả HTML/JSON, hướng dẫn và nội dung báo lỗi gửi lead. Không có `.env`, thông tin đăng nhập hay node_modules.

Kết quả full run cuối ngày 16/11/2026: **36 scenario, 34 Pass, 2 Fail (ED_47–48), 0 Skip**; 250/252 step Pass. Typecheck và dry-run đạt. Kết quả này xác nhận cả ED_51 và ED_102–103 đã Pass. Hai Fail còn lại có request gửi đúng mã trùng, HTTP 200 và GET đọc lại xác nhận ứng dụng lưu cả hai hồ sơ với mã trùng; xem `personal-details-defect-evidence.json` và `message-to-lead.md`. Không có lỗi thao tác/locator được phát hiện trong lượt cuối; bộ test không được báo là 36/36 Pass.

## Chạy lại

Điền BASE_URL, ORANGEHRM_USERNAME, ORANGEHRM_PASSWORD trong `.env` theo `.env.example`.

Nếu giải nén ở máy mới: cài Node.js LTS phù hợp package, chạy `npm.cmd ci`, `npx.cmd playwright install chromium`, rồi copy `.env.example` thành `.env` và nhập tài khoản demo.

```powershell
npm.cmd run typecheck
npm.cmd run test:employee-details:dry
npm.cmd run test:employee-details
npm.cmd run report:employee-details
```

Chạy riêng một case (ID nằm trong tên scenario outline):

```powershell
npm.cmd run test:employee-details -- --name 'ED_103'
```

Không dùng `--tags @ED_20` để lọc dòng Examples. Dùng `--name ED_20`.

## File bàn giao

| Nội dung | File |
| --- | --- |
| Scenarios và 36 ID riêng | features/personal-details.feature |
| Step definitions, fixture và cleanup | steps/personal-details.steps.ts |
| Locators, nhập dữ liệu, lưu và assertions | pages/PersonalDetailsPage.ts |
| Test data và procedure/expected gốc từ CSV | test-data/personal-details.json |
| Cấu hình chạy riêng, 2 worker | cucumber.ed.cjs |
| Báo cáo HTML có screenshot và bằng chứng request/response | test-results/personal-details.html |
| Kết quả máy đọc được | test-results/personal-details.json |
| Log streaming giữ tiến độ nếu run bị gián đoạn | test-results/personal-details.ndjson |
| Tổng hợp từng case sau lệnh report | test-results/personal-details-run-summary.md |

Các báo cáo trong test-results bị gitignore theo cấu hình repo; cần gửi kèm khi bàn giao. Cấu hình riêng không ghi đè báo cáo của bộ Add Employee.

## Đối chiếu BA và manual

Nguồn BA: DOCX do người dùng cung cấp, Sprint 2 Personal Details OrangeHRM 5.9, mục 3.1 và US-01/FR-01/FR-04. Nguồn manual: Employee Details.csv, chỉ chọn ID đã giao.

| Requirement | Case |
| --- | --- |
| Bố cục Personal Details, các nút Save và defaults | ED_01–02 |
| First Name: hợp lệ, rỗng, khoảng trắng, Unicode, 30/31 ký tự | ED_20–27 |
| Middle Name tùy chọn, hợp lệ, Unicode, 30/31 ký tự, không xuất hiện ở cột trái | ED_28–34 |
| Last Name: hợp lệ, rỗng, khoảng trắng, Unicode, 30/31 ký tự | ED_35–42 |
| Employee Id tùy chọn, hợp lệ và giới hạn 10 ký tự | ED_43–46, ED_50–51 |
| Employee Id trùng và khác chữ hoa/thường | ED_47–48 |
| Employee Id trùng có khoảng trắng đầu/cuối | ED_49 |
| Không lưu một phần, giữ dữ liệu cũ sau reload | ED_102 |
| Hiển thị đồng thời 3 lỗi và lưu sau khi sửa hết | ED_103 |

Tên hợp lệ được kiểm tra toast, HTTP status, giá trị sau reload và tên cột trái theo First + Last. Các case lỗi kiểm tra thông báo, class viền lỗi, màu chữ đỏ, không có toast thành công và không gửi PUT; reload phải giữ dữ liệu cũ.

## Các quyết định dữ liệu và giới hạn

- Giá trị rỗng và ba dấu cách là hai giá trị khác nhau trong JSON. ED_24/39 nhập đúng ba dấu cách; ED_31 dùng `Tuan124@$` theo CSV.
- Emoji theo expected manual phải thành `?`; BA không quy định rõ hành vi này. Nếu phiên bản demo lưu khác, test giữ expected manual và báo sai lệch cần BA xác nhận.
- ID dùng dữ liệu ngẫu nhiên giữ đúng loại và độ dài: 6 số, 7 ký tự có khoảng trắng, 9 ký tự có chữ/số/ký hiệu, 10 số bắt đầu bằng 0. ED_47–49 tạo seed riêng 6 ký tự. Cách này tránh phụ thuộc hoặc xóa nhân viên của người khác. Giá trị chạy thực tế được đính kèm báo cáo.
- ED_49 kiểm tra lưu chuỗi có một dấu cách đầu và cuối, không tự giả định trim. CSV yêu cầu Successfully Updated; BA chưa nêu rõ chuẩn hóa khoảng trắng/case sensitivity. Expected bổ sung về việc giữ nguyên khoảng trắng cần được xác nhận nếu server tự chuẩn hóa.
- Đăng nhập qua UI. API chỉ tạo/xóa nhân viên giả dùng làm precondition. Mọi thay đổi nghiệp vụ dưới kiểm thử chạy qua UI. Cleanup chỉ xóa empNumber đã được chính scenario tạo; không xóa theo ID trùng trên demo.
- Personal Details chỉ cho phép nhập sau khi GET dữ liệu hoàn tất, spinner tắt và giá trị fixture hiển thị đúng. Không dùng sleep cố định để che việc trang chưa tải xong.
- Test fail phải được giữ nguyên trong báo cáo. Không skip, đổi expected hoặc mock response để có báo cáo xanh.
- ED_47/48 được manual ghi Fail. Kết quả thực tế của run cuối nằm trong báo cáo; không suy kết quả từ nhãn manual.
