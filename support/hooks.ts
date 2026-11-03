import { After, AfterAll, AfterStep, Before, BeforeAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit, type Browser } from '@playwright/test';
import { config } from './config';
import { CustomWorld } from './world';

const browserTypes = { chromium, firefox, webkit };

let browser: Browser | undefined;
setDefaultTimeout(120_000);

BeforeAll(async function () {
    browser = await browserTypes[config.browser].launch({ headless: config.headless });
});

Before(async function (this: CustomWorld) {
    if (!browser) throw new Error('Browser was not started in BeforeAll.');
    this.context = await browser.newContext({
        baseURL: config.baseUrl,
        viewport: { width: 1366, height: 768 }
    });
    const page = await this.context.newPage();
    page.setDefaultTimeout(30_000);
    page.setDefaultNavigationTimeout(60_000);
    this.initializePages(page);
});

// Ghi Test Case ID (tag @AE_...) vào report để truy vết từng dòng Examples về test case gốc.
Before(function (this: CustomWorld, { pickle }) {
    const testCaseIds = pickle.tags.map((tag) => tag.name.slice(1)).filter((name) => /^AE_/.test(name));
    if (testCaseIds.length > 0) this.attach(`Test Case: ${testCaseIds.join(', ')}`, 'text/plain');
});

AfterStep(async function (this: CustomWorld) {
    if (!this.page || this.page.isClosed()) return;

    try {
        // Chờ trang chuyển xong (vd. sau khi bấm Login) để ảnh không bị lỗi.
        await this.page.waitForLoadState('load');
        const screenshot = await this.page.screenshot({ fullPage: false, scale: 'css' });
        this.attach(screenshot, 'image/png');
    } catch (error) {
        // Không để lỗi chụp ảnh che mất lỗi thực tế của step.
        console.warn('Could not capture screenshot after step:', (error as Error).message.split('\n')[0]);
    }
});

After(async function (this: CustomWorld, { result }) {
    if (result?.status === Status.FAILED && this.page && !this.page.isClosed()) {
        this.attach(`Failed at URL: ${this.page.url()}`, 'text/plain');
    }
    if (this.context) await this.context.close();
});

AfterAll(async function () {
    if (browser) {
        await browser.close();
        browser = undefined;
    }
});
