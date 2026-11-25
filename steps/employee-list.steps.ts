import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { config } from '../support/config';
import { employeeListEmployees } from '../support/testData';
import { CustomWorld } from '../support/world';

// ---------- Chuẩn bị dữ liệu ----------

const [CURRENT_ONLY, CURRENT_AND_PAST, PAST_ONLY] = ['Current Employees Only', 'Current and Past Employees', 'Past Employees Only'];

function employeeListEmployee(employeeId: string) {
    const employee = employeeListEmployees[employeeId];
    if (!employee) throw new Error(`Employee "${employeeId}" is not declared in employeeListEmployees (support/testData.ts).`);
    return employee;
}

// Làm việc trên Employee List ở tab mới để không đổi bộ lọc của tab đang kiểm tra.
async function inNewTab<T>(world: CustomWorld, action: (employeeList: EmployeeListPage) => Promise<T>) {
    const page = await world.context.newPage();
    page.setDefaultTimeout(config.actionTimeout);
    try {
        const employeeList = new EmployeeListPage(page);
        await employeeList.openWithResults();
        return await action(employeeList);
    } finally {
        await page.close();
    }
}

function countFor(world: CustomWorld, include: string) {
    return inNewTab(world, async (employeeList) => {
        await employeeList.selectFilterOption('Include', include);
        await employeeList.clickSearch();
        return employeeList.recordsFoundCount();
    });
}

// Tính từ hai lựa chọn Include còn lại: Current and Past = Current + Past.
async function expectedCountFor(world: CustomWorld, include: string) {
    if (include === CURRENT_AND_PAST) return (await countFor(world, CURRENT_ONLY)) + (await countFor(world, PAST_ONLY));
    if (include === CURRENT_ONLY) return (await countFor(world, CURRENT_AND_PAST)) - (await countFor(world, PAST_ONLY));
    if (include === PAST_ONLY) return (await countFor(world, CURRENT_AND_PAST)) - (await countFor(world, CURRENT_ONLY));
    throw new Error(`Unknown Include option "${include}".`);
}

Given('I am logged in and on the Employee List page', async function (this: CustomWorld) {
    await this.loginPage.open();
    await this.loginPage.login(config.username, config.password);
    await this.dashboardPage.expectVisible();
    await this.employeeListPage.loadResults(async () => {
        await this.dashboardPage.openPIM();
        await this.employeeListPage.expectVisible();
    });
});

// Xoá mọi nhân viên mà ô Employee Id tìm ra với giá trị này để chắc chắn không có kết quả.
Given('no employee has an Employee Id containing {string}', async function (this: CustomWorld, employeeId: string) {
    await inNewTab(this, (employeeList) => employeeList.deleteEmployeesFoundById(employeeId));
});

// ---------- Thao tác trên bộ lọc ----------

When('I type {string} in the {string} filter', async function (this: CustomWorld, text: string, label: string) {
    await this.employeeListPage.typeInAutocomplete(label, text);
});

When('I type {string} in the {string} filter without selecting a suggestion', async function (
    this: CustomWorld,
    text: string,
    label: string
) {
    await this.employeeListPage.typeInAutocomplete(label, text);
    await this.employeeListPage.autocompleteSuggestions();
});

When('I choose {string} from the {string} suggestions after typing {string}', async function (
    this: CustomWorld,
    suggestion: string,
    label: string,
    typedText: string
) {
    await this.employeeListPage.chooseSuggestion(label, typedText, suggestion);
});

When('I enter {string} in the {string} filter', async function (this: CustomWorld, value: string, label: string) {
    await this.employeeListPage.filterInput(label).fill(value);
});

When('I clear the {string} filter', async function (this: CustomWorld, label: string) {
    await this.employeeListPage.filterInput(label).clear();
});

When('I open the {string} filter dropdown', async function (this: CustomWorld, label: string) {
    await this.employeeListPage.openFilterDropdown(label);
});

When('I select {string} in the {string} filter', async function (this: CustomWorld, option: string, label: string) {
    await this.employeeListPage.selectFilterOption(label, option);
});

When('I click Search', async function (this: CustomWorld) {
    await this.employeeListPage.clickSearch();
});

