import { After, AfterAll, Before, BeforeAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
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

// Ghi ID từ tag của Scenario hoặc từ tên đã nội suy của từng dòng Scenario Outline.
Before(function (this: CustomWorld, { pickle }) {
    const taggedIds = pickle.tags.map((tag) => tag.name.slice(1)).filter((name) => /^AE_/.test(name));
    const namedId = pickle.name.match(/\bAE_[A-Z]\d+\b/)?.[0];
    const testCaseIds = [...new Set([...taggedIds, ...(namedId ? [namedId] : [])])];
    if (testCaseIds.length > 0) this.attach('Test Case: ' + testCaseIds.join(', '), 'text/plain');
});

After(async function (this: CustomWorld, { result }) {
    // Chụp một ảnh cuối mỗi scenario để giảm tải so với chụp sau từng step.
    if (this.page && !this.page.isClosed()) {
        try {
            const screenshot = await this.page.screenshot({
                fullPage: false,
                scale: 'css',
                animations: 'disabled',
                timeout: 5_000
            });
            this.attach(screenshot, 'image/png');
        } catch (error) {
            console.warn('Could not capture final scenario screenshot:', (error as Error).message.split('\n')[0]);
        }

        if (result?.status === Status.FAILED) {
            this.attach('Failed at URL: ' + this.page.url(), 'text/plain');
        }
    }
    if (this.context) await this.context.close();
});

AfterAll(async function () {
    if (browser) {
        await browser.close();
        browser = undefined;
    }
});
