import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
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

// ---------- Tab PIM (AE_U04) ----------

When('I open the PIM menu', async function (this: CustomWorld) {
    await this.dashboardPage.openPIM();
});

When('I open the PIM tab {string}', async function (this: CustomWorld, tabName: string) {
    await this.dashboardPage.openPimTab(tabName);
});

Then('the PIM tab {string} is selected and shows the {string} heading', async function (
    this: CustomWorld,
    tabName: string,
    heading: string
) {
    await this.dashboardPage.expectPimTabSelected(tabName, heading);
});

// ---------- Chưa đăng nhập (AE_L01) ----------

When('I open the Add Employee page URL without signing in', async function (this: CustomWorld) {
    await this.addEmployeePage.openUrl();
});

Then('the OrangeHRM login page is shown', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/auth\/login$/);
    await this.loginPage.expectVisible();
});

Then('the Add Employee form is not shown', async function (this: CustomWorld) {
    await this.addEmployeePage.expectFormHidden();
});
