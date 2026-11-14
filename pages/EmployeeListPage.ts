import { expect, type Locator, type Page } from '@playwright/test';
import { waitForPageLoad } from '../support/pageLoad';

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

    includeSelect() {
        return this.fieldBox('Include').locator('.oxd-select-text');
    }

    // Dòng "(N) Records Found" / "No Records Found" phía trên bảng.
    recordsLabel() {
        return this.page.locator('span.oxd-text').filter({ hasText: /Records? Found/ });
    }

    deleteButtonInRow(row: Locator) {
        return row.locator('button').filter({ has: this.page.locator('.bi-trash') });
    }

    confirmDeleteButton() {
        return this.page.getByRole('button', { name: 'Yes, Delete' });
    }

    deletedToast() {
        return this.page.getByText('Successfully Deleted', { exact: true });
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

    async selectInclude(option: string) {
        await this.includeSelect().click();
        await this.page.getByRole('option', { name: option, exact: true }).click();
        await expect(this.includeSelect()).toHaveText(option);
    }

    // Tìm theo Employee Id trong cả nhân viên hiện tại và đã nghỉ (Id của người đã nghỉ vẫn bị tính là trùng).
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
        await expect(this.recordsLabel()).toBeVisible();
    }

    async countEmployeesWithId(employeeId: string) {
        await this.searchAllByEmployeeId(employeeId);
        return this.rowsForEmployeeId(employeeId).count();
    }

    // Xoá từng dòng có Employee Id này bằng nút thùng rác. Tài khoản đăng nhập gắn với nhân viên cũng bị xoá theo.
    async deleteEmployeesWithId(employeeId: string) {
        const rows = this.rowsForEmployeeId(employeeId);
        let remaining = await this.countEmployeesWithId(employeeId);
        while (remaining > 0) {
            await this.deleteButtonInRow(rows.first()).click();
            await this.confirmDeleteButton().click();
            await expect(this.deletedToast()).toBeVisible({ timeout: 30000 });
            remaining--;
            await expect(rows).toHaveCount(remaining, { timeout: 30000 });
        }
    }

    async expectVisible() {
        await waitForPageLoad(this.page, /\/pim\/viewEmployeeList$/, 'Employee List');
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