// ---------- Kiểm tra bộ lọc ----------

Then('the Employee Information filter shows the fields:', async function (this: CustomWorld, table: DataTable) {
    await expect(this.employeeListPage.heading()).toBeVisible();
    for (const label of table.raw().flat()) {
        await expect(this.employeeListPage.filterLabel(label), `Filter "${label}" should be shown`).toBeVisible();
    }
});

Then('the {string} filter is an autocomplete field with placeholder {string}', async function (
    this: CustomWorld,
    label: string,
    placeholder: string
) {
    await expect(this.employeeListPage.autocompleteWrapper(label)).toBeVisible();
    await expect(this.employeeListPage.filterInput(label)).toHaveAttribute('placeholder', placeholder);
    await expect(this.employeeListPage.filterInput(label)).toHaveValue('');
});

Then('the {string} filter is a text field', async function (this: CustomWorld, label: string) {
    await expect(this.employeeListPage.filterInput(label)).toBeEditable();
    await expect(this.employeeListPage.autocompleteWrapper(label)).toHaveCount(0);
});

Then('the {string} filter is a dropdown showing {string}', async function (this: CustomWorld, label: string, value: string) {
    await expect(this.employeeListPage.filterSelect(label)).toHaveText(value);
});

Then('the {string} filter has the value {string}', async function (this: CustomWorld, label: string, value: string) {
    await expect(this.employeeListPage.filterInput(label)).toHaveValue(value);
});

Then('the {string} filter shows no validation error', async function (this: CustomWorld, label: string) {
    await expect(this.employeeListPage.validationError(label)).toHaveCount(0);
});

Then('the {string} suggestions include {string}', async function (this: CustomWorld, _label: string, suggestion: string) {
    const suggestions = await this.employeeListPage.autocompleteSuggestions(suggestion);
    expect(suggestions).toContain(suggestion);
});

Then('every {string} suggestion contains {string}', async function (this: CustomWorld, _label: string, text: string) {
    const suggestions = await this.employeeListPage.autocompleteSuggestions();
    expect(suggestions.length, 'There should be at least one suggestion').toBeGreaterThan(0);
    for (const suggestion of suggestions) {
        expect(suggestion.toLowerCase(), `Suggestion "${suggestion}"`).toContain(text.toLowerCase());
    }
});

Then('the dropdown options include:', async function (this: CustomWorld, table: DataTable) {
    const options = (await this.employeeListPage.dropdownOptions().allInnerTexts()).map((text) => text.trim());
    expect(options).toEqual(expect.arrayContaining(table.raw().flat()));
});

Then('the dropdown options are exactly:', async function (this: CustomWorld, table: DataTable) {
    await expect(this.employeeListPage.dropdownOptions()).toHaveText(table.raw().flat());
});

Then('the selected dropdown option is {string}', async function (this: CustomWorld, option: string) {
    await expect(this.employeeListPage.selectedDropdownOption()).toHaveText(option);
});

// ---------- Kiểm tra kết quả ----------

Then('the Records Found label shows {string}', async function (this: CustomWorld, text: string) {
    await expect(this.employeeListPage.recordsLabel()).toHaveText(text);
});

Then('the result list is empty', async function (this: CustomWorld) {
    await expect(this.employeeListPage.resultRows()).toHaveCount(0);
});

Then('the results include employee {string}', async function (this: CustomWorld, employeeId: string) {
    const { firstName, lastName } = employeeListEmployee(employeeId);
    const row = this.employeeListPage.rowsForEmployeeId(employeeId).filter({ hasText: firstName }).filter({ hasText: lastName });
    await expect(row, `Employee ${employeeId} ${firstName} ${lastName} should be listed`).toHaveCount(1);
});

Then('the results contain only employee {string}', async function (this: CustomWorld, employeeId: string) {
    await expect(this.employeeListPage.resultRows()).toHaveCount(1);
    expect(await this.employeeListPage.columnValues('Id')).toEqual([employeeId]);
});

