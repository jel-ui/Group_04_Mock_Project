import { expect, type Page } from '@playwright/test';

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

    searchButton() {
        return this.page.getByRole('button', { name: 'Search', exact: true });
    }

    private rowsForEmployeeId(employeeId: string) {
        return this.page.getByRole('row').filter({
            has: this.page.getByRole('cell', { name: employeeId, exact: true })
        });
    }

    async open() {
        await this.page.goto('/web/index.php/pim/viewEmployeeList');
        await this.expectVisible();
    }

    async expectVisible() {
        await expect(this.page).toHaveURL(/\/pim\/viewEmployeeList$/);
        await expect(this.heading()).toBeVisible({ timeout: 30000 });
    }

    async searchByEmployeeId(employeeId: string) {
        await this.employeeIdFilter().fill(employeeId);
        await this.searchButton().click();
    }

    async expectEmployeeCount(employeeId: string, count: number) {
        const rows = this.rowsForEmployeeId(employeeId);
        if (count === 0) {
            await expect(this.page.getByText('No Records Found', { exact: true })).toBeVisible();
        }
        await expect(rows).toHaveCount(count);
    }
}
