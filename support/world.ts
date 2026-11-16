import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';
import { AddEmployeePage } from '../pages/AddEmployeePage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { LoginPage } from '../pages/LoginPage';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';
import { PersonalIdentityPage } from '../pages/PersonalIdentityPage';
import { testEmployees } from './testData';

export class CustomWorld extends World {
    context!: BrowserContext;
    page!: Page;
    loginPage!: LoginPage;
    dashboardPage!: DashboardPage;
    addEmployeePage!: AddEmployeePage;
    employeeListPage!: EmployeeListPage;
    personalDetailsPage!: PersonalDetailsPage;
    personalIdentityPage!: PersonalIdentityPage;
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
        this.personalDetailsPage = new PersonalDetailsPage(page);
        this.personalIdentityPage = new PersonalIdentityPage(page);
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
