import { expect, type Page } from '@playwright/test';

function escapeRegExp(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Màn Admin > User Management > System Users, dùng để kiểm tra Status của tài khoản vừa tạo.
export class SystemUsersPage {
    constructor(private readonly page: Page) {}

    //---------- Locator ----------

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

    // Username trên OrangeHRM không phân biệt hoa thường, nên dòng "QAUser" cũng chặn "qauser".
    userRowIgnoreCase(username: string) {
        return this.page.getByRole('row').filter({
            has: this.page.getByRole('cell', { name: new RegExp('^' + escapeRegExp(username) + '$', 'i') })
        });
    }

    recordsLabel() {
        return this.page.locator('span.oxd-text').filter({ hasText: /Records? Found/ });
    }

    deleteButtonInRow(username: string) {
        return this.userRowIgnoreCase(username).first().locator('button').filter({ has: this.page.locator('.bi-trash') });
    }

    confirmDeleteButton() {
        return this.page.getByRole('button', { name: 'Yes, Delete' });
    }

    deletedToast() {
        return this.page.getByText('Successfully Deleted', { exact: true });
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

    // Bảng không báo khi nào tìm xong, nên chờ đến khi không còn dòng nào khác username cần tìm.
    async searchByUsernameAndWait(username: string) {
        await expect(this.recordsLabel()).toBeVisible({ timeout: 30000 });
        await this.searchByUsername(username);
        await expect(
            this.page.locator('.oxd-table-card').filter({
                hasNot: this.page.getByRole('cell', { name: new RegExp('^' + escapeRegExp(username) + '$', 'i') })
            })
        ).toHaveCount(0, { timeout: 30000 });
        await expect(this.recordsLabel()).toBeVisible();
    }

    // Xoá tài khoản có Username này bằng nút thùng rác ở System Users.
    async deleteUsersByUsername(username: string) {
        await this.searchByUsernameAndWait(username);
        let remaining = await this.userRowIgnoreCase(username).count();
        while (remaining > 0) {
            await this.deleteButtonInRow(username).click();
            await this.confirmDeleteButton().click();
            await expect(this.deletedToast()).toBeVisible({ timeout: 30000 });
            remaining--;
            await expect(this.userRowIgnoreCase(username)).toHaveCount(remaining, { timeout: 30000 });
        }
    }

    // ---------- Xác nhận ----------

    // Các cột: (checkbox), Username, User Role, Employee Name, Status, Actions
    async expectUserStatus(username: string, status: string) {
        const row = this.userRow(username);
        await expect(row).toHaveCount(1);
        await expect(row.getByRole('cell').nth(4)).toHaveText(status);
    }

    async expectUserAbsent(username: string) {
        await expect(this.userRow(username)).toHaveCount(0);
    }
}
