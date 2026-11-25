import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { PAGE_LOAD_TIMEOUT, waitForPageLoad } from '../support/pageLoad';

// Request lấy danh sách của bảng kết quả (có model=detailed); ô gợi ý tên gọi cùng API nhưng không có tham số này.
function isResultListRequest(response: Response) {
    return response.request().method() === 'GET' && /\/api\/v2\/pim\/employees\?.*model=detailed/.test(response.url());
}

function recordsFoundText(total: number) {
    return total === 0 ? 'No Records Found' : new RegExp(`^\\s*\\(${total}\\) Records? Found\\s*$`);
}

export class EmployeeListPage {
    constructor(private readonly page: Page) {}

    heading() {
        return this.page.getByRole('heading', { name: 'Employee Information', exact: true });
    }

    private fieldBox(label: string) {
        return this.page.locator('.oxd-input-group').filter({ has: this.page.getByText(label, { exact: true }) });
    }

    // ---------- Bộ lọc Employee Information (Sprint 3) ----------

    filterLabel(label: string) {
        return this.fieldBox(label).locator('label');
    }

    filterInput(label: string) {
        return this.fieldBox(label).locator('input');
    }

    // Ô gợi ý (Employee Name, Supervisor Name) có class oxd-autocomplete-wrapper.
    autocompleteWrapper(label: string) {
        return this.fieldBox(label).locator('.oxd-autocomplete-wrapper');
    }

    filterSelect(label: string) {
        return this.fieldBox(label).locator('.oxd-select-text');
    }

    validationError(label: string) {
        return this.fieldBox(label).locator('.oxd-input-field-error-message');
    }

    autocompleteOptions() {
        return this.page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option');
    }

    dropdownOptions() {
        return this.page.locator('.oxd-select-dropdown').getByRole('option');
    }

    // Lựa chọn đang được chọn trong dropdown đang mở.
    selectedDropdownOption() {
        return this.page.locator('.oxd-select-dropdown .oxd-select-option.--selected');
    }

    resultRows() {
        return this.page.locator('.oxd-table-body .oxd-table-card');
    }

    async typeInAutocomplete(label: string, text: string) {
        await this.filterInput(label).fill(text);
    }

    // Chờ ô gợi ý trả kết quả (hết "Searching....") rồi đọc danh sách gợi ý.
    async autocompleteSuggestions(expectedSuggestion?: string) {
        const dropdown = this.page.locator('.oxd-autocomplete-dropdown');
        await expect(dropdown).toBeVisible({ timeout: 30000 });
        await expect(dropdown).not.toContainText('Searching', { timeout: 30000 });
        if (expectedSuggestion) {
            await expect(this.autocompleteOptions().filter({ hasText: expectedSuggestion }).first()).toBeVisible({ timeout: 30000 });
        }
        return (await this.autocompleteOptions().allInnerTexts()).map((text) => text.trim());
    }

    async chooseSuggestion(label: string, typedText: string, suggestion: string) {
        await this.typeInAutocomplete(label, typedText);
        await this.autocompleteSuggestions(suggestion);
        await this.autocompleteOptions().filter({ hasText: suggestion }).first().click();
        // Nhân viên không có Middle Name thì ô hiển thị "First  Last" (2 dấu cách), nên so khớp bỏ qua số dấu cách.
        const words = suggestion.trim().split(/\s+/).map(escapeRegExp);
        await expect(this.filterInput(label)).toHaveValue(new RegExp(`^\\s*${words.join('\\s+')}\\s*$`));
    }

    async openFilterDropdown(label: string) {
        await this.filterSelect(label).click();
        await expect(this.dropdownOptions().first()).toBeVisible();
    }

    async selectFilterOption(label: string, option: string) {
        await this.openFilterDropdown(label);
        await this.dropdownOptions().filter({ hasText: new RegExp(`^\\s*${escapeRegExp(option)}\\s*$`) }).click();
        await expect(this.filterSelect(label)).toHaveText(option);
    }

    // Nhấn Search rồi chờ bảng hiển thị đúng kết quả server trả về.
    // Nếu bộ lọc báo lỗi (ví dụ "Invalid") thì không có request tìm kiếm, chỉ chờ lỗi hiện ra.
    async clickSearch() {
        const searched = this.page.waitForResponse(isResultListRequest, { timeout: PAGE_LOAD_TIMEOUT }).catch(() => null);
        const blocked = this.page
            .locator('.oxd-input-field-error-message')
            .first()
            .waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT })
            .then(() => 'blocked' as const)
            .catch(() => null);
        await this.searchButton().click();

        const outcome = await Promise.race([searched, blocked]);
        if (outcome === 'blocked') return;
        if (!outcome) throw new Error(`[WEBSITE SLOW] Employee List search did not return. Current URL: ${this.page.url()}`);
        await this.waitForResults(outcome);
    }

    // Tải lại trang (bộ lọc về mặc định) và chờ bảng kết quả của lần tải mới.
    async reload() {
        const loaded = this.page.waitForResponse(isResultListRequest, { timeout: PAGE_LOAD_TIMEOUT });
        await this.page.reload();
        await this.expectVisible();
        await this.waitForResults(await loaded);
    }

    private async waitForResults(response: Response) {
        const total = (await response.json()).meta.total as number;
        await expect(this.recordsLabel()).toHaveText(recordsFoundText(total), { timeout: PAGE_LOAD_TIMEOUT });
        await expect(this.page.locator('.oxd-table-loader, .oxd-loading-spinner')).toHaveCount(0, { timeout: PAGE_LOAD_TIMEOUT });
    }

    // Số trong "(N) Records Found"; "No Records Found" là 0.
    async recordsFoundCount() {
        await expect(this.recordsLabel()).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
        const text = (await this.recordsLabel().innerText()).trim();
        if (text === 'No Records Found') return 0;
        const count = text.match(/^\((\d+)\) Records? Found$/)?.[1];
        if (!count) throw new Error(`Unexpected Records Found text: "${text}"`);
        return Number(count);
    }

    // Giá trị của một cột ở các dòng trên trang hiện tại.
    async columnValues(column: string) {
        const headers = (await this.page.locator('.oxd-table-header .oxd-table-header-cell').allInnerTexts()).map((text) => text.trim());
        const index = headers.indexOf(column);
        if (index < 0) throw new Error(`Column "${column}" not found. Columns: ${headers.join(', ')}`);
        const rows = await this.resultRows().all();
        return Promise.all(rows.map(async (row) => (await row.locator('.oxd-table-cell').nth(index).innerText()).trim()));
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

    rowsForEmployeeId(employeeId: string) {
        return this.page.locator('.oxd-table-card').filter({
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
        await expect(this.recordsLabel()).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
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

    async openEmployee(employeeId: string) {
        await this.rowsForEmployeeId(employeeId).first().click();
    }
}

function escapeRegExp(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
