import { expect, type Page } from '@playwright/test';
import { PAGE_LOAD_TIMEOUT, waitForPageLoad } from '../support/pageLoad';

export class ReportToPage {
    constructor(private readonly page: Page) {}

    private supervisorsSection() {
        return this.page.locator('.orangehrm-edit-employee-content > div').filter({ hasText: 'Assigned Supervisors' });
    }

    private addForm() {
        return this.page.locator('form').filter({ has: this.page.getByText('Reporting Method', { exact: true }) });
    }

    private fieldBox(label: string) {
        return this.addForm().locator('.oxd-input-group').filter({ has: this.page.getByText(label, { exact: true }) });
    }

    // Mở tab Report-to từ thanh tab của nhân viên đang mở.
    async open() {
        await this.page.locator('.orangehrm-tabs').getByRole('link', { name: 'Report-to', exact: true }).click();
        await waitForPageLoad(this.page, /\/pim\/viewReportToDetails\/empNumber\/\d+$/, 'Report-to');
        await expect(this.supervisorsSection().getByRole('button', { name: 'Add' })).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    }

    // Gõ phần họ (từ cuối của tên) rồi chọn đúng tên trong danh sách gợi ý.
    async addSupervisor(name: string, reportingMethod = 'Direct') {
        await this.supervisorsSection().getByRole('button', { name: 'Add' }).click();
        await this.fieldBox('Name').locator('input').fill(name.split(' ').pop() ?? name);
        await this.page.locator('.oxd-autocomplete-option').filter({ hasText: name }).first().click({ timeout: PAGE_LOAD_TIMEOUT });
        await this.fieldBox('Reporting Method').locator('.oxd-select-text').click();
        await this.page.getByRole('option', { name: reportingMethod, exact: true }).click();
        await this.addForm().getByRole('button', { name: 'Save' }).click();
        await expect(this.page.locator('.oxd-toast')).toContainText('Successfully Saved', { timeout: PAGE_LOAD_TIMEOUT });
        await expect(this.supervisorsSection().getByRole('row').filter({ hasText: name })).toHaveCount(1, { timeout: PAGE_LOAD_TIMEOUT });
    }
}
