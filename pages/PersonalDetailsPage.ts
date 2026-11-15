import { expect, type Page } from '@playwright/test';
import { PAGE_LOAD_TIMEOUT, waitForPageLoad } from '../support/pageLoad';

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
        return this.form().locator('.oxd-input-group').filter({
            has: this.page.locator('label').getByText(label, { exact: true })
        });
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
