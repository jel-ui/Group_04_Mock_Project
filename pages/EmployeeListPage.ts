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

    employeeNameFilter() {
        return this.fieldBox('Employee Name').locator('input');
    }

    searchButton() {
        return this.page.getByRole('button', { name: 'Search', exact: true });
    }

    private rowsForEmployeeId(employeeId: string) {
        return this.page.getByRole('row').filter({
            has: this.page.getByRole('cell', { name: employeeId, exact: true })
        });
    }

    private rowsForEmployeeName(firstName: string, middleName: string, lastName: string) {
        let rows = this.page.getByRole('row').filter({ hasText: firstName }).filter({ hasText: lastName });
        if (middleName) rows = rows.filter({ hasText: middleName });
        return rows;
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

    async searchByEmployeeName(employeeName: string) {
        const nameFilter = this.employeeNameFilter();
        await nameFilter.fill(employeeName);
        const suggestion = this.page.locator('.oxd-autocomplete-option').filter({ hasText: employeeName }).first();
        await expect(suggestion).toBeVisible({ timeout: 10000 });
        await suggestion.click();
        await this.searchButton().click();
    }

    async expectEmployeeVisibleByName(firstName: string, middleName: string, lastName: string) {
        await expect(this.rowsForEmployeeName(firstName, middleName, lastName).first()).toBeVisible();
    }

    async searchByEmployeeNameWithoutSelection(searchText: string) {
        await this.employeeNameFilter().fill(searchText);
        await this.searchButton().click();
    }

    async expectNoEmployeeNameMatch(searchText: string) {
        await expect(this.page.locator('.oxd-table-body .oxd-table-row').filter({ hasText: searchText })).toHaveCount(0);
    }

    async expectEmployeeCount(employeeId: string, count: number) {
        await expect(this.rowsForEmployeeId(employeeId)).toHaveCount(count);
    }
}
