import { Given, Then, When } from '@cucumber/cucumber';
import { config } from '../support/config';
import { CustomWorld } from '../support/world';

// Step dùng chung cho người 2 và người 3: đưa test tới thẳng màn Add Employee.
Given('I am logged in and on the Add Employee page', async function (this: CustomWorld) {
    await this.loginPage.open();
    await this.loginPage.login(config.username, config.password);
    await this.dashboardPage.expectVisible();
    await this.dashboardPage.openPIM();
    await this.addEmployeePage.openFromPimMenu();
    await this.addEmployeePage.expectVisible();
});

When('I open PIM > Add Employee', async function (this: CustomWorld) {
    await this.dashboardPage.openPIM();
    await this.addEmployeePage.openFromPimMenu();
});

Then('the Add Employee page is visible', async function (this: CustomWorld) {
    await this.addEmployeePage.expectVisible();
});
