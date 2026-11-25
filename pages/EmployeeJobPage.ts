import { expect, type Locator, type Page } from '@playwright/test';
import { PAGE_LOAD_TIMEOUT, waitForPageLoad } from '../support/pageLoad';

export class EmployeeJobPage {
    constructor(private readonly page: Page) {}

    private form() {
        return this.page.locator('.orangehrm-edit-employee-content form').first();
    }

    private dialog() {
        return this.page.locator('.oxd-dialog-sheet');
    }

    private dropdown(container: Locator, label: string) {
        return container.locator('.oxd-input-group').filter({ has: this.page.getByText(label, { exact: true }) }).locator('.oxd-select-text');
    }

    private async selectOption(container: Locator, label: string, option: string) {
        await this.dropdown(container, label).click();
        await this.page.getByRole('option', { name: option, exact: true }).click();
        await expect(this.dropdown(container, label)).toHaveText(option);
    }

    // Mở tab Job từ thanh tab của nhân viên đang mở.
    async open() {
        await this.page.locator('.orangehrm-tabs').getByRole('link', { name: 'Job', exact: true }).click();
        await waitForPageLoad(this.page, /\/pim\/viewJobDetails\/empNumber\/\d+$/, 'Job');
        await expect(this.page.getByRole('heading', { name: 'Job Details', exact: true })).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
        await expect(this.page.locator('.oxd-form-loader')).toHaveCount(0, { timeout: PAGE_LOAD_TIMEOUT });
    }

    async setEmploymentStatus(status: string) {
        await this.selectOption(this.form(), 'Employment Status', status);
        await this.form().getByRole('button', { name: 'Save' }).click();
        await expect(this.page.locator('.oxd-toast')).toContainText('Successfully Updated', { timeout: PAGE_LOAD_TIMEOUT });
    }

    // Ngày nghỉ việc chọn "Today" trên lịch để không phụ thuộc định dạng ngày của demo.
    async terminateEmployment(reason = 'Other') {
        await this.page.getByRole('button', { name: 'Terminate Employment' }).click();
        await this.dialog().locator('.oxd-date-input-icon').click();
        await this.page.locator('.oxd-date-input-link').getByText('Today', { exact: true }).click();
        await this.selectOption(this.dialog(), 'Termination Reason', reason);
        await this.dialog().getByRole('button', { name: 'Save' }).click();
        await expect(this.page.getByRole('button', { name: 'Activate Employment' })).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    }
}
