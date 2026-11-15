import { Given, Then, When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

// ---------- Other Id, Driver's License Number ----------

When('I enter {string} in the {string} field', async function (this: CustomWorld, value: string, label: string) {
    await this.personalDetailsPage.fillField(label, value);
});

When('I enter {int} {string} characters in the {string} field', async function (
    this: CustomWorld,
    count: number,
    character: string,
    label: string
) {
    await this.personalDetailsPage.fillField(label, character.repeat(count));
});

Then('the {string} field has the value {string}', async function (this: CustomWorld, label: string, value: string) {
    await this.personalDetailsPage.expectFieldValue(label, value);
});

Then('the {string} field has {int} {string} characters', async function (
    this: CustomWorld,
    label: string,
    count: number,
    character: string
) {
    await this.personalDetailsPage.expectFieldValue(label, character.repeat(count));
});

// Nhân viên phụ (ED_58, ED_66): lưu giá trị cho nhân viên khác rồi quay lại nhân viên đang test.
Given('employee {string} has {string} saved as {string}', async function (
    this: CustomWorld,
    otherEmployeeId: string,
    value: string,
    label: string
) {
    const employeeId = this.currentEmployeeId();

    await this.openPersonalDetails(otherEmployeeId);
    await this.personalDetailsPage.fillField(label, value);
    await this.personalDetailsPage.clickSave();
    await this.personalDetailsPage.expectToast('Successfully Updated');

    await this.openPersonalDetails(employeeId);
});

// ---------- Ngày (License Expiry Date, Date of Birth) ----------

When('I enter the date {string} in the {string} field', async function (this: CustomWorld, date: string, label: string) {
    await this.personalDetailsPage.fillDate(label, date);
});

When('I pick Today from the {string} calendar', async function (this: CustomWorld, label: string) {
    await this.personalDetailsPage.pickToday(label);
});

Then('the {string} field has the date {string}', async function (this: CustomWorld, label: string, date: string) {
    await this.personalDetailsPage.expectDateValue(label, date);
});

Then("the {string} field has today's date", async function (this: CustomWorld, label: string) {
    await this.personalDetailsPage.expectTodayValue(label);
});

Then('the {string} field shows the invalid date format error', async function (this: CustomWorld, label: string) {
    await this.personalDetailsPage.expectInvalidDateError(label);
});

// ---------- Nationality, Marital Status ----------

When('I select {string} in the {string} dropdown', async function (this: CustomWorld, option: string, label: string) {
    await this.personalDetailsPage.selectOption(label, option);
});

Then('the {string} dropdown shows {string}', async function (this: CustomWorld, label: string, option: string) {
    await this.personalDetailsPage.expectSelectedOption(label, option);
});
