import { Then, When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

When('I cancel the employee form', async function (this: CustomWorld) {
    await this.addEmployeePage.clickCancel();
});

When('I double-click Save', async function (this: CustomWorld) {
    await this.addEmployeePage.doubleClickSave();
});

Then('the Employee List has {int} record(s) for the employee under test', async function (
    this: CustomWorld,
    expectedCount: number
) {
    const employeeId = this.employeeUnderTest?.employeeId;
    if (!employeeId) throw new Error('Employee Id was not captured before checking the Employee List.');

    if (expectedCount === 0) {
        await this.employeeListPage.expectVisible();
    } else {
        await this.employeeListPage.open();
    }
    await this.employeeListPage.searchByEmployeeId(employeeId);
    await this.employeeListPage.expectEmployeeCount(employeeId, expectedCount);
});
Then('the employee appears in the Employee List when searched by name', async function (this: CustomWorld) {
    const employee = this.employeeUnderTest;
    if (!employee) throw new Error('Employee details were not captured before checking the Employee List.');

    const employeeName = [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(' ');
    await this.employeeListPage.open();
    await this.employeeListPage.searchByEmployeeName(employeeName);
    await this.employeeListPage.expectEmployeeVisibleByName(employee.firstName, employee.middleName, employee.lastName);
});
Then('the employee is found in Employee List by Employee Name {string}', async function (this: CustomWorld, searchName: string) {
    const employee = this.employeeUnderTest;
    if (!employee) throw new Error('Employee details were not captured before checking the Employee List.');
    await this.employeeListPage.open();
    await this.employeeListPage.searchByEmployeeName(searchName);
    await this.employeeListPage.expectEmployeeVisibleByName(employee.firstName, employee.middleName, employee.lastName);
});

Then('the employee is absent from Employee List when searched by Employee Name {string}', async function (this: CustomWorld, searchName: string) {
    await this.employeeListPage.open();
    await this.employeeListPage.searchByEmployeeNameWithoutSelection(searchName);
    await this.employeeListPage.expectNoEmployeeNameMatch(searchName);
});
