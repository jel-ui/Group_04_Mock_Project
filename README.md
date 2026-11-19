# OrangeHRM Automation - Sprint 2

Framework kiểm thử UI cho OrangeHRM dùng Cucumber (Gherkin) + Playwright + TypeScript.
Sprint 2: màn **PIM > Employee > Personal Details**.

## Cấu trúc

- `features/login.feature`: các testcase đăng nhập.
- `features/personal-details.feature`: các testcase thuộc màn Personal Details, được nhóm bằng `Rule`.
- `features/profile-picture.feature`: các testcase đổi và kiểm tra ảnh đại diện.
- steps/: step definitions.
  - `login.steps.ts`: các bước đăng nhập.
  - `personal-details.steps.ts`: step dùng chung của màn Personal Details (mở trang, Save, toast, lỗi field).
  - `other-details.steps.ts`: Other Id, Driver's License, ngày, Nationality, Marital Status.
- pages/: Page Objects (`LoginPage`, `DashboardPage`, `EmployeeListPage`, `AddEmployeePage`, `PersonalDetailsPage`).
- support/
  - `config.ts`: đọc URL, browser, headless, tài khoản từ biến môi trường.
  - `world.ts`: CustomWorld, khởi tạo các Page Object, mở Personal Details theo Employee Id.
  - `hooks.ts`: mở/đóng browser, chụp ảnh cuối mỗi scenario, ghi Test Case ID vào report.
  - `pageLoad.ts`: chờ trang load xong trước khi kiểm tra.
  - `testData.ts`: nhân viên test của từng phần.
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

Trên GitHub Actions: vào **Settings > Secrets and variables > Actions**, tạo 2 secret `ORANGEHRM_USERNAME` và `ORANGEHRM_PASSWORD`.

## Chạy kiểm thử

    npm test                        # chạy tất cả
    npm run test:personal-details   # chỉ màn Personal Details
    npm run test:dry                # kiểm tra step đã được định nghĩa đủ, không mở browser
    npm run typecheck               # kiểm tra lỗi TypeScript

Chạy theo tag:

    npx cucumber-js --tags "@license-expiry and @validation"

Chạy riêng một dòng `Examples` theo ID:

    npx cucumber-js --name "ED_71"

## Thêm phần mới

1. Bắt đầu scenario bằng step có sẵn để vào thẳng Personal Details của nhân viên test:

        Background:
          Given I am logged in and on the Personal Details page of employee "56412"

   Mỗi người nên dùng một Employee Id riêng (khai báo trong `support/testData.ts`) để không sửa đè dữ liệu của nhau.
2. Thêm hàm thao tác vào `pages/PersonalDetailsPage.ts` (hoặc Page Object mới, khai báo trong `support/world.ts`).
3. Viết step trong file `steps/*.steps.ts` riêng của phần mình.

## Feature files và dải Test Case ID

| Feature | Phạm vi |
| --- | --- |
| `login.feature` | Các testcase đăng nhập |
| `personal-details.feature` | Personal Details: ED_01–02 và ED_20–136 |
| `profile-picture.feature` | Ảnh đại diện: ED_03–19 |

Trong `personal-details.feature`, các khu vực được nhóm bằng `Rule`: Employee Name/Id, Other Id, License, Nationality/Marital Status, Date of Birth, Gender/Attachments và trạng thái lưu/truy cập. ID được ghi trong tên scenario hoặc từng dòng `Examples`, để report giữ được mã testcase của Excel.

Tag `@personalDetails` lọc toàn bộ testcase của màn này; có thể lọc theo tag chức năng như `@license-expiry`, `@nationality`, `@date-of-birth`, `@attachments`, hoặc theo ID như `@ED_131`. Các testcase trong `profile-picture.feature` có thể lọc bằng `@profile-picture`.

- Nhân viên test dùng trong các nhóm là `56412`, `56414` hoặc `56415` theo Background của từng `Rule`. ED_02 tạo nhân viên mới với Employee Id tự sinh.
- ED_58 và ED_66 cần dữ liệu của nhân viên phụ để kiểm tra giá trị định danh trùng.
- Data ngày trong feature theo định dạng testcase `yyyy-dd-mm`; `PersonalDetailsPage` đổi sang định dạng đang cấu hình trên OrangeHRM khi nhập và kiểm tra.
- File upload cho testcase nằm dưới `test-data/attachments/` và `test-data/profile-pictures/`.
