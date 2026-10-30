import { expect, type Page } from '@playwright/test';

export class AddEmployeePage {
    constructor(private readonly page: Page) {}

    async openFromPimMenu() {
        await this.page.getByRole('link', { name: 'Add Employee' }).click();
    }

    async expectVisible() {
        await expect(this.page).toHaveURL(/\/pim\/addEmployee/);
        await expect(this.page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();
        await expect(this.page.getByPlaceholder('First Name')).toBeVisible();
    }
}
