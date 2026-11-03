import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';
import { AddEmployeePage } from '../pages/AddEmployeePage';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { SystemUsersPage } from '../pages/SystemUsersPage';

export interface EmployeeRecord {
    firstName: string;
    middleName: string;
    lastName: string;
    employeeId: string;
}

export class CustomWorld extends World {
    context!: BrowserContext;
    page!: Page;
    loginPage!: LoginPage;
    dashboardPage!: DashboardPage;
    addEmployeePage!: AddEmployeePage;
    systemUsersPage!: SystemUsersPage;
    employeeUnderTest?: EmployeeRecord;
    createdLoginDetails?: { username: string; password: string };
    // Employee Id gợi ý được ghi lại trước khi lưu (AE_P06).
    notedEmployeeId?: string;

    initializePages(page: Page) {
        this.page = page;
        this.loginPage = new LoginPage(page);
        this.dashboardPage = new DashboardPage(page);
        this.addEmployeePage = new AddEmployeePage(page);
        this.systemUsersPage = new SystemUsersPage(page);
    }
}

setWorldConstructor(CustomWorld);
