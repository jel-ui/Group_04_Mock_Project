import path from 'path';
import { expect, type Page } from '@playwright/test';

export class AddEmployeePage {
    constructor(private readonly page: Page) {}

    // ---------- Locator ----------

    heading() {
        return this.page.getByRole('heading', { name: 'Add Employee' });
    }

    firstNameInput() {
        return this.page.getByRole('textbox', { name: 'First Name' });
    }

    middleNameInput() {
        return this.page.getByRole('textbox', { name: 'Middle Name' });
    }

    lastNameInput() {
        return this.page.getByRole('textbox', { name: 'Last Name' });
    }

    // Label Employee Id, Username, Password, Confirm Password không gắn với ô nhập nên không dùng getByLabel được.
    // Cách lấy: tìm khung field (.oxd-input-group) có label đó, rồi lấy ô input bên trong.
    private fieldBox(label: string) {
        return this.page.locator('.oxd-input-group').filter({ has: this.page.getByText(label, { exact: true }) });
    }

    employeeIdInput() {
        return this.fieldBox('Employee Id').locator('input');
    }

    createLoginDetailsCheckbox() {
        return this.page.getByRole('checkbox');
    }

    // Ô checkbox bị ẩn, phải bấm vào nút gạt bao ngoài nó.
    createLoginDetailsSwitch() {
        return this.page.locator('label').filter({ has: this.createLoginDetailsCheckbox() });
    }

    usernameInput() {
        return this.fieldBox('Username').locator('input');
    }

    statusRadio(status: string) {
        return this.page.getByRole('radio', { name: status });
    }

    // Ô radio bị ẩn, nhãn bao ngoài mới là phần nhìn thấy và bấm được.
    statusOption(status: string) {
        return this.page.locator('label').filter({ has: this.statusRadio(status) });
    }

    passwordInput() {
        return this.fieldBox('Password').locator('input');
    }

    confirmPasswordInput() {
        return this.fieldBox('Confirm Password').locator('input');
    }

    saveButton() {
        return this.page.getByRole('button', { name: 'Save' });
    }

    cancelButton() {
        return this.page.getByRole('button', { name: 'Cancel' });
    }

    successToast() {
        return this.page.getByText('Successfully Saved', { exact: true });
    }

    // Ô chọn file ảnh bị ẩn sau nút +, setInputFiles() vẫn dùng được.
    photoInput() {
        return this.page.locator('input[type="file"]');
    }

    // Khung ảnh đại diện: ảnh, nút + và ô chọn file.
    private photoBox() {
        return this.page.locator('.oxd-input-group').filter({ has: this.photoInput() });
    }

    // Dòng lỗi đỏ dưới khung ảnh đại diện.
    photoError() {
        return this.photoBox().locator('.oxd-input-field-error-message');
    }

    // Dấu * của OrangeHRM là class oxd-input-field-required trên label (CSS vẽ dấu *), không phải chữ.
    // Ô tên: chỉ xét label của riêng ô đó, không tính label chung "Employee Full Name".
    requiredMarker(fieldName: string) {
        if (this.isNameField(fieldName)) {
            return this.page.locator('.oxd-input-group')
                .filter({ has: this.page.getByRole('textbox', { name: fieldName }) })
                .last()
                .locator('.oxd-input-group__label-wrapper .oxd-input-field-required');
        }
        return this.fieldBox(fieldName).locator('.oxd-input-field-required');
    }

    fullNameRequiredMarker() {
        return this.page.locator('.oxd-input-field-required', { hasText: 'Employee Full Name' });
    }

    // Tiêu đề hồ sơ ở trang Personal Details sau khi lưu.
    profileHeading(name: string) {
        return this.page.getByRole('heading', { name, exact: true });
    }

    private isNameField(fieldName: string) {
        return fieldName === 'First Name' || fieldName === 'Middle Name' || fieldName === 'Last Name';
    }

    // Ô nhập theo tên field trên màn hình, ví dụ 'First Name', 'Employee Id', 'Password'.
    fieldInput(fieldName: string) {
        if (this.isNameField(fieldName)) {
            return this.page.getByRole('textbox', { name: fieldName });
        }
        return this.fieldBox(fieldName).locator('input');
    }

