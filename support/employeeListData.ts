import { After, AfterAll, Before, Status } from '@cucumber/cucumber';
import type { Browser } from '@playwright/test';
import { AddEmployeePage } from '../pages/AddEmployeePage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeeJobPage } from '../pages/EmployeeJobPage';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { LoginPage } from '../pages/LoginPage';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';
import { ReportToPage } from '../pages/ReportToPage';
import { config } from './config';
import { launchBrowser } from './hooks';
import { employeeListEmployees } from './testData';

// Dữ liệu tạo và xoá ở một trình duyệt riêng để không ảnh hưởng phiên đăng nhập của scenario.
let browser: Browser | undefined;
let setup: Promise<void> | undefined;

async function openSession() {
    browser ??= await launchBrowser();
    const context = await browser.newContext({ baseURL: config.baseUrl, viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();
    page.setDefaultTimeout(config.actionTimeout);
    page.setDefaultNavigationTimeout(config.navigationTimeout);

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(config.username, config.password);
    await new DashboardPage(page).expectVisible();
    return {
        context,
        employeeList: new EmployeeListPage(page),
        addEmployee: new AddEmployeePage(page),
        personalDetails: new PersonalDetailsPage(page),
        job: new EmployeeJobPage(page),
        reportTo: new ReportToPage(page)
    };
}

async function deleteEmployeeListData(session: Awaited<ReturnType<typeof openSession>>) {
    await session.employeeList.openWithResults();
    for (const employeeId of Object.keys(employeeListEmployees)) {
        await session.employeeList.deleteEmployeesFoundById(employeeId);
    }
}

async function createEmployeeListData() {
    const session = await openSession();
    try {
        await deleteEmployeeListData(session);
        for (const [employeeId, employee] of Object.entries(employeeListEmployees)) {
            await session.addEmployee.open();
            await session.addEmployee.addEmployee(employee.firstName, employee.lastName, employeeId);
            // Demo đôi khi mở Personal Details mà không hiện nội dung, tải lại một lần.
            await session.personalDetails.expectVisible(employeeId).catch(() => session.personalDetails.reload(employeeId));
            if (employee.employmentStatus || employee.past) await session.job.open();
            if (employee.employmentStatus) await session.job.setEmploymentStatus(employee.employmentStatus);
            if (employee.past) await session.job.terminateEmployment();
            if (employee.supervisor) {
                await session.reportTo.open();
                await session.reportTo.addSupervisor(employee.supervisor);
            }
        }
    } finally {
        await session.context.close();
    }
}

// Tạo một lần cho cả lần chạy; scenario fail thì lần retry tạo lại từ đầu.
Before({ tags: '@employee-list-data', timeout: 600_000 }, async function () {
    setup ??= createEmployeeListData();
    await setup;
});

After({ tags: '@employee-list-data' }, function ({ result }) {
    if (result?.status === Status.FAILED) setup = undefined;
});

// Lỗi khi dọn chỉ cảnh báo, lần chạy sau vẫn xoá theo Employee Id trước khi tạo.
AfterAll({ timeout: 300_000 }, async function () {
    if (!browser) return;
    try {
        await deleteEmployeeListData(await openSession());
    } catch (error) {
        console.warn('Could not delete Employee List test data:', (error as Error).message.split('\n')[0]);
    } finally {
        await browser.close();
        browser = undefined;
    }
});
