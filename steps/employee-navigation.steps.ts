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