    // Dòng lỗi màu đỏ dưới field.
    fieldError(fieldName: string) {
        if (this.isNameField(fieldName)) {
            // 3 ô tên nằm chung khung "Employee Full Name", .last() để lấy khung nhỏ của riêng ô đó
            return this.page.locator('.oxd-input-group')
                .filter({ has: this.page.getByRole('textbox', { name: fieldName }) })
                .last()
                .locator('.oxd-input-field-error-message');
        }
        return this.fieldBox(fieldName).locator('.oxd-input-field-error-message');
    }

    // ---------- Thao tác ----------

    // Cần baseURL = https://opensource-demo.orangehrmlive.com và đã đăng nhập.
    async open() {
        await this.page.goto('/web/index.php/pim/addEmployee');
        await this.expectVisible();
    }

    // Chỉ mở URL, không kiểm tra form (dùng khi chưa đăng nhập, AE_L01).
    async openUrl() {
        await this.page.goto('/web/index.php/pim/addEmployee');
    }

    // Mở Add Employee từ menu PIM (dùng trong steps/employee.steps.ts).
    async openFromPimMenu() {
        await this.page.getByRole('link', { name: 'Add Employee' }).click();
    }

    async enterFirstName(firstName: string) {
        await this.firstNameInput().fill(firstName);
    }

    async enterMiddleName(middleName: string) {
        await this.middleNameInput().fill(middleName);
    }

    async enterLastName(lastName: string) {
        await this.lastNameInput().fill(lastName);
    }

    // fill() tự xóa Employee Id gợi ý trước khi nhập.
    async enterEmployeeId(employeeId: string) {
        await this.employeeIdInput().fill(employeeId);
    }

    async getEmployeeId() {
        await expect(this.employeeIdInput()).not.toHaveValue('');
        return this.employeeIdInput().inputValue();
    }

    async turnOnCreateLoginDetails() {
        if (!(await this.createLoginDetailsCheckbox().isChecked())) {
            await this.createLoginDetailsSwitch().click();
        }
        await expect(this.usernameInput()).toBeVisible();
    }

    async turnOffCreateLoginDetails() {
        if (await this.createLoginDetailsCheckbox().isChecked()) {
            await this.createLoginDetailsSwitch().click();
        }
        await expect(this.usernameInput()).toBeHidden();
    }

    async enterUsername(username: string) {
        await this.usernameInput().fill(username);
    }

    // status: 'Enabled' hoặc 'Disabled'
    async selectStatus(status: string) {
        await this.statusOption(status).click();
        await expect(this.statusRadio(status)).toBeChecked();
    }

    async enterPassword(password: string) {
        await this.passwordInput().fill(password);
    }

    async enterConfirmPassword(confirmPassword: string) {
        await this.confirmPasswordInput().fill(confirmPassword);
    }

    async clickSave() {
        await this.saveButton().click();
    }

    async clickCancel() {
        await this.cancelButton().click();
    }

    // fileName là tên file trong thư mục test-data/photos, ví dụ 'F06_document.pdf'.
    async uploadPhoto(fileName: string) {
        await this.photoInput().setInputFiles(path.join(process.cwd(), 'test-data', 'photos', fileName));
    }

    // Nhận bảng data từ feature. Cột nào không có hoặc để trống thì bỏ qua ô đó.
    // Tên cột: First Name, Middle Name, Last Name, Employee Id
    async enterEmployeeDetails(details: Record<string, string>) {
        if (details['First Name']) await this.enterFirstName(details['First Name']);
        if (details['Middle Name']) await this.enterMiddleName(details['Middle Name']);
        if (details['Last Name']) await this.enterLastName(details['Last Name']);
        if (details['Employee Id']) await this.enterEmployeeId(details['Employee Id']);
    }

    // Bật Create Login Details rồi nhập phần login.
    // Tên cột: Username, Status, Password, Confirm Password
    async enterLoginDetails(details: Record<string, string>) {
        await this.turnOnCreateLoginDetails();
        await this.enterUsername(details['Username']);
        if (details['Status']) await this.selectStatus(details['Status']);
        await this.enterPassword(details['Password']);
        await this.enterConfirmPassword(details['Confirm Password']);
    }

    // ---------- Xác nhận ----------

    async expectVisible() {
        await expect(this.page).toHaveURL(/\/pim\/addEmployee$/, { timeout: 30000 });
        await expect(this.heading()).toBeVisible({ timeout: 30000 });
        await expect(this.firstNameInput()).toBeVisible();
    }

    // Field hiện đúng thông báo lỗi và có viền đỏ.
    async expectFieldError(fieldName: string, message: string) {
        // Lỗi "Employee Id already exists" phải chờ server kiểm tra nên cho thời gian chờ dài hơn.
        await expect(this.fieldError(fieldName)).toHaveText(message, { timeout: 15000 });
        await expect(this.fieldInput(fieldName)).toHaveClass(/oxd-input--error/);
    }

