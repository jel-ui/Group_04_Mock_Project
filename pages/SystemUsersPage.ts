import { expect, type Page } from '@playwright/test';

// Màn Admin > User Management > System Users, dùng để kiểm tra Status của tài khoản vừa tạo.
export class SystemUsersPage {
    constructor(private readonly page: Page) {}

    // ---------- Locator ----------

    heading() {
        return this.page.getByRole('heading', { name: 'System Users' });
    }

    // Label Username ở bộ lọc không gắn với ô nhập, lấy theo khung .oxd-input-group giống AddEmployeePage.
    usernameFilterInput() {
        return this.page.locator('.oxd-input-group')
            .filter({ has: this.page.getByText('Username', { exact: true }) })
            .locator('input');
    }

    searchButton() {
        return this.page.getByRole('button', { name: 'Search' });
    }

    // Dòng trong bảng kết quả có ô Username đúng bằng username.
    userRow(username: string) {
        return this.page.getByRole('row').filter({ has: this.page.getByRole('cell', { name: username, exact: true }) });
    }

    // ---------- Thao tác ----------

    async open() {
        await this.page.goto('/web/index.php/admin/viewSystemUsers');
        await expect(this.heading()).toBeVisible();
    }

    async searchByUsername(username: string) {
        await this.usernameFilterInput().fill(username);
        await this.searchButton().click();
    }

    // ---------- Xác nhận ----------

    // Các cột: (checkbox), Username, User Role, Employee Name, Status, Actions
    async expectUserStatus(username: string, status: string) {
        const row = this.userRow(username);
        await expect(row).toHaveCount(1);
        await expect(row.getByRole('cell').nth(4)).toHaveText(status);
    }

    async expectUserAbsent(username: string) {
        await expect(this.page.getByText('No Records Found', { exact: true })).toBeVisible();
        await expect(this.userRow(username)).toHaveCount(0);
    }
}
