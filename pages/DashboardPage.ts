import { expect, type Page } from '@playwright/test';
import { waitForPageLoad } from '../support/pageLoad';

export class DashboardPage {
    constructor(private readonly page: Page) {}

    // Demo có lúc chậm, đăng nhập xong mất ~15s mới vào Dashboard.
    async expectVisible() {
        await waitForPageLoad(this.page, /\/dashboard\/index/, 'Dashboard');
        await expect(this.page).toHaveURL(/\/dashboard\/index/, { timeout: 30000 });
        await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 30000 });
    }

    // Tên người dùng ở góc phải trên.
    async expectUserName(name: string) {
        await expect(this.page.locator('.oxd-userdropdown-name')).toHaveText(name);
    }

    async openPIM() {
        await this.page.getByRole('link', { name: 'PIM' }).click();
    }

    // Thanh tab trên cùng của module PIM (Configuration, Employee List, Add Employee, Reports).
    pimTab(name: string) {
        return this.page.locator('.oxd-topbar-body-nav-tab').filter({ hasText: name });
    }

    async openPimTab(name: string) {
        await this.pimTab(name).getByRole('link', { name, exact: true }).click();
    }

    // Tab đang chọn được tô sáng bằng class --visited; trang mở đúng thì hiện tiêu đề tương ứng.
    async expectPimTabSelected(name: string, heading: string) {
        await expect(this.page.getByRole('heading', { name: heading, exact: true })).toBeVisible({ timeout: 30000 });
        await expect(this.pimTab(name), `PIM tab "${name}" should be highlighted`).toHaveClass(/--visited/);
    }
}
