import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { config } from '../support/config';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { CustomWorld, type EmployeeRecord } from '../support/world';

function uniqueToken(): string {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
}

function createUniqueEmployee(data: Record<string, string>): EmployeeRecord {
    const token = uniqueToken().slice(-8);
    const firstName = `${(data['First Name'] || 'Auto').slice(0, 18)}${token}`;

    return {
        firstName: firstName.slice(0, 30),
        middleName: data['Middle Name'] || '',
        lastName: data['Last Name'] || 'Test',
        employeeId: ''
    };
}

When('I enter unique employee details:', async function (this: CustomWorld, table: DataTable) {
    const employee = createUniqueEmployee(table.rowsHash());
    this.employeeUnderTest = employee;

    await this.addEmployeePage.enterEmployeeDetails({
        'First Name': employee.firstName,
        'Middle Name': employee.middleName,
        'Last Name': employee.lastName
    });
    employee.employeeId = await this.addEmployeePage.getEmployeeId();
});

When('I enter unique login details:', async function (this: CustomWorld, table: DataTable) {
    const data = table.rowsHash();
    const username = `${data['Username'] || 'qa_auto_'}${uniqueToken()}`.slice(0, 40);
    const password = data['Password'];
    const confirmPassword = data['Confirm Password'];

    if (!password || !confirmPassword) {
        throw new Error('The login test data must include Password and Confirm Password.');
    }

    await this.addEmployeePage.enterLoginDetails({
        Username: username,
        Status: data['Status'] || 'Enabled',
        Password: password,
        'Confirm Password': confirmPassword
    });
    this.createdLoginDetails = { username, password };
});

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

When('I save without entering employee details', async function (this: CustomWorld) {
    await this.addEmployeePage.clickSave();
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

Given('an employee with a unique Employee Id has already been created', async function (this: CustomWorld) {
    const seed = createUniqueEmployee({ 'First Name': 'Seed', 'Middle Name': '', 'Last Name': 'Duplicate' });
    const idToken = uniqueToken().replace(/[^A-Z0-9]/g, '').slice(-9);
    const employeeId = `T${idToken}`.slice(0, 10);

    await this.addEmployeePage.enterEmployeeDetails({
        'First Name': seed.firstName,
        'Middle Name': seed.middleName,
        'Last Name': seed.lastName
    });
    await this.addEmployeePage.enterEmployeeId(employeeId);
    seed.employeeId = employeeId;
    await this.addEmployeePage.clickSave();
    await this.addEmployeePage.expectSavedEmployee(
        seed.firstName,
        seed.middleName,
        seed.lastName,
        employeeId
    );

    this.duplicateEmployeeId = employeeId;
    await this.addEmployeePage.open();
});

When('I try to add a different employee with that Employee Id', async function (this: CustomWorld) {
    if (!this.duplicateEmployeeId) throw new Error('The duplicate Employee Id precondition was not created.');

    const employee = createUniqueEmployee({ 'First Name': 'Duplicate', 'Middle Name': '', 'Last Name': 'Candidate' });
    employee.employeeId = this.duplicateEmployeeId;
    this.employeeUnderTest = employee;

    await this.addEmployeePage.enterEmployeeDetails({
        'First Name': employee.firstName,
        'Middle Name': employee.middleName,
        'Last Name': employee.lastName,
        'Employee Id': employee.employeeId
    });
    await this.addEmployeePage.clickSave();
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
    } finally {
        await verificationContext.close();
    }
});