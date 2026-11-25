# OrangeHRM Automation

Framework kiểm thử UI cho OrangeHRM dùng Cucumber (Gherkin) + Playwright + TypeScript.

- Sprint 1: đăng nhập và màn **PIM > Add Employee**.
- Sprint 2: màn **PIM > Employee > Personal Details**.
- Sprint 3: màn **PIM > Employee List**.

## Cấu trúc

- features/: Gherkin chia theo màn hình.
  - `login/`: đăng nhập.
  - `add-employee/`: `add-employee-form`, `employee-id`, `login-details`, `profile-photo`, `employee-navigation`.
  - `personal-details/`: `personal-details` (nhóm bằng `Rule`), `profile-picture`.
  - `employee-list/`: `employee-list`.
- steps/: step definitions (`*.steps.ts`).
  - `login.steps.ts`: các bước đăng nhập.
  - `employee.steps.ts`, `add-employee.steps.ts`, `login-details.steps.ts`, `profile-photo.steps.ts`, `employee-navigation.steps.ts`, `system-users.steps.ts`: Add Employee.
  - `personal-details.steps.ts`, `name-employee-id.steps.ts`, `other-details.steps.ts`, `personal-assets.steps.ts`, `employee-state.steps.ts`: Personal Details.
  - `employee-list.steps.ts`: Employee List.
  - Các step có ở cả hai màn (`the "..." field shows the "..." error`, `the "..." field has the value "..."`, `I change the Employee Id to "..."`) chỉ định nghĩa một lần: đã mở Personal Details thì kiểm tra trên Personal Details, chưa thì trên form Add Employee.
- pages/: Page Objects (`LoginPage`, `DashboardPage`, `EmployeeListPage`, `AddEmployeePage`, `SystemUsersPage`, `PersonalDetailsPage`, `PersonalAssetsPage`).
- support/
  - `config.ts`: đọc URL, browser, headless, tài khoản từ biến môi trường.
  - `world.ts`: CustomWorld, khởi tạo các Page Object, mở Personal Details theo Employee Id.
  - `hooks.ts`: mở/đóng browser, chụp ảnh cuối mỗi scenario, ghi Test Case ID (`AE_...`, `ED_...`) vào report.
  - `pageLoad.ts`: chờ trang load xong trước khi kiểm tra.
  - `testData.ts`: Employee Id ngẫu nhiên và nhân viên test của Personal Details, Employee List.
  - `pimApi.ts`: gọi API OrangeHRM bằng phiên đăng nhập của trình duyệt để chuẩn bị dữ liệu và đối chiếu số bản ghi.
  - `employeeListData.ts`: Before hook tạo nhân viên cho các scenario `@employee-list-data` và xoá khi chạy xong.
- test-data/: `photos/` (Add Employee), `attachments/` và `profile-pictures/` (Personal Details).
- test-results/: báo cáo HTML sau khi chạy.

## Cài đặt

    npm install
    npx playwright install chromium

Tạo file `.env` từ mẫu rồi điền tài khoản:

    copy .env.example .env

| Biến | Ý nghĩa | Mặc định |
| --- | --- | --- |
| BASE_URL | URL OrangeHRM | https://opensource-demo.orangehrmlive.com |
| ORANGEHRM_USERNAME | Tài khoản đăng nhập | (bắt buộc) |
| ORANGEHRM_PASSWORD | Mật khẩu | (bắt buộc) |
| BROWSER | chromium / firefox / webkit | chromium |
| HEADLESS | true = chạy ẩn, false = mở trình duyệt | false (true trên CI) |
| FEATURES | Chỉ chạy các file feature này, ví dụ `features/login/**/*.feature` | tất cả |
| STEP_TIMEOUT, ACTION_TIMEOUT, NAVIGATION_TIMEOUT, PAGE_LOAD_TIMEOUT | Thời gian chờ (ms) | 120000, 30000, 60000, 60000 |
| TRACE_ON_FAILURE | true = lưu trace của scenario fail vào `test-results/traces` | false (true trên CI) |

## Quản lý thông tin đăng nhập

- Tài khoản **không** được viết trong code hay file .feature; chỉ đọc qua `config.username` / `config.password`.
- File `.env` đã nằm trong `.gitignore`, không bao giờ commit lên GitHub.
- Trên GitHub Actions: vào **Settings > Secrets and variables > Actions**, tạo 2 secret
  `ORANGEHRM_USERNAME` và `ORANGEHRM_PASSWORD`.
