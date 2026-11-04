import { expect, type Page } from '@playwright/test';

export class LoginPage {
    constructor(private readonly page: Page) {}

    async open() {
        await this.page.goto('/web/index.php/auth/login');
    }

    async expectVisible() {
        await expect(this.page.getByRole('heading', { name: 'Login' })).toBeVisible();
    }

    async enterUsername(username: string) {
        await this.page.getByPlaceholder('Username').fill(username);
    }

    async enterPassword(password: string) {
        await this.page.getByPlaceholder('Password').fill(password);
    }

    async clickLogin() {
        await this.page.getByRole('button', { name: 'Login' }).click();
    }

    async login(username: string, password: string) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
    }

    async expectErrorMessage(message: string) {
        await expect(this.page.locator('.oxd-alert-content-text')).toHaveText(message);
    }

    async expectBlocked() {
        await expect(this.page).toHaveURL(/\/auth\/login$/);
        await this.expectVisible();

        await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toHaveCount(0);
    }

    async expectRequiredMessageCount(count: number) {
        await expect(this.page.locator('.oxd-input-field-error-message')).toHaveCount(count);
    }
}
