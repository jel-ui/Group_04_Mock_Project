import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { config } from '../support/config';
import { includeOptions, type ApiEmployee } from '../support/pimApi';
import { employeeListEmployees } from '../support/testData';
import { CustomWorld } from '../support/world';

// ---------- Chuẩn bị dữ liệu ----------

function employeeListEmployee(employeeId: string) {
    const employee = employeeListEmployees[employeeId];
    if (!employee) throw new Error(`Employee "${employeeId}" is not declared in employeeListEmployees (support/testData.ts).`);
    return employee;
}

// Đảm bảo có đúng một nhân viên với Employee Id này, đúng họ tên và đúng trạng thái (hiện tại / đã nghỉ).
// Demo dùng chung nên nhân viên test có thể bị người khác xoá hoặc sửa; khi đó xoá bản ghi lệch và tạo lại.
async function ensureEmployee(world: CustomWorld, employeeId: string, state: 'current' | 'past'): Promise<ApiEmployee> {
    const { firstName, lastName } = employeeListEmployee(employeeId);
    const matches = await world.pimApi.findEmployeesWithId(employeeId);
    const existing = matches[0];
    const isPast = existing?.terminationId !== null && existing?.terminationId !== undefined;
    if (
        matches.length === 1 &&
        existing.firstName === firstName &&
        existing.middleName === '' &&
        existing.lastName === lastName &&
        isPast === (state === 'past')
    ) {
        return existing;
    }

    await world.pimApi.deleteEmployees(matches);
    const created = await world.pimApi.createEmployee(firstName, lastName, employeeId);
    if (state === 'past') await world.pimApi.terminateEmployee(created);
    return created;
}

Given('I am logged in and on the Employee List page', async function (this: CustomWorld) {
    await this.loginPage.open();
    await this.loginPage.login(config.username, config.password);
    await this.dashboardPage.expectVisible();
    await this.dashboardPage.openPIM();
    await this.employeeListPage.expectVisible();
    await expect(this.employeeListPage.recordsLabel()).toBeVisible({ timeout: 60000 });
});

Given('the current employee {string} exists', async function (this: CustomWorld, employeeId: string) {
    await ensureEmployee(this, employeeId, 'current');
});

Given('the current employee {string} has Employment Status {string}', async function (
    this: CustomWorld,
    employeeId: string,
    status: string
) {
    const employee = await ensureEmployee(this, employeeId, 'current');
    await this.pimApi.setEmploymentStatus(employee, status);
});

Given('the past employee {string} exists', async function (this: CustomWorld, employeeId: string) {
    await ensureEmployee(this, employeeId, 'past');
    const current = await this.pimApi.countEmployees('onlyCurrent');
    const all = await this.pimApi.countEmployees('currentAndPast');
    expect(all, 'There should be at least one past employee in PIM').toBeGreaterThan(current);
});

// Ô Employee Id tìm theo kiểu "chứa chuỗi", nên dọn mọi Id chứa giá trị này để chắc chắn không có kết quả.
Given('no employee has an Employee Id containing {string}', async function (this: CustomWorld, employeeId: string) {
    await this.pimApi.deleteEmployees(await this.pimApi.findEmployeesWithIdContaining(employeeId));
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

// Đối chiếu "(N) Records Found" với số nhân viên lấy trực tiếp từ API.
// Demo dùng chung: người khác có thể thêm/xoá nhân viên giữa lúc bảng tải và lúc gọi API,
// nên nếu lệch thì tìm lại với cùng bộ lọc (tối đa 3 lần) trước khi kết luận fail.
Then('the Records Found count equals the number of {string} employees in PIM', async function (
    this: CustomWorld,
    include: string
) {
    const includeEmployees = includeOptions[include];
    if (!includeEmployees) throw new Error(`Unknown Include option "${include}".`);

    let shown = 0;
    let expected = 0;
    for (let attempt = 1; attempt <= 3; attempt++) {
        shown = await this.employeeListPage.recordsFoundCount();
        expected = await this.pimApi.countEmployees(includeEmployees);
        if (shown === expected) break;
        if (attempt < 3) await this.employeeListPage.clickSearch();
    }
    expect(shown, `Records Found should equal the number of "${include}" employees`).toBe(expected);
});
