# OrangeHRM Automation

Framework kiểm thử UI cho OrangeHRM dùng Cucumber (Gherkin) + Playwright + TypeScript.
Phần nền: đăng nhập và mở màn **PIM > Add Employee**.

## Cấu trúc

- features/: file Gherkin (.feature). `login.feature` là feature đăng nhập.
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

Mỗi test case có tag riêng theo ID (`@AE_P01`, `@AE_N02`...). Các test case cùng dạng được gom thành Scenario Outline, mỗi khối `Examples` là một test case và mang tag của test case đó.

| Nhóm | Tag nhóm | Test case | File |
| --- | --- | --- | --- |
| Tạo nhân viên với Id gợi ý | `@smoke` | AE_P01 | add-employee.feature |
| Validation tên, Employee Id | `@validation` | AE_N01, AE_N02, AE_N03, AE_N04, AE_N05, AE_B06, AE_B08 | add-employee.feature |
| Employee Id | `@employee-id` | AE_P06, AE_P07, AE_P08, AE_B07 | add-employee.feature |
| Create Login Details | `@login-details` | AE_P09, AE_P10, AE_B09, AE_L02 | add-employee.feature |
| Ảnh đại diện | `@photo` | AE_N06, AE_N07 | add-employee.feature |
| Giao diện form | `@ui` | AE_U01, AE_U02, AE_U03, AE_U04, AE_U05, AE_U06 | add-employee.feature |
| Dữ liệu tên hợp lệ, Id tự đặt | `@positive` | AE_P02, AE_P03, AE_P04, AE_P05 | add-employee.feature |
| Giới hạn 30 ký tự của họ tên | `@boundary` | AE_B01, AE_B02, AE_B03, AE_B04, AE_B05 | add-employee.feature |
| Chưa đăng nhập mở Add Employee | `@addEmployee` | AE_L01 | login.feature |

Dữ liệu test cố định, lấy theo test case. Để chạy lại nhiều lần trên demo dùng chung, scenario nào tạo Employee Id hoặc Username cố định sẽ dọn trước bằng step `Given no employee uses Employee Id "..."` / `Given no user account uses Username "..."` (xoá bản ghi trùng qua API của OrangeHRM, xem `support/testData.ts`). File ảnh dùng cho AE_N06, AE_N07 nằm trong `test-data/photos/`.

Test case không ghi Employee Id thì giữ Id gợi ý, nhưng trước khi nhập sẽ chạy `Given the suggested Employee Id is not used yet`: nếu Id gợi ý đã có người dùng thì tải lại form lấy Id mới (tối đa 3 lần).

Mỗi scenario có Test Case ID (tag `@AE_...`) ghi ở đầu report HTML; Scenario Outline mới có cột `Test Case` nên tên scenario hiện luôn ID, ví dụ `AE_B03 - Accept a name with exactly 30 characters`.

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
