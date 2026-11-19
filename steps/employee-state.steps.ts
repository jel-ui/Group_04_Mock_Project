import { Then, When } from '@cucumber/cucumber';
import { expect, type Page } from '@playwright/test';
import { config } from '../support/config';
import { LoginPage } from '../pages/LoginPage';
import { CustomWorld } from '../support/world';

async function logOut(page: Page) {
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByText('Logout', { exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/login$/, { timeout: 60_000 });
}

function firstNameInput(page: Page) {
    // Locator này giống locator First Name đã dùng trong project Sprint 1.
    return page.getByRole('textbox', { name: 'First Name', exact: true });
}

When('I record the current First Name', async function (this: CustomWorld) {
    this.scenarioData['original-first-name'] = await firstNameInput(this.page).inputValue();
});

When('I change the First Name to {string}', async function (this: CustomWorld, value: string) {
    await firstNameInput(this.page).fill(value);
});

When('I leave Personal Details without saving and reopen employee {string}', async function (
    this: CustomWorld,
    employeeId: string
) {
    await this.openPersonalDetails(employeeId);
});

Then('the First Name still has its original saved value', async function (this: CustomWorld) {
    const originalValue = this.scenarioData['original-first-name'];
    if (originalValue === undefined) throw new Error('The original First Name was not recorded.');
    await expect(firstNameInput(this.page)).toHaveValue(originalValue);
});

When('I double click Save in Personal Details', async function (this: CustomWorld) {
    await this.personalDetailsPage.saveButton().dblclick({ delay: 40 });
});

Then('the First Name is {string}', async function (this: CustomWorld, value: string) {
    await expect(firstNameInput(this.page)).toHaveValue(value);
});

When('I open the Employee List', async function (this: CustomWorld) {
    await this.employeeListPage.open();
});

Then('there is exactly one employee with Employee Id {string}', async function (
    this: CustomWorld,
    employeeId: string
) {
    expect(await this.employeeListPage.countEmployeesWithId(employeeId)).toBe(1);
});

When('I log out from a second browser tab', async function (this: CustomWorld) {
    const logoutPage = await this.context.newPage();
    logoutPage.setDefaultTimeout(30_000);
    logoutPage.setDefaultNavigationTimeout(60_000);
    await logoutPage.goto('/web/index.php/dashboard/index');
    await logOut(logoutPage);
    await logoutPage.close();
});

When('I log in again and reopen employee {string}', async function (this: CustomWorld, employeeId: string) {
    const loginPage = new LoginPage(this.page);
    await loginPage.open();
    await loginPage.login(config.username, config.password);
    // OrangeHRM may return to the originally requested Personal Details URL after login.
    // Navigate through Employee List directly instead of requiring Dashboard as the landing page.
    await this.openPersonalDetails(employeeId);
});

When('I log out from the current browser tab', async function (this: CustomWorld) {
    await logOut(this.page);
});

When('I open the Personal Details URL for employee {string}', async function (
    this: CustomWorld,
    employeeId: string
) {
    await this.page.goto('/web/index.php/pim/viewPersonalDetails/empNumber/' + employeeId);
});

Then('the Login page is displayed instead of employee details', async function (this: CustomWorld) {
    await expect(this.page).toHaveURL(/\/auth\/login$/, { timeout: 60_000 });
    await this.loginPage.expectVisible();
    await expect(this.personalDetailsPage.heading()).toHaveCount(0);
    // The Login page correctly contains a login form; verify the employee form is absent instead.
    await expect(firstNameInput(this.page)).toHaveCount(0);
});
