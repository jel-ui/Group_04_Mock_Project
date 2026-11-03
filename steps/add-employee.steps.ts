import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { config } from '../support/config';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { deleteEmployeeById, deleteUserByUsername, findEmployeeNumbers } from '../support/testData';
import { CustomWorld } from '../support/world';

When('I save the employee', async function (this: CustomWorld) {
    await this.addEmployeePage.clickSave();
});

Then('the employee profile shows the submitted details', async function (this: CustomWorld) {
    const employee = this.employeeUnderTest;
    if (!employee) throw new Error('Employee data was not captured before saving.');

    await this.addEmployeePage.expectSavedEmployee(
        employee.firstName,
        employee.middleName,
        employee.lastName,
        employee.employeeId
    );
});

Then('the {string} field shows the {string} error', async function (
    this: CustomWorld,
    fieldName: string,
    message: string
) {
    await this.addEmployeePage.expectFieldError(fieldName, message);
});

Then('the employee form remains unsaved', async function (this: CustomWorld) {
    await this.addEmployeePage.expectNotSaved();
});

Then('the created employee login account can sign in', async function (this: CustomWorld) {
    const credentials = this.createdLoginDetails;
    if (!credentials) throw new Error('Login details were not captured before saving.');

    const browser = this.context.browser();
    if (!browser) throw new Error('Could not access the browser to verify the created account.');

    const verificationContext = await browser.newContext({ baseURL: config.baseUrl });
    try {
        const verificationPage = await verificationContext.newPage();
        const loginPage = new LoginPage(verificationPage);
        const dashboardPage = new DashboardPage(verificationPage);
        await loginPage.open();
        await loginPage.login(credentials.username, credentials.password);
        await dashboardPage.expectVisible();
        // Góc phải trên hiện đúng tên nhân viên vừa tạo.
        if (this.employeeUnderTest) {
            await dashboardPage.expectUserName(this.employeeUnderTest.firstName + ' ' + this.employeeUnderTest.lastName);
        }
    } finally {
        await verificationContext.close();
    }
});

// ---------- Chuẩn bị và dọn dữ liệu cố định ----------

// Sau khi dọn thì tải lại form để Employee Id gợi ý là mới nhất.
// Demo dùng chung có người khác thêm nhân viên liên tục, Id gợi ý cũ có thể đã bị lấy mất.
Given('no employee uses Employee Id {string}', async function (this: CustomWorld, employeeId: string) {
    await deleteEmployeeById(this.context.request, employeeId);
    await this.addEmployeePage.open();
});

Given('no user account uses Username {string}', async function (this: CustomWorld, username: string) {
    await deleteUserByUsername(this.context.request, username);
    await this.addEmployeePage.open();
});

// Tạo nhân viên nền nếu demo chưa có Id này, rồi quay lại form Add Employee trống.
Given('an employee with Employee Id {string} exists', async function (this: CustomWorld, employeeId: string) {
    const existing = await findEmployeeNumbers(this.context.request, employeeId);
    if (existing.length > 0) return;

    await this.addEmployeePage.enterEmployeeDetails({
        'First Name': 'QAAn',
        'Last Name': 'Nguyen',
        'Employee Id': employeeId
    });
    await this.addEmployeePage.clickSave();
    await this.addEmployeePage.expectSaved();
    await this.addEmployeePage.open();
});

// Bảng dọc, giá trị cố định. Không có dòng Employee Id thì giữ Id hệ thống gợi ý.
When('I enter employee details:', async function (this: CustomWorld, table: DataTable) {
    const data = table.rowsHash();
    await this.addEmployeePage.enterEmployeeDetails(data);

    this.employeeUnderTest = {
        firstName: data['First Name'] || '',
        middleName: data['Middle Name'] || '',
        lastName: data['Last Name'] || '',
        employeeId: data['Employee Id'] || await this.addEmployeePage.getEmployeeId()
    };
});

// Dùng cho Scenario Outline validation: giá trị viết trong ngoặc kép để giữ được dấu cách.
// "" nghĩa là không nhập (Employee Id thì giữ Id gợi ý).
When('I enter First Name {string}, Last Name {string} and Employee Id {string}', async function (
    this: CustomWorld,
    firstName: string,
    lastName: string,
    employeeId: string
) {
    if (firstName) await this.addEmployeePage.enterFirstName(firstName);
    if (lastName) await this.addEmployeePage.enterLastName(lastName);
    if (employeeId) await this.addEmployeePage.enterEmployeeId(employeeId);
});

When('I enter login details:', async function (this: CustomWorld, table: DataTable) {
    const data = table.rowsHash();
    await this.addEmployeePage.enterLoginDetails(data);
    this.createdLoginDetails = { username: data['Username'], password: data['Password'] };
});

When('I change the Employee Id to {string}', async function (this: CustomWorld, employeeId: string) {
    await this.addEmployeePage.enterEmployeeId(employeeId);
    if (this.employeeUnderTest) this.employeeUnderTest.employeeId = employeeId;
});

When('I note the suggested Employee Id', async function (this: CustomWorld) {
    this.notedEmployeeId = await this.addEmployeePage.getEmployeeId();
});

When('I open the Add Employee page again', async function (this: CustomWorld) {
    await this.addEmployeePage.open();
});

When('I upload the profile photo {string}', async function (this: CustomWorld, fileName: string) {
    await this.addEmployeePage.uploadPhoto(fileName);
});

// fields: danh sách tên field cách nhau bằng dấu phẩy, ví dụ "First Name, Last Name".
Then('the fields {string} show the {string} error', async function (
    this: CustomWorld,
    fields: string,
    message: string
) {
    for (const fieldName of fields.split(',').map((field) => field.trim())) {
        await this.addEmployeePage.expectFieldError(fieldName, message);
    }
});

Then('the profile photo shows the {string} error', async function (this: CustomWorld, message: string) {
    await this.addEmployeePage.expectPhotoError(message);
});

Then('the suggested Employee Id is greater than the noted one', async function (this: CustomWorld) {
    if (!this.notedEmployeeId) throw new Error('The suggested Employee Id was not noted before saving.');

    const newEmployeeId = await this.addEmployeePage.getEmployeeId();
    expect(newEmployeeId).not.toBe(this.notedEmployeeId);
    expect(Number(newEmployeeId)).toBeGreaterThan(Number(this.notedEmployeeId));
});
