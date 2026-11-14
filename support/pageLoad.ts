import { expect, type Page } from '@playwright/test';

// Thời gian chờ tối đa để một trang của demo tải xong.
export const PAGE_LOAD_TIMEOUT = 60_000;

// Trang chậm hơn mức này thì in cảnh báo ra console để biết lần chạy đó web có chậm hay không.
const SLOW_PAGE_WARNING = 15_000;

// Lỗi riêng cho trường hợp trang tải chưa xong. Báo cáo có chữ [WEBSITE SLOW] thì là do web,
// còn lỗi ở bước kiểm tra phía sau (sai locator, sai giá trị...) thì mới cần xem lại code.
export class PageLoadError extends Error {
    constructor(pageName: string, waitedMs: number, currentUrl: string, reason: string) {
        super(
            `[WEBSITE SLOW] ${pageName} did not finish loading after ${Math.round(waitedMs / 1000)}s ` +
            `(${reason}). Current URL: ${currentUrl}`
        );
        this.name = 'PageLoadError';
    }
}

// Chờ trang tải xong rồi mới kiểm tra:
// 1. URL đổi sang trang cần đến và trình duyệt đã dựng xong DOM (domcontentloaded).
// 2. Vòng xoay loading của OrangeHRM (dữ liệu bảng, form) đã tắt.
export async function waitForPageLoad(page: Page, url: RegExp, pageName: string, timeout = PAGE_LOAD_TIMEOUT) {
    const start = Date.now();
    const remaining = () => Math.max(timeout - (Date.now() - start), 1_000);

    try {
        await page.waitForURL(url, { waitUntil: 'domcontentloaded', timeout });
    } catch {
        throw new PageLoadError(pageName, Date.now() - start, page.url(), 'URL/DOM not loaded');
    }

    try {
        await expect(page.locator('.oxd-loading-spinner')).toHaveCount(0, { timeout: remaining() });
    } catch {
        throw new PageLoadError(pageName, Date.now() - start, page.url(), 'loading spinner still shown');
    }

    const took = Date.now() - start;
    if (took > SLOW_PAGE_WARNING) {
        console.warn(`${pageName} loaded slowly: ${Math.round(took / 1000)}s`);
    }
}
