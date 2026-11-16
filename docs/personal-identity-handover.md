# Bàn giao kiểm thử họ tên và mã nhân viên

Phạm vi: ED_01–02, ED_20–51, ED_102–103 (36 case). Dự án: Group_04_Mock_Project_Sprint_02. Bộ test đối chiếu BA Personal Details và giữ procedure/expected gốc từ file manual CSV trong test-data/personal-name-id.json.

## Chạy kiểm thử

Cài dependencies bằng npm.cmd ci và trình duyệt bằng npx.cmd playwright install chromium. Tạo .env theo .env.example và điền tài khoản OrangeHRM. File .env không được đưa vào Git hoặc ZIP.

```powershell
npm.cmd run typecheck
npm.cmd run test:personal-identity:dry
npm.cmd run test:personal-identity
npm.cmd run report:personal-identity
```

Chạy một case: node scripts/run-personal-identity.cjs --name ED_103.
Không dùng tag @ED_20 để lọc một dòng Examples; ID nằm trong tên scenario.

## Các file bàn giao

| Nội dung | Đường dẫn |
| --- | --- |
| 36 scenario có ID riêng | features/personal-name-id.feature |
| Step definitions | steps/personal-name-id.steps.ts |
| Page Object mở rộng Page Object chung | pages/PersonalIdentityPage.ts |
| Test data, procedure và expected gốc | test-data/personal-name-id.json |
| Cấu hình riêng, 2 worker | cucumber.personal-identity.cjs |
| Hướng dẫn | docs/personal-identity-handover.md |
| Bảng kết quả từng case | docs/personal-identity-last-run.md |
| Bằng chứng các case fail | docs/personal-identity-defect-evidence.json |
| Báo cáo HTML có screenshot và request/response | test-results/personal-identity/personal-details.html |
| JSON và log streaming | test-results/personal-identity/personal-details.json và .ndjson |
| ZIP bàn giao | deliverables/Personal-Identity-Sprint-02.zip |

Kết quả chạy thật trong test-results được gitignore theo repo. JSON/Markdown tóm tắt trong docs có thể commit cùng source. ZIP gồm source cần chạy phần Name and Employee Id và các báo cáo, không gồm .env, node_modules hoặc file tin nhắn gửi lead.

## Đối chiếu phạm vi

| Yêu cầu | Test case |
| --- | --- |
| Layout, các field, Gender, Custom Fields, Attachments và Save | ED_01 |
| Tên/mã đã lưu, các field mặc định trống, dropdown -- Select -- và Gender chưa chọn | ED_02 |
| First Name hợp lệ, rỗng, khoảng trắng, emoji, 30/31 ký tự | ED_20–27 |
| Middle Name tùy chọn, hợp lệ, emoji, 30/31 ký tự và tên cột trái | ED_28–34 |
| Last Name hợp lệ, rỗng, khoảng trắng, emoji, 30/31 ký tự | ED_35–42 |
| Employee Id tùy chọn, kiểu dữ liệu và 10/11 ký tự | ED_43–46, ED_50–51 |
| Employee Id trùng, khác hoa/thường, có khoảng trắng đầu/cuối | ED_47–49 |
| Không lưu một phần; reload phải giữ First Name cũ và Nationality chưa chọn | ED_102 |
| Hiện đồng thời 3 lỗi; chỉ lưu sau khi sửa cả 3; kiểm tra sau reload | ED_103 |

Case lưu hợp lệ kiểm tra toast, HTTP status, giá trị sau reload và tên cột trái First + Last (không có Middle Name). Case validation kiểm tra thông báo, chữ đỏ, class viền lỗi, không có toast thành công, không gửi PUT và reload giữ dữ liệu cũ.

## Dữ liệu và cách cô lập

- Đăng nhập và mọi thao tác được kiểm thử chạy qua UI. API chỉ tạo nhân viên giả làm precondition và dọn chính các empNumber do scenario đó tạo. Mỗi case có nhân viên riêng; không dùng hay xóa nhân viên cố định của thành viên khác.
- ID hợp lệ sinh ngẫu nhiên giữ đúng loại/độ dài: 6 số, 7 ký tự có dấu cách, 9 ký tự chữ/số/ký hiệu, 10 số bắt đầu bằng 0. Duplicate dùng seed riêng 6 ký tự. Giá trị thực tế và empNumber được đính kèm report.
- ED_24/39 nhập đúng ba dấu cách. ED_31 dùng Tuan124@$ theo CSV.
- Personal Details chỉ cho phép sửa sau khi GET dữ liệu hoàn tất, loader biến mất và fixture hiện đúng. Không dùng sleep cố định để che việc trang chưa tải xong.
- Không thay thế pages/PersonalDetailsPage.ts hay step của các thành viên khác. CustomWorld có thêm personalIdentityPage kế thừa Page Object chung. Tag @personal-identity dùng riêng; @personalDetails tích hợp với lệnh chạy toàn màn hình.
- Test giữ expected manual: emoji sau reload thành dấu ?. BA chưa quy định rõ emoji; nếu demo thay đổi hành vi, cần BA xác nhận expected.
- ED_49 giữ nguyên dấu cách đầu/cuối, không tự giả định trim. BA cần làm rõ chuẩn hóa khoảng trắng và phân biệt hoa/thường (ED_48); expected hiện theo manual.
- ED_47/48 được manual ghi Fail. Kết quả của repo này phải đọc từ run mới; không suy từ nhãn manual hoặc kết quả ở Sprint 1. Case fail có screenshot, payload, phản hồi PUT và GET cả hai hồ sơ trước cleanup.
- Không skip case lỗi hoặc đổi expected để có báo cáo xanh.

## Kết quả full run tại Sprint 2

Ngày 16/11/2026: 36 scenario, **34 Pass / 2 Fail / 0 Skip**; 250/252 step Pass. Thời gian full run: 5 phút 56 giây. Typecheck đạt; dry-run riêng phần Name and Employee Id đạt 36 scenario và dry-run toàn repo đạt 111 scenario / 906 step, không thiếu hoặc trùng step.

Hai case Fail là ED_47 và ED_48. GET sau cập nhật xác nhận: ED_47, nhân viên 746 và 747 cùng có mã K23871; ED_48, nhân viên 749 có K65849 và 750 có k65849. Server nhận cập nhật và không hiện Employee Id already exists. Đây là bằng chứng của chính lượt chạy trong Sprint_02; fixture đã được dọn sau test. Xem personal-identity-defect-evidence.json để đọc payload, HTTP status và dữ liệu hai hồ sơ trước cleanup. ED_51 và ED_102–103 đều Pass.

Kết quả này không phải 36/36 Pass. Để hai case trùng mã đạt expected, phía ứng dụng cần sửa validation duy nhất; quy tắc không phân biệt hoa/thường của ED_48 cần BA xác nhận rõ theo manual. Bộ test giữ expected gốc để phát hiện sai lệch.


## Report provenance

The full-run report (34 PASS / 2 FAIL) was captured before the file rename. Raw JSON/NDJSON/HTML evidence keeps its original source paths and titles. Typecheck and dry-run after renaming verify imports and step registration; no new full browser run is claimed for this naming-only change.