    // Field hiển thị trên form (Status là nhóm radio nên kiểm tra cả khung field).
    async expectFieldShown(fieldName: string) {
        const field = this.isNameField(fieldName) ? this.fieldInput(fieldName) : this.fieldBox(fieldName);
        await expect(field, `Field "${fieldName}" should be shown`).toBeVisible();
    }

    async expectRequiredMarker(fieldName: string, required: boolean) {
        if (!required) {
            await expect(this.requiredMarker(fieldName), `Field "${fieldName}" should not show "*"`).toHaveCount(0);
            return;
        }
        // Ghi rõ khác biệt với DOM để báo cáo FAIL dễ đọc (AE_U01: TC ghi First/Last có *, BA 4.2 ghi "Employee Full Name*").
        const domNote = this.isNameField(fieldName) && (await this.fullNameRequiredMarker().count()) > 0
            ? ' Actual DOM: "*" is only on the group label "Employee Full Name".'
            : '';
        await expect(this.requiredMarker(fieldName), `Field "${fieldName}" should show its own "*".${domNote}`).toHaveCount(1);
    }

    async expectFieldValue(fieldName: string, value: string) {
        // Trang Personal Details tải dữ liệu sau khi hiện form nên cho chờ lâu hơn.
        await expect(this.fieldInput(fieldName)).toHaveValue(value, { timeout: 15000 });
    }

    async expectPhotoPickerShown() {
        await expect(this.photoBox().locator('img')).toBeVisible();
        // Ô input file cũng có role button nên lấy nút + theo class.
        await expect(this.photoBox().locator('.employee-image-action')).toBeVisible();
    }

    async expectCreateLoginDetailsOff() {
        await expect(this.createLoginDetailsSwitch()).toBeVisible();
        await expect(this.createLoginDetailsCheckbox()).not.toBeChecked();
        await expect(this.usernameInput()).toBeHidden();
    }

    async expectButtonShown(name: string) {
        await expect(this.page.getByRole('button', { name, exact: true })).toBeVisible();
    }

    async expectTextShown(text: string, exact = true) {
        await expect(this.page.getByText(text, { exact })).toBeVisible();
    }

    async expectStatusOptionShown(status: string) {
        await expect(this.statusOption(status)).toBeVisible();
    }

    async expectStatusSelected(status: string) {
        await expect(this.statusRadio(status)).toBeChecked();
    }

    async expectProfileHeading(name: string) {
        await this.expectSaved();
        await expect(this.profileHeading(name)).toBeVisible({ timeout: 45000 });
    }

    async expectPhotoError(message: string) {
        await expect(this.photoError()).toHaveText(message);
    }

    // Form Add Employee không hiển thị (vd. khi chưa đăng nhập).
    async expectFormHidden() {
        await expect(this.heading()).toHaveCount(0);
        await expect(this.firstNameInput()).toHaveCount(0);
    }

    // Không lưu: vẫn ở màn Add Employee, không có toast thành công.
    async expectNotSaved() {
        await expect(this.page).toHaveURL(/\/pim\/addEmployee$/);
        await expect(this.successToast()).toHaveCount(0);
    }

    // Toast tự ẩn sau vài giây nên gọi ngay sau clickSave().
    async expectSuccessToast() {
        await expect(this.successToast()).toBeVisible();
    }

    // Lưu thành công thì chuyển sang trang Personal Details.
    // Demo có lúc chậm (chuyển trang mất ~15s, tải xong dữ liệu ~25s) nên chờ lâu hơn mặc định.
    async expectSaved() {
        await expect(this.page).toHaveURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+/, { timeout: 60000 });
    }

    // Trang Personal Details dùng lại các ô cùng tên nên kiểm tra được bằng locator của trang này.
    async expectSavedEmployee(firstName: string, middleName: string, lastName: string, employeeId: string) {
        await this.expectSaved();
        await expect(this.profileHeading(firstName + ' ' + lastName)).toBeVisible({ timeout: 45000 });
        await expect(this.firstNameInput()).toHaveValue(firstName, { timeout: 15000 });
        await expect(this.middleNameInput()).toHaveValue(middleName);
        await expect(this.lastNameInput()).toHaveValue(lastName);
        await expect(this.employeeIdInput()).toHaveValue(employeeId);
    }
}
