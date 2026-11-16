# OrangeHRM Automation - Sprint 2

Framework kiểm thử UI cho OrangeHRM dùng Cucumber (Gherkin) + Playwright + TypeScript.
Sprint 2: màn **PIM > Employee > Personal Details**.

## Cấu trúc

- features/: các file Gherkin, mỗi phần một file riêng (tiền tố `personal-`). `login.feature` chứa kiểm thử đăng nhập chung.
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

## Other Id, Driver's License, ngày, Nationality, Marital Status (ED_52–ED_87)

| Nhóm | File | Test case |
| --- | --- | --- |
| Other Id | `personal-other-id.feature` | ED_52–ED_60 |
| Driver's License Number, License Expiry Date | `personal-license.feature` | ED_61–ED_76 |
| Nationality, Marital Status | `personal-nationality-marital.feature` | ED_77–ED_78 |
| Date of Birth | `personal-date-of-birth.feature` | ED_79–ED_87 |

Tag: `@personalDetails` cho cả màn; nhóm `@other-id`, `@license`, `@license-expiry`, `@nationality`, `@marital-status`, `@date-of-birth`; loại `@positive`, `@validation`, `@boundary`. Scenario thường có thêm tag ID (`@ED_55`), dòng Examples có ID trong tên scenario.

- Nhân viên test là `Shii Chan` (Employee Id `56412`). Demo dùng chung nên nhân viên có thể bị xoá, step mở Personal Details sẽ tìm theo Id ở Employee List và tự tạo lại nếu không còn.
- ED_58 và ED_66 cần một nhân viên khác (`Shii Neko`, `56413`) đã có Other Id / Driver's License Number trùng giá trị nhập.
- Lưu thành công thì tải lại trang và kiểm tra field vẫn giữ giá trị.
- Data ngày trong feature viết theo test case (yyyy-dd-mm). Format ngày do Admin cài đặt và có thể bị đổi trên demo, nên `PersonalDetailsPage` đọc format từ placeholder của ô ngày, đổi data sang format đó khi nhập và khi kiểm tra. Câu lỗi ngày sai cũng lấy theo format này.
- ED_55, ED_65: nhập toàn khoảng trắng, web báo toast "Invalid Parameter".


## Personal Details - Name and Employee Id (ED_01-02, ED_20-51, ED_102-103)

Run: `npm.cmd run test:personal-identity`. Dry run: `npm.cmd run test:personal-identity:dry`. Report: `npm.cmd run report:personal-identity`.
See [handover](docs/personal-identity-handover.md), [results](docs/personal-identity-last-run.md) and [test data](test-data/personal-name-id.json).
