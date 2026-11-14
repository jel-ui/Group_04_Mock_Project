import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { config } from '../support/config';
import { CustomWorld } from '../support/world';

When('I turn off Create Login Details', async function (this: CustomWorld) {
    await this.addEmployeePage.turnOffCreateLoginDetails();
});

Then('the Login Details fields are hidden', async function (this: CustomWorld) {
    await this.addEmployeePage.expectCreateLoginDetailsOff();
});

Then('the created employee account login result is {string}', async function (
    this: CustomWorld,
    expectedResult: string
) {
    const credentials = this.createdLoginDetails;
    if (!credentials) throw new Error('Login details were not captured before account verification.');

    const browser = this.context.browser();
    if (!browser) throw new Error('Could not access the browser to verify the employee account.');

    const verificationContext = await browser.newContext({ baseURL: config.baseUrl });
    try {
        const page = await verificationContext.newPage();
        const loginPage = new LoginPage(page);
        await loginPage.open();
        await loginPage.login(credentials.username, credentials.password);

        if (expectedResult === 'signed in') {
            const dashboardPage = new DashboardPage(page);
            await dashboardPage.expectVisible();
            if (this.employeeUnderTest) {
                await dashboardPage.expectUserName(
                    `${this.employeeUnderTest.firstName} ${this.employeeUnderTest.lastName}`
                );
            }
            return;
        }
        if (expectedResult === 'not signed in') {
            await loginPage.expectBlocked();
            return;
        }
        // Còn lại là nội dung thông báo lỗi (vd. "Account disabled"): phải hiện đúng thông báo và vẫn ở trang Login.
        await loginPage.expectErrorMessage(expectedResult);
        await expect(page).toHaveURL(/\/auth\/login$/);
    } finally {
        await verificationContext.close();
    }
});

Then('the user account {string} is absent in User Management', async function (
    this: CustomWorld,
    username: string
) {
    await this.systemUsersPage.open();
    await this.systemUsersPage.searchByUsername(username);
    await this.systemUsersPage.expectUserAbsent(username);
});
