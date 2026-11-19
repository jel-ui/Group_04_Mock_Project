import { After, DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';
import { CustomWorld } from '../support/world';

// ---------- Giao diện (ED_01, ED_02) ----------

Then('the Personal Details form shows the fields:', async function (this: CustomWorld, fields: DataTable) {
    for (const [label] of fields.raw()) {
        await this.personalDetailsPage.expectFieldDisplayed(label);
    }
});

Then('the {string} section is displayed', async function (this: CustomWorld, title: string) {
    await this.personalDetailsPage.expectSectionDisplayed(title);
});

Then('the Personal Details and Custom Fields sections each have a Save button', async function (this: CustomWorld) {
    await this.personalDetailsPage.expectSaveButtons();
});

// ED_02: hồ sơ mới tạo, Employee Id tự sinh theo timestamp (theo Phụ lục A của BA), tối đa 10 ký tự.
When('I add a new employee {string} {string} with a generated Employee Id', async function (
    this: CustomWorld,
    firstName: string,
    lastName: string
) {
    const employeeId = 'ED' + Date.now().toString().slice(-8);
    await this.addEmployeePage.open();
    await this.addEmployeePage.addEmployee(firstName, lastName, employeeId);
    await this.personalDetailsPage.expectVisible(employeeId);
    this.employeeId = employeeId;
    this.scenarioData['generated-employee-id'] = employeeId;
});

Then('the "Employee Id" field has the generated Employee Id', async function (this: CustomWorld) {
    await this.personalDetailsPage.expectFieldValue('Employee Id', this.scenarioData['generated-employee-id']);
});

// ---------- Họ tên ----------

Then('the employee name in the left column shows the First Name and Last Name', async function (this: CustomWorld) {
    await this.personalDetailsPage.expectEmployeeNameIsFirstAndLast();
});

// ---------- Employee Id ----------

// Nhân viên A (ED_47-49): mở để tìm hoặc tạo lại nếu đã bị xoá, rồi quay lại nhân viên đang test.
Given('employee {string} exists', async function (this: CustomWorld, otherEmployeeId: string) {
    const employeeId = this.currentEmployeeId();
    await this.openPersonalDetails(otherEmployeeId);
    await this.openPersonalDetails(employeeId);
});

// Ghi lại Employee Id gốc để After hook trả lại sau scenario,
// vì step mở Personal Details tìm nhân viên test theo Employee Id.
When('I change the Employee Id to {string}', async function (this: CustomWorld, employeeId: string) {
    if (!this.employeeId) {
        await this.addEmployeePage.enterEmployeeId(employeeId);
        if (this.employeeUnderTest) this.employeeUnderTest.employeeId = employeeId;
        return;
    }
    if (this.scenarioData['original-employee-id'] === undefined) {
        this.scenarioData['original-employee-id'] = this.currentEmployeeId();
        this.scenarioData['employee-url'] = this.page.url();
    }
    await this.personalDetailsPage.fillField('Employee Id', employeeId);
});

Then('the Employee Id {string} is kept after reloading the page', async function (this: CustomWorld, employeeId: string) {
    this.employeeId = employeeId;
    await this.personalDetailsPage.reload(employeeId);
});

After(async function (this: CustomWorld) {
    const originalId = this.scenarioData['original-employee-id'];
    const url = this.scenarioData['employee-url'];
    if (originalId === undefined || !url || !this.context) return;

    // Dùng tab mới để ảnh chụp cuối scenario vẫn là màn hình lúc test kết thúc.
    const restorePage = await this.context.newPage();
    try {
        const personalDetails = new PersonalDetailsPage(restorePage);
        await restorePage.goto(url);
        // First Name bắt buộc nên có giá trị khi dữ liệu đã tải xong.
        await expect(personalDetails.input('First Name')).not.toHaveValue('', { timeout: 60_000 });
        if ((await personalDetails.input('Employee Id').inputValue()) !== originalId) {
            await personalDetails.fillField('Employee Id', originalId);
            await personalDetails.clickSave();
            await personalDetails.expectToast('Successfully Updated');
        }
    } catch (error) {
        this.attach(
            `Could not restore Employee Id "${originalId}": ${(error as Error).message.split('\n')[0]}`,
            'text/plain'
        );
    } finally {
        await restorePage.close();
    }
});

// ---------- Save thất bại (ED_102) ----------

// Đưa dropdown về giá trị cần cho điều kiện trước; chỉ lưu khi đang khác.
Given('the {string} dropdown is saved as {string}', async function (this: CustomWorld, label: string, option: string) {
    const page = this.personalDetailsPage;
    if ((await page.dropdown(label).innerText()).trim() === option) return;
    await page.selectOption(label, option);
    await page.clickSave();
    await page.expectToast('Successfully Updated');
    await page.reload(this.currentEmployeeId());
});
