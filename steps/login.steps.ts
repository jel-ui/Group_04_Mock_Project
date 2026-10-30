import { Given, Then, When } from '@cucumber/cucumber';
import { config } from '../support/config';
import { CustomWorld } from '../support/world';

Given('I open the OrangeHRM login page', async function (this: CustomWorld) {
    await this.loginPage.open();
    await this.loginPage.expectVisible();
});

When('I log in with valid credentials', async function (this: CustomWorld) {
    await this.loginPage.login(config.username, config.password);
});

When('I log in with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
    await this.loginPage.login(username, password);
});

When('I click Login', async function (this: CustomWorld) {
    await this.loginPage.clickLogin();
});

Then('the Dashboard page is visible', async function (this: CustomWorld) {
    await this.dashboardPage.expectVisible();
});

Then('the login error {string} is shown', async function (this: CustomWorld, message: string) {
    await this.loginPage.expectErrorMessage(message);
});

Then('{int} required field messages are shown', async function (this: CustomWorld, count: number) {
    await this.loginPage.expectRequiredMessageCount(count);
});