Then('every result has {string} in the {string} column', async function (this: CustomWorld, value: string, column: string) {
    const values = await this.employeeListPage.columnValues(column);
    expect(values.length, 'The result list should not be empty').toBeGreaterThan(0);
    expect(values.filter((item) => item !== value), `Rows whose ${column} is not "${value}"`).toEqual([]);
});

Then('every result has an {string} containing {string}', async function (this: CustomWorld, column: string, text: string) {
    const values = await this.employeeListPage.columnValues(column);
    expect(values.length, 'The result list should not be empty').toBeGreaterThan(0);
    expect(values.filter((item) => !item.toLowerCase().includes(text.toLowerCase())), `Rows whose ${column} does not contain "${text}"`).toEqual([]);
});

Then('every result has a name containing {string}', async function (this: CustomWorld, text: string) {
    const firstNames = await this.employeeListPage.columnValues('First (& Middle) Name');
    const lastNames = await this.employeeListPage.columnValues('Last Name');
    expect(firstNames.length, 'The result list should not be empty').toBeGreaterThan(0);
    const names = firstNames.map((firstName, index) => `${firstName} ${lastNames[index]}`);
    expect(names.filter((name) => !name.toLowerCase().includes(text.toLowerCase())), `Names without "${text}"`).toEqual([]);
});

Then('no result is marked {string}', async function (this: CustomWorld, marker: string) {
    await expect(this.employeeListPage.resultRows().first(), 'The result list should not be empty').toBeVisible();
    await expect(this.employeeListPage.resultRows().filter({ hasText: marker })).toHaveCount(0);
});

// Demo dùng chung: người khác có thể thêm/xoá nhân viên giữa các lần đếm,
// nên nếu lệch thì tìm lại với cùng bộ lọc (tối đa 3 lần) trước khi kết luận fail.
Then('the Records Found count equals the number of {string} employees in PIM', async function (
    this: CustomWorld,
    include: string
) {
    let shown = 0;
    let expected = 0;
    for (let attempt = 1; attempt <= 3; attempt++) {
        shown = await this.employeeListPage.recordsFoundCount();
        expected = await expectedCountFor(this, include);
        if (shown === expected) break;
        if (attempt < 3) await this.employeeListPage.clickSearch();
    }
    expect(shown, `Records Found should equal the number of "${include}" employees`).toBe(expected);
});

// ---------- Include, Reset, Supervisor Name (EL_13-EL_24) ----------

Given('I note the current results', async function (this: CustomWorld) {
    const page = this.employeeListPage;
    this.notedResults = {
        records: (await page.recordsLabel().innerText()).trim(),
        ids: await page.columnValues('Id'),
        searchCount: page.watchResultRequests()
    };
});

When('I click Reset', async function (this: CustomWorld) {
    await this.employeeListPage.clickReset();
});

Then('the results are unchanged', async function (this: CustomWorld) {
    const noted = this.notedResults;
    if (!noted) throw new Error('The results were not noted before.');
    expect(noted.searchCount(), 'No search should have been sent').toBe(0);
    await expect(this.employeeListPage.recordsLabel()).toHaveText(noted.records);
    expect(await this.employeeListPage.columnValues('Id')).toEqual(noted.ids);
});

Then('every result is marked {string}', async function (this: CustomWorld, marker: string) {
    await expect(this.employeeListPage.resultRows().first(), 'The result list should not be empty').toBeVisible();
    await expect(this.employeeListPage.resultRows().filter({ hasNotText: marker })).toHaveCount(0);
});

Then('the Records Found count is greater than the number of {string} employees in PIM', async function (
    this: CustomWorld,
    include: string
) {
    const shown = await this.employeeListPage.recordsFoundCount();
    expect(shown).toBeGreaterThan(await countFor(this, include));
});

Then('the {string} filter shows the name {string}', async function (this: CustomWorld, label: string, name: string) {
    await this.employeeListPage.expectAutocompleteValue(label, name);
});

Then('the {string} filter shows the error {string} with a red border', async function (
    this: CustomWorld,
    label: string,
    message: string
) {
    await expect(this.employeeListPage.validationError(label)).toHaveText(message);
    await expect(this.employeeListPage.autocompleteErrorBorder(label)).toBeVisible();
});
