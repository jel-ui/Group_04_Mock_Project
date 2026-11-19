import { config as loadEnv } from 'dotenv';

// Đọc biến môi trường từ file .env (nếu có). Trên CI dùng GitHub Secrets.
loadEnv({ quiet: true });

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

const SUPPORTED_BROWSERS: BrowserName[] = ['chromium', 'firefox', 'webkit'];

function required(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(
            `Thiếu biến môi trường ${name}. Hãy copy .env.example thành .env và điền giá trị.`
        );
    }
    return value;
}

function browserName(): BrowserName {
    const value = (process.env.BROWSER ?? 'chromium').trim().toLowerCase();
    if (!SUPPORTED_BROWSERS.includes(value as BrowserName)) {
        throw new Error(`BROWSER="${value}" không hợp lệ. Chọn: ${SUPPORTED_BROWSERS.join(', ')}.`);
    }
    return value as BrowserName;
}

function headless(): boolean {
    const value = process.env.HEADLESS?.trim().toLowerCase();
    if (value === undefined || value === '') return !!process.env.CI;
    return value === 'true' || value === '1';
}

function milliseconds(name: string, fallback: number): number {
    const value = Number(process.env[name]?.trim());
    return value > 0 ? value : fallback;
}

export const config = {
    baseUrl: (process.env.BASE_URL?.trim() || 'https://opensource-demo.orangehrmlive.com').replace(/\/+$/, ''),
    browser: browserName(),
    headless: headless(),
    stepTimeout: milliseconds('STEP_TIMEOUT', 120_000),
    actionTimeout: milliseconds('ACTION_TIMEOUT', 30_000),
    navigationTimeout: milliseconds('NAVIGATION_TIMEOUT', 60_000),
    pageLoadTimeout: milliseconds('PAGE_LOAD_TIMEOUT', 60_000),
    // Lưu trace của scenario fail vào test-results/traces
    traceOnFailure: process.env.TRACE_ON_FAILURE?.trim().toLowerCase() === 'true',
    // Getter để chỉ báo lỗi thiếu tài khoản khi test thực sự cần đăng nhập.
    get username() {
        return required('ORANGEHRM_USERNAME');
    },
    get password() {
        return required('ORANGEHRM_PASSWORD');
    }
};