- Nếu thiếu biến, test báo lỗi rõ ràng: `Thiếu biến môi trường ...`.

## Chạy kiểm thử

    npm test                        # chạy tất cả
    npm run test:smoke              # chỉ các scenario @smoke
    npm run test:login              # đăng nhập
    npm run test:add-employee       # màn Add Employee
    npm run test:personal-details   # màn Personal Details
    npm run test:employee-list      # màn Employee List
    npm run test:dry                # kiểm tra step đã được định nghĩa đủ, không mở browser
    npm run typecheck               # kiểm tra lỗi TypeScript

Chạy theo tag hoặc theo ID:

    npx cucumber-js --tags "@license-expiry and @validation"
    npx cucumber-js --tags "@ED_71"

Scenario gắn `@known-defect` (lỗi của site, hiện là ED_47) không chạy mặc định. Mỗi scenario fail được chạy lại 1 lần.

    npx cucumber-js -p known-defect

Mở báo cáo sau khi chạy:

    start .\test-results\cucumber-report.html

Xem trace của scenario fail:

    npx playwright show-trace test-results\traces\<tên scenario>.zip

Trên GitHub Actions, 4 màn hình login, add-employee, personal-details, employee-list chạy song song ở 4 job. Mỗi job có artifact `cucumber-report-<màn hình>` gồm báo cáo HTML và trace.

Before hook ghi Test Case ID vào report HTML: Scenario thường lấy ID từ tag (`@AE_...`, `@ED_...`, `@EL_...`), còn Scenario Outline lấy ID từ tên scenario đã nội suy.

## Sprint 1: Add Employee

Các trường hợp có cùng luồng được gom bằng `Scenario Outline` và một bảng `Examples`. Mỗi dòng có cột `TC ID`; Cucumber chạy từng dòng thành một scenario riêng, ID được đưa vào tên scenario và report. Các Scenario thường vẫn giữ tag ID.

| Nhóm | File | Test case |
| --- | --- | --- |
| Form, họ tên và hiển thị hồ sơ | `add-employee/add-employee-form.feature` | AE_P01–AE_P04, AE_N01–AE_N04, AE_N06–AE_N07, AE_B01–AE_B06, AE_U01, AE_U05–AE_U06 |
| Employee Id | `add-employee/employee-id.feature` | AE_N05, AE_P06–AE_P09, AE_B07–AE_B08 |
| Login Details | `add-employee/login-details.feature` | AE_U02–AE_U03, AE_P11–AE_P12, AE_P19, AE_N16–AE_N21, AE_B09–AE_B13, AE_L02–AE_L04 |
| Ảnh đại diện | `add-employee/profile-photo.feature` | AE_N08–AE_N15, AE_P13–AE_P18 |
| Điều hướng và Employee List | `add-employee/employee-navigation.feature` | AE_U04, AE_P05, AE_P10, AE_P20, AE_N22 |
| Chưa đăng nhập mở Add Employee | `login/login.feature` | AE_L01 |

Dữ liệu test cố định lấy theo test case. Để chạy lại nhiều lần trên demo dùng chung, scenario nào tạo Employee Id hoặc Username cố định sẽ dọn trước bằng step `Given no employee uses Employee Id "..."` / `Given no user account uses Username "..."` (tìm và xoá bản ghi trùng ngay trên giao diện: PIM > Employee List hoặc Admin > System Users). Ảnh và file mẫu dùng cho các case upload nằm trong `test-data/photos/`.

Test case không ghi Employee Id thì giữ Id gợi ý, nhưng trước khi nhập sẽ chạy `Given the suggested Employee Id is not used yet`: nếu Id gợi ý đã có người dùng thì tải lại form lấy Id mới (tối đa 3 lần).

Chạy toàn bộ Add Employee:

    npm run test:add-employee

Chạy theo nhóm (chỉ trong Add Employee):

    npm run test:validation
    npm run test:employee-id
    npm run test:login-details
    npm run test:photo
    npm run test:ui
    npm run test:positive
    npm run test:boundary

Mỗi dòng `Examples` có tag ID riêng, nên lọc được như scenario thường:

    npx cucumber-js --tags "@AE_N02"

