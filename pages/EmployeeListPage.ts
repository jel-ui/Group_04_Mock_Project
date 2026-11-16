import { expect, type Page } from '@playwright/test';
import { PAGE_LOAD_TIMEOUT, waitForPageLoad } from '../support/pageLoad';

export class EmployeeListPage {
    constructor(private readonly page: Page) {}

    heading() {
        return this.page.getByRole('heading', { name: 'Employee Information', exact: true });
    }

    private fieldBox(label: string) {
        return this.page.locator('.oxd-input-group').filter({ has: this.page.getByText(label, { exact: true }) });
    }

    employeeIdFilter() {
        return this.fieldBox('Employee Id').locator('input');
    }

    includeSelect() {
        return this.fieldBox('Include').locator('.oxd-select-text');
    }

    searchButton() {
        return this.page.getByRole('button', { name: 'Search', exact: true });
    }

    // Dòng "(N) Records Found" / "No Records Found" phía trên bảng.
    recordsLabel() {
        return this.page.locator('span.oxd-text').filter({ hasText: /Records? Found/ });
    }

    rowsForEmployeeId(employeeId: string) {
        return this.page.locator('.oxd-table-card').filter({
            has: this.page.getByRole('cell', { name: employeeId, exact: true })
        });
    }

    async open() {
        await this.page.goto('/web/index.php/pim/viewEmployeeList');
        await this.expectVisible();
    }

    async expectVisible() {
        await waitForPageLoad(this.page, /\/pim\/viewEmployeeList$/, 'Employee List');
        await expect(this.heading()).toBeVisible({ timeout: 30000 });
    }

    async selectInclude(option: string) {
        await this.includeSelect().click();
        await this.page.getByRole('option', { name: option, exact: true }).click();
        await expect(this.includeSelect()).toHaveText(option);
    }

    // Bảng không báo khi nào tìm xong, nên chờ đến khi không còn dòng nào khác Id cần tìm.
    async searchAllByEmployeeId(employeeId: string) {
        await expect(this.recordsLabel()).toBeVisible({ timeout: 30000 });
        await this.selectInclude('Current and Past Employees');
        await this.employeeIdFilter().fill(employeeId);
        await this.searchButton().click();
        await expect(
            this.page.locator('.oxd-table-card').filter({
                hasNot: this.page.getByRole('cell', { name: employeeId, exact: true })
            })
        ).toHaveCount(0, { timeout: 30000 });
        await expect(this.recordsLabel()).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    }

    async countEmployeesWithId(employeeId: string) {
        await this.searchAllByEmployeeId(employeeId);
        return this.rowsForEmployeeId(employeeId).count();
    }

    async openEmployee(employeeId: string) {
        await this.rowsForEmployeeId(employeeId).first().click();
    }
}
