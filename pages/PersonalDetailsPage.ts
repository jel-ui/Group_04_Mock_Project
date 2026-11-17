import { expect, type Page } from '@playwright/test';
import { PAGE_LOAD_TIMEOUT, waitForPageLoad } from '../support/pageLoad';

// Tên field trên màn hình -> thuộc tính name của input họ tên.
const NAME_INPUTS: Record<string, string> = {
    'First Name': 'firstName',
    'Middle Name': 'middleName',
    'Last Name': 'lastName'
};

export class PersonalDetailsPage {
    constructor(private readonly page: Page) {}

    // ---------- Locator ----------

    heading() {
        return this.page.getByRole('heading', { name: 'Personal Details', exact: true });
    }

    // Form đầu tiên là Personal Details, bên dưới còn form Custom Fields.
    form() {
        return this.page.locator('form').first();
    }

    fieldBox(label: string) {
        const nameInput = NAME_INPUTS[label];
        if (nameInput) {
            // First/Middle/Last Name không có label riêng, mỗi ô là một input-group nằm dưới "Employee Full Name".
            return this.form().locator('.--name-grouped-field > .oxd-input-group').filter({
                has: this.page.locator(`input[name="${nameInput}"]`)
            });
        }
        return this.form().locator('.oxd-input-group').filter({
            has: this.page.locator('label').getByText(label, { exact: true })
        });
    }

    fieldLabel(label: string) {
        return this.form().locator('label').getByText(label, { exact: true });
    }

    // Tên nhân viên ở cột trái (First + Last Name).
    employeeName() {
        return this.page.locator('.orangehrm-edit-employee-name h6');
    }

    sectionHeading(title: string) {
        return this.page.getByRole('heading', { name: title, exact: true });
    }

    customFieldsSaveButton() {
        return this.page.locator('.orangehrm-custom-fields').getByRole('button', { name: 'Save' });
    }

    input(label: string) {
        return this.fieldBox(label).locator('input');
    }

    dropdown(label: string) {
        return this.fieldBox(label).locator('.oxd-select-text-input');
    }

    fieldError(label: string) {
        return this.fieldBox(label).locator('.oxd-input-field-error-message');
    }

    saveButton() {
        return this.form().getByRole('button', { name: 'Save' });
    }

    toast() {
        return this.page.locator('.oxd-toast');
    }

    formLoader() {
        return this.page.locator('.oxd-form-loader');
    }

    // ---------- Thao tác ----------

    async expectVisible(employeeId: string) {
        await waitForPageLoad(this.page, /\/pim\/viewPersonalDetails\/empNumber\/\d+$/, 'Personal Details');
        await expect(this.heading()).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
        await expect(this.formLoader()).toHaveCount(0, { timeout: PAGE_LOAD_TIMEOUT });
        await expect(this.input('Employee Id')).toHaveValue(employeeId, { timeout: PAGE_LOAD_TIMEOUT });
    }

    async reload(employeeId: string) {
        await this.page.reload();
        await this.expectVisible(employeeId);
    }

    async fillField(label: string, value: string) {
        await this.input(label).fill(value);
    }

    async fillDate(label: string, date: string) {
        await this.input(label).fill(await this.toSiteDate(date));
    }

    async pickToday(label: string) {
        await this.fieldBox(label).locator('.oxd-date-input-icon').click();
        await this.page.locator('.oxd-date-input-link').getByText('Today', { exact: true }).click();
    }

    async selectOption(label: string, option: string) {
        await this.dropdown(label).click();
        await this.page.getByRole('option', { name: option, exact: true }).click();
        await expect(this.dropdown(label)).toHaveText(option);
    }

    async clickSave() {
        await this.saveButton().click();
    }

    // ---------- Kiểm tra ----------

    async expectToast(message: string) {
        await expect(this.toast().filter({ hasText: message })).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    }

    async expectNoSuccessToast() {
        await expect(this.toast().filter({ hasText: 'Successfully Updated' })).toHaveCount(0);
    }

    async expectFieldError(label: string, message: string) {
        await expect(this.fieldError(label)).toHaveText(message);
        await expect(this.input(label)).toHaveClass(/oxd-input--error/);
    }

    async expectInvalidDateError(label: string) {
        await this.expectFieldError(label, `Should be a valid date in ${await this.dateFormat()} format`);
    }

    async expectFieldValue(label: string, value: string) {
        await expect(this.input(label)).toHaveValue(value);
    }

    async expectDateValue(label: string, date: string) {
        await expect(this.input(label)).toHaveValue(await this.toSiteDate(date));
    }

    async expectTodayValue(label: string) {
        await expect(this.input(label)).toHaveValue(await this.today());
    }

    async expectSelectedOption(label: string, option: string) {
        await expect(this.dropdown(label)).toHaveText(option);
    }

    // Employee Full Name gồm 3 ô First, Middle, Last Name; các field khác kiểm tra label.
    async expectFieldDisplayed(label: string) {
        await expect(this.fieldLabel(label)).toBeVisible();
        if (label === 'Employee Full Name') {
            for (const nameField of Object.keys(NAME_INPUTS)) await expect(this.input(nameField)).toBeVisible();
        }
    }

    async expectSectionDisplayed(title: string) {
        await expect(this.sectionHeading(title)).toBeVisible();
    }

    async expectSaveButtons() {
        await expect(this.saveButton()).toBeVisible();
        await expect(this.customFieldsSaveButton()).toBeVisible();
    }

    // Tên ở cột trái là First + Last Name, không có Middle Name.
    async expectEmployeeNameIsFirstAndLast() {
        const firstName = await this.input('First Name').inputValue();
        const lastName = await this.input('Last Name').inputValue();
        await expect(this.employeeName()).toHaveText(`${firstName} ${lastName}`);
    }

    // ---------- Ngày tháng ----------

    // Format ngày do Admin cài đặt và có thể bị đổi trên demo, nên đọc từ placeholder của ô ngày.
    async dateFormat() {
        return (await this.input('Date of Birth').getAttribute('placeholder')) ?? 'yyyy-mm-dd';
    }

    // Data ngày trong test case viết theo yyyy-dd-mm (theo BA), đổi sang format web đang dùng.
    // Chuỗi không đúng dạng (data sai định dạng) thì giữ nguyên.
    async toSiteDate(date: string) {
        const parts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!parts) return date;
        const [, year, day, month] = parts;
        return this.formatDate(await this.dateFormat(), year, month, day);
    }

    async today() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return this.formatDate(await this.dateFormat(), String(now.getFullYear()), month, day);
    }

    private formatDate(format: string, year: string, month: string, day: string) {
        return format.replace('yyyy', year).replace('mm', month).replace('dd', day);
    }
}
