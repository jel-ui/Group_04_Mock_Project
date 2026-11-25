import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';
import { AddEmployeePage } from '../pages/AddEmployeePage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { LoginPage } from '../pages/LoginPage';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';
import { SystemUsersPage } from '../pages/SystemUsersPage';
import { testEmployees } from './testData';

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
    employeeListPage!: EmployeeListPage;
    systemUsersPage!: SystemUsersPage;
    // Bảng kết quả được ghi lại để kiểm tra không đổi (EL_16, EL_22, EL_24).
    notedResults?: { records: string; ids: string[]; searchCount: () => number };
    employeeUnderTest?: EmployeeRecord;
    createdLoginDetails?: { username: string; password: string };
    // Employee Id gợi ý được ghi lại trước khi lưu (AE_P07).
    notedEmployeeId?: string;
    personalDetailsPage!: PersonalDetailsPage;
    scenarioData: Record<string, string> = {};
    // Employee Id của nhân viên đang mở Personal Details.
    employeeId?: string;

    initializePages(page: Page) {
        this.page = page;
        this.scenarioData = {};
        this.loginPage = new LoginPage(page);
        this.dashboardPage = new DashboardPage(page);
        this.addEmployeePage = new AddEmployeePage(page);
        this.employeeListPage = new EmployeeListPage(page);
        this.systemUsersPage = new SystemUsersPage(page);
        this.personalDetailsPage = new PersonalDetailsPage(page);
    }

    // Tìm nhân viên theo Employee Id ở Employee List; chưa có (bị xoá trên demo) thì tạo lại.
    async openPersonalDetails(employeeId: string) {
        const employee = testEmployees[employeeId] ?? { firstName: 'Shii', lastName: employeeId };

        await this.employeeListPage.open();
        if ((await this.employeeListPage.countEmployeesWithId(employeeId)) > 0) {
            await this.employeeListPage.openEmployee(employeeId);
        } else {
            await this.addEmployeePage.open();
            await this.addEmployeePage.addEmployee(employee.firstName, employee.lastName, employeeId);
        }
        await this.personalDetailsPage.expectVisible(employeeId);
        this.employeeId = employeeId;
    }

    currentEmployeeId() {
        if (!this.employeeId) throw new Error('Personal Details page of an employee was not opened.');
        return this.employeeId;
    }
}

setWorldConstructor(CustomWorld);
