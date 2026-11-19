import { Given, Then, When } from '@cucumber/cucumber';
import { config } from '../support/config';
import { CustomWorld } from '../support/world';

Given('I am logged in and on the Personal Details page of employee {string}', async function (
    this: CustomWorld,
    employeeId: string
) {
    await this.loginPage.open();
    await this.loginPage.login(config.username, config.password);
    await this.dashboardPage.expectVisible();
    await this.openPersonalDetails(employeeId);
});

When('I open the Personal Details page of employee {string}', async function (this: CustomWorld, employeeId: string) {
    await this.openPersonalDetails(employeeId);
});

When('I save the personal details', async function (this: CustomWorld) {
    await this.personalDetailsPage.clickSave();
});

When('I reload the Personal Details page', async function (this: CustomWorld) {
    await this.personalDetailsPage.reload(this.currentEmployeeId());
});

Then('the message {string} is shown', async function (this: CustomWorld, message: string) {
    await this.personalDetailsPage.expectToast(message);
});

Then('the personal details are not saved', async function (this: CustomWorld) {
    await this.personalDetailsPage.expectNoSuccessToast();
});

Then('the {string} field shows the {string} error', async function (
    this: CustomWorld,
    label: string,
    message: string
) {
    // Chưa mở Personal Details thì đang ở form Add Employee (Sprint 1).
    if (!this.employeeId) return this.addEmployeePage.expectFieldError(label, message);
    await this.personalDetailsPage.expectFieldError(label, message);
});