## Sprint 2: Personal Details

| Feature | Phạm vi |
| --- | --- |
| `personal-details/personal-details.feature` | Personal Details: ED_01–02 và ED_20–136 |
| `personal-details/profile-picture.feature` | Ảnh đại diện: ED_03–19 |

Trong `personal-details.feature`, các khu vực được nhóm bằng `Rule`: Employee Name/Id, Other Id, License, Nationality/Marital Status, Date of Birth, Gender/Attachments và trạng thái lưu/truy cập.

Tag `@personalDetails` lọc toàn bộ testcase của màn này; có thể lọc theo tag chức năng như `@license-expiry`, `@nationality`, `@date-of-birth`, `@attachments`, hoặc theo ID như `@ED_131`. Ảnh đại diện lọc bằng `@profile-picture`.

- Mỗi `Rule` bắt đầu bằng `Given I am logged in and on the Personal Details page of employee "..."` với nhân viên test `56412`, `56414` hoặc `56415` (khai báo trong `support/testData.ts`). Nhân viên bị xoá trên demo sẽ được tạo lại.
- ED_02 tạo nhân viên mới với Employee Id tự sinh.
- ED_58 và ED_66 cần dữ liệu của nhân viên phụ để kiểm tra giá trị định danh trùng.
- Data ngày trong feature theo định dạng testcase `yyyy-dd-mm`; `PersonalDetailsPage` đổi sang định dạng đang cấu hình trên OrangeHRM khi nhập và kiểm tra.

## Sprint 3: Employee List

| Feature | Phạm vi |
| --- | --- |
| `employee-list/employee-list.feature` | Employee Name, Employee Id, Employment Status, Include mặc định: EL_01–EL_12 |
| `employee-list/employee-list.feature` | Include, Reset, Supervisor Name: EL_13, EL_15–EL_20, EL_22–EL_24 |

Tag `@employeeList` lọc toàn bộ testcase của màn này; lọc theo chức năng bằng `@employee-name`, `@employee-id`, `@employment-status`, `@include`, `@supervisor-name`, hoặc theo ID như `@EL_04`.

- Mỗi scenario bắt đầu bằng `Given I am logged in and on the Employee List page`.
- Nhân viên test: `56420` Shii Hoshino (hiện tại) và `56421` Shii Yorukawa (đã nghỉ việc), khai báo trong `support/testData.ts`. Step `Given the current employee "..." exists` / `Given the past employee "..." exists` kiểm tra qua API và tạo lại nếu bị xoá, đổi tên hoặc sai trạng thái. Thao tác cần kiểm thử vẫn làm trên giao diện.
- EL_09 gán Employment Status cho nhân viên `56420` trước khi lọc, để luôn có ít nhất một kết quả.
- EL_06 xoá mọi nhân viên có Employee Id chứa `99999999` (ô Employee Id tìm theo kiểu "chứa chuỗi").
- EL_07, EL_10, EL_12 đối chiếu `(N) Records Found` với số nhân viên lấy từ API. Demo dùng chung nên số có thể đổi giữa hai lần đọc; lệch thì tìm lại tối đa 3 lần.
- EL_04: BA (US-02 AC3, VR-01) yêu cầu báo "Invalid" khi gõ tên mà không chọn gợi ý, nhưng OrangeHRM 5.9 tìm theo phần tên đã gõ; scenario theo Expected Output của test case.
- EL_14 và EL_21 không có Automation Feasibility trong file test case nên không viết scenario.
- Scenario có tag `@employee-list-data` chạy Before hook trong `support/employeeListData.ts`: lần đầu trong mỗi lần chạy, hook đăng nhập API riêng và tạo `56422` Shii Senpai, `56423` Shii Kouhai (Supervisor là Shii Senpai), `56424` Shii Sayonara (đã nghỉ việc); AfterAll xoá ba nhân viên này.
- EL_16, EL_22, EL_24 ghi lại bảng kết quả trước khi thao tác, sau đó kiểm tra số bản ghi, cột Id không đổi và không có request tìm kiếm nào được gửi.
- EL_22, EL_24 theo BA VR-02: gõ Supervisor Name mà không chọn gợi ý thì báo "Invalid", viền đỏ và không tìm kiếm. EL_24 thử số, ký tự đặc biệt và tên có nhiều khoảng trắng.
