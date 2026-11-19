import { DataTable, Given, Then, When } from '@cucumber/cucumber';
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

When('I enter the date {string} as typed in the {string} field', async function (
    this: CustomWorld,
    date: string,
    label: string
) {
    await this.personalDetailsPage.fillDateAsTyped(label, date);
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

When('I type {string} in the {string} dropdown without selecting an option', async function (
    this: CustomWorld,
    letter: string,
    label: string
) {
    await this.personalDetailsPage.typeLetterInDropdown(label, letter);
});


Then('the option {string} is visible', async function (this: CustomWorld, option: string) {
    await this.personalDetailsPage.expectDropdownOptionVisible(option);
});
When('I type {string} in the {string} dropdown', async function (
    this: CustomWorld,
    letter: string,
    label: string
) {
    await this.personalDetailsPage.selectDropdownOptionByLetter(label, letter);
});

When('I press {string} twice in the {string} dropdown', async function (
    this: CustomWorld,
    letter: string,
    label: string
) {
    const selected = [];
    selected.push(await this.personalDetailsPage.selectDropdownOptionByLetter(label, letter));
    selected.push(await this.personalDetailsPage.selectDropdownOptionByLetter(label, letter));
    this.scenarioData['keyboard-dropdown-selections'] = JSON.stringify(selected);
});

Then('the keyboard selection cycles through:', async function (this: CustomWorld, values: DataTable) {
    const saved = this.scenarioData['keyboard-dropdown-selections'];
    const actual = saved ? JSON.parse(saved) as string[] : undefined;
    const expected = values.raw().map(([value]) => value);
    if (!actual || JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected keyboard selections ${expected.join(' -> ')}, received ${actual?.join(' -> ') ?? 'none'}.`);
    }
});

Then('the {string} option is unavailable in the {string} dropdown', async function (
    this: CustomWorld,
    option: string,
    label: string
) {
    await this.personalDetailsPage.expectDropdownOptionUnavailable(label, option);
});
