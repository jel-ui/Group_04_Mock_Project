import { expect, type Page } from '@playwright/test';

export const PAGE_LOAD_TIMEOUT = 60_000;

// lỗi [WEBSITE SLOW] là do web load chậm, không phải do code
export async function waitForPageLoad(page: Page, url: RegExp, pageName: string) {
    try {
        await page.waitForURL(url, { waitUntil: 'domcontentloaded', timeout: PAGE_LOAD_TIMEOUT });
        await expect(page.locator('.oxd-loading-spinner')).toHaveCount(0, { timeout: PAGE_LOAD_TIMEOUT });
    } catch {
        throw new Error(`[WEBSITE SLOW] ${pageName} did not finish loading. Current URL: ${page.url()}`);
    }
}
