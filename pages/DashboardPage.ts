import { expect, type Page } from '@playwright/test';

export class DashboardPage {
    constructor(private readonly page: Page) {}

    async expectVisible() {
        await expect(this.page).toHaveURL(/\/dashboard\/index/);
        await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    }

    async openPIM() {
        await this.page.getByRole('link', { name: 'PIM' }).click();
    }
}
