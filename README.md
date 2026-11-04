# OrangeHRM Automation

Framework kiểm thử UI cho OrangeHRM dùng Cucumber (Gherkin) + Playwright + TypeScript.
Phần nền: đăng nhập và mở màn **PIM > Add Employee**.

## Cấu trúc

- features/: các file Gherkin được chia theo nhóm `add-employee-form`, `employee-id`, `login-details`, `profile-photo`, `employee-navigation`; `login.feature` chứa kiểm thử đăng nhập chung.
- steps/: step definitions.
  - `login.steps.ts`: các bước đăng nhập.
  - `employee.steps.ts`: step dùng chung `Given I am logged in and on the Add Employee page`.
- pages/: Page Objects (`LoginPage`, `DashboardPage`, `AddEmployeePage`).
- support/
  - `config.ts`: đọc URL, browser, headless, tài khoản từ biến môi trường.
  - `world.ts`: CustomWorld, khởi tạo các Page Object.
  - `hooks.ts`: mở/đóng browser, chụp ảnh sau mỗi step.
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

## Quản lý thông tin đăng nhập

- Tài khoản **không** được viết trong code hay file .feature; chỉ đọc qua `config.username` / `config.password`.
- File `.env` đã nằm trong `.gitignore`, không bao giờ commit lên GitHub.
- Trên GitHub Actions: vào **Settings > Secrets and variables > Actions**, tạo 2 secret
  `ORANGEHRM_USERNAME` và `ORANGEHRM_PASSWORD`.
- Nếu thiếu biến, test báo lỗi rõ ràng: `Thiếu biến môi trường ...`.

## Chạy kiểm thử

    npm test              # chạy tất cả
    npm run test:smoke    # chỉ các scenario @smoke
    npm run test:login    # chỉ feature đăng nhập
    npm run test:dry      # kiểm tra step đã được định nghĩa đủ, không mở browser
    npm run typecheck     # kiểm tra lỗi TypeScript

Chạy theo tag tuỳ ý:

    npx cucumber-js --tags "@yourTag"

Mở báo cáo sau khi chạy:

    start .\test-results\cucumber-report.html

## Bàn giao cho người 2 và người 3

1. Tạo file feature mới trong `features/` (ví dụ `add-employee.feature`), gắn tag riêng.
2. Bắt đầu scenario bằng step có sẵn để vào thẳng màn Add Employee:

        Scenario: Add a new employee with required fields
          Given I am logged in and on the Add Employee page
          When ...

3. Viết thêm hàm thao tác form vào `pages/AddEmployeePage.ts` (hoặc tạo Page Object mới
   và khai báo trong `support/world.ts`).
4. Viết step trong `steps/` với tên file dạng `*.steps.ts`.
5. Thêm lệnh chạy riêng trong `package.json` nếu cần, ví dụ:
   `"test:add-employee": "cucumber-js --tags @addEmployee"`.

## Các kịch bản Add Employee

Mỗi TC có tag ID (`@AE_...`) để chạy riêng và truy vết trong report. Các trường hợp có cùng luồng dùng `Scenario Outline` với từng TC ở khối `Examples` riêng.

| Nhóm | File | Test case |
| --- | --- | --- |
| Form, họ tên và hiển thị hồ sơ | `add-employee-form.feature` | AE_P01–AE_P04, AE_N01–AE_N04, AE_B01–AE_B06, AE_U01, AE_U05, AE_U06 |
| Employee Id | `employee-id.feature` | AE_N05, AE_P05–AE_P08, AE_B07–AE_B08 |
| Login Details | `login-details.feature` | AE_U02–AE_U03, AE_P09–AE_P10, AE_N08–AE_N13, AE_B09–AE_B13, AE_L02–AE_L04 |
| Ảnh đại diện | `profile-photo.feature` | AE_N06–AE_N07, AE_P11–AE_P12 |
| Điều hướng và Employee List | `employee-navigation.feature` | AE_U04, AE_P13, AE_N14 |
| Chưa đăng nhập mở Add Employee | `login.feature` | AE_L01 |

Dữ liệu test cố định, lấy theo test case. Để chạy lại nhiều lần trên demo dùng chung, scenario nào tạo Employee Id hoặc Username cố định sẽ dọn trước bằng step `Given no employee uses Employee Id "..."` / `Given no user account uses Username "..."` (xoá bản ghi trùng qua API của OrangeHRM, xem `support/testData.ts`). File ảnh dùng cho AE_P11, AE_N06 và AE_N07 nằm trong `test-data/photos/`.

Test case không ghi Employee Id thì giữ Id gợi ý, nhưng trước khi nhập sẽ chạy `Given the suggested Employee Id is not used yet`: nếu Id gợi ý đã có người dùng thì tải lại form lấy Id mới (tối đa 3 lần).

Before hook ghi Test Case ID từ tag `@AE_...` vào report HTML. Một số Scenario Outline còn đưa ID vào tên hiển thị bằng cột `Test Case`; các outline khác vẫn truy vết theo tag.

Chạy toàn bộ Add Employee:

    npm run test:add-employee

Chạy theo nhóm:

    npm run test:validation
    npm run test:employee-id
    npm run test:login-details
    npm run test:photo
    npm run test:ui
    npm run test:positive
    npm run test:boundary

Chạy riêng một test case:

    npx cucumber-js --tags "@AE_N02"
