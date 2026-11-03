import { expect, type Page } from '@playwright/test';

export class DashboardPage {
    constructor(private readonly page: Page) {}

    // Demo có lúc chậm, đăng nhập xong mất ~15s mới vào Dashboard.
    async expectVisible() {
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
}
