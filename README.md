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

Các test case manual được tự động hóa trong feature hiện tại:

- `AE_P01`: tạo nhân viên với Employee Id hệ thống gợi ý.
- `AE_N01`: kiểm tra First Name và Last Name bắt buộc.
- `AE_N04`: từ chối Employee Id trùng. Scenario tự tạo nhân viên nền bằng màn Add Employee rồi thử lưu nhân viên thứ hai với cùng Id; không dùng Employee List.
- `AE_P03`: tạo nhân viên khi bật Create Login Details rồi xác nhận tài khoản mới đăng nhập được.

Mỗi lần chạy sẽ tạo nhân viên trên demo; `AE_P03` còn tạo tài khoản đăng nhập. Demo có thể giữ lại hoặc reset dữ liệu. Dùng tài khoản có quyền PIM và không commit file `.env`.

Chạy toàn bộ scenario Add Employee đã chọn:

    npm run test:add-employee

Chạy riêng từng case:

    npm run test:ae-p01
    npm run test:ae-n01
    npm run test:ae-n04
    npm run test:ae-p03
