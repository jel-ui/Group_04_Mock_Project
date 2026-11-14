import { expect, type Page } from '@playwright/test';
import { PAGE_LOAD_TIMEOUT, PageLoadError, waitForPageLoad } from '../support/pageLoad';

export class LoginPage {
    constructor(private readonly page: Page) {}

    async open() {
        await this.page.goto('/web/index.php/auth/login');
        await waitForPageLoad(this.page, /\/auth\/login$/, 'Login page');
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
        await this.clickLoginAndWaitForResult();
    }

    // Bấm Login khi đã nhập đủ Username/Password: form gửi lên server rồi tải lại trang
    // (vào Dashboard nếu đúng, quay về Login nếu sai/bị khoá). Chờ trang mới tải xong
    // để bước kiểm tra sau không chạy lúc server còn chưa trả kết quả.
    async clickLoginAndWaitForResult() {
        const start = Date.now();
        const reloaded = this.page.waitForEvent('framenavigated', {
            predicate: (frame) => frame === this.page.mainFrame(),
            timeout: PAGE_LOAD_TIMEOUT
        });
        await this.clickLogin();
        try {
            await reloaded;
            await this.page.waitForLoadState('domcontentloaded', { timeout: PAGE_LOAD_TIMEOUT });
        } catch {
            throw new PageLoadError('Login result', Date.now() - start, this.page.url(), 'no response after clicking Login');
        }
    }

    async expectErrorMessage(message: string) {
        await expect(this.page.locator('.oxd-alert-content-text')).toHaveText(message);
    }

    async expectBlocked() {
        await waitForPageLoad(this.page, /\/auth\/login$/, 'Login page after sign-in attempt');
        await expect(this.page).toHaveURL(/\/auth\/login$/);
        await this.expectVisible();

        await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toHaveCount(0);
        await expect(this.page.locator('.oxd-alert-content-text')).toHaveCount(0);
    }

    async expectRequiredMessageCount(count: number) {
        await expect(this.page.locator('.oxd-input-field-error-message')).toHaveCount(count);
    }
}
