import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { createUnusedEmployeeId, deleteEmployeeById, deleteUserByUsername, findEmployeeNumbers } from '../support/testData';
import { CustomWorld } from '../support/world';

When('I save the employee', async function (this: CustomWorld) {
    await this.addEmployeePage.clickSave();
});

Then('the employee profile shows the submitted details', async function (this: CustomWorld) {
    const employee = this.employeeUnderTest;
    if (!employee) throw new Error('Employee data was not captured before saving.');

    await this.addEmployeePage.expectSavedEmployee(
        employee.firstName,
        employee.middleName,
        employee.lastName,
        employee.employeeId
    );
});

Then('the {string} field shows the {string} error', async function (
    this: CustomWorld,
    fieldName: string,
    message: string
) {
    await this.addEmployeePage.expectFieldError(fieldName, message);
});

Then('the employee form remains unsaved', async function (this: CustomWorld) {
    await this.addEmployeePage.expectNotSaved();
});

// ---------- Chuẩn bị và dọn dữ liệu cố định ----------

// Sau khi dọn thì tải lại form để Employee Id gợi ý là mới nhất.
// Demo dùng chung có người khác thêm nhân viên liên tục, Id gợi ý cũ có thể đã bị lấy mất.
Given('no employee uses Employee Id {string}', async function (this: CustomWorld, employeeId: string) {
    await deleteEmployeeById(this.context.request, employeeId);
    await this.addEmployeePage.open();
});

Given('no user account uses Username {string}', async function (this: CustomWorld, username: string) {
    await deleteUserByUsername(this.context.request, username);
    await this.addEmployeePage.open();
});

// Tạo nhân viên nền nếu demo chưa có Id này, rồi quay lại form Add Employee trống.
Given('an employee with Employee Id {string} exists', async function (this: CustomWorld, employeeId: string) {
    const existing = await findEmployeeNumbers(this.context.request, employeeId);
    if (existing.length > 0) return;

    await this.addEmployeePage.enterEmployeeDetails({
        'First Name': 'QAAn',
        'Last Name': 'Nguyen',
        'Employee Id': employeeId
    });
    await this.addEmployeePage.clickSave();
    await this.addEmployeePage.expectSaved();
    await this.addEmployeePage.open();
});

// Bảng dọc, giá trị cố định. Không có dòng Employee Id thì giữ Id hệ thống gợi ý.
When('I enter employee details:', async function (this: CustomWorld, table: DataTable) {
    const data = table.rowsHash();
    await this.addEmployeePage.enterEmployeeDetails(data);

    this.employeeUnderTest = {
        firstName: data['First Name'] || '',
        middleName: data['Middle Name'] || '',
        lastName: data['Last Name'] || '',
        employeeId: data['Employee Id'] || await this.addEmployeePage.getEmployeeId()
    };
});

// Dùng cho Scenario Outline validation: giá trị viết trong ngoặc kép để giữ được dấu cách.
// "" nghĩa là không nhập (Employee Id thì giữ Id gợi ý).
When('I enter First Name {string}, Last Name {string} and Employee Id {string}', async function (
    this: CustomWorld,
    firstName: string,
    lastName: string,
    employeeId: string
) {
    if (firstName) await this.addEmployeePage.enterFirstName(firstName);
    if (lastName) await this.addEmployeePage.enterLastName(lastName);
    if (employeeId) await this.addEmployeePage.enterEmployeeId(employeeId);
});

When('I enter login details:', async function (this: CustomWorld, table: DataTable) {
    const data = table.rowsHash();
    await this.addEmployeePage.enterLoginDetails(data);
    this.createdLoginDetails = { username: data['Username'], password: data['Password'] };
});

When('I change the Employee Id to {string}', async function (this: CustomWorld, employeeId: string) {
    await this.addEmployeePage.enterEmployeeId(employeeId);
    if (this.employeeUnderTest) this.employeeUnderTest.employeeId = employeeId;
});

When('I note the suggested Employee Id', async function (this: CustomWorld) {
    this.notedEmployeeId = await this.addEmployeePage.getEmployeeId();
});

When('I open the Add Employee page again', async function (this: CustomWorld) {
    await this.addEmployeePage.open();
});

When('I upload the profile photo {string}', async function (this: CustomWorld, fileName: string) {
    await this.addEmployeePage.uploadPhoto(fileName);
});

// fields: danh sách tên field cách nhau bằng dấu phẩy, ví dụ "First Name, Last Name".
Then('the fields {string} show the {string} error', async function (
    this: CustomWorld,
    fields: string,
    message: string
) {
    for (const fieldName of fields.split(',').map((field) => field.trim())) {
        await this.addEmployeePage.expectFieldError(fieldName, message);
    }
});

Then('the profile photo shows the {string} error', async function (this: CustomWorld, message: string) {
    await this.addEmployeePage.expectPhotoError(message);
});

Then('the suggested Employee Id is greater than the noted one', async function (this: CustomWorld) {
    if (!this.notedEmployeeId) throw new Error('The suggested Employee Id was not noted before saving.');

    const newEmployeeId = await this.addEmployeePage.getEmployeeId();
    expect(newEmployeeId).not.toBe(this.notedEmployeeId);
    expect(Number(newEmployeeId)).toBeGreaterThan(Number(this.notedEmployeeId));
});

// ---------- Employee Id duy nhất cho dữ liệu test ----------

// Dùng Employee Id ngẫu nhiên đã kiểm tra qua API cho các test không kiểm tra chính ID gợi ý.
// Cách này tránh phụ thuộc vào ID gợi ý có thể bị người dùng khác lấy trong lúc CI đang chạy.
Given('I have an unused Employee Id', async function (this: CustomWorld) {
    const employeeId = await createUnusedEmployeeId(this.context.request);
    await this.addEmployeePage.enterEmployeeId(employeeId);
});

// ---------- Giao diện form (AE_U01 - AE_U06) ----------

// Bảng: | Field | Required |, Required là yes/no.
// Kiểm tra hết các dòng rồi mới báo lỗi, để báo cáo thấy đủ mọi field lệch với test case.
Then('the form fields are shown:', async function (this: CustomWorld, table: DataTable) {
    const rows = table.hashes();
    for (const row of rows) {
        await this.addEmployeePage.expectFieldShown(row['Field']);
    }

    const mismatches: string[] = [];
    for (const row of rows) {
        try {
            await this.addEmployeePage.expectRequiredMarker(row['Field'], row['Required'] === 'yes');
        } catch (error) {
            mismatches.push((error as Error).message.split('\n')[0]);
        }
    }
    if (mismatches.length > 0) throw new Error(mismatches.join('\n'));
});

Then('the fields {string} are visible', async function (this: CustomWorld, fields: string) {
    for (const fieldName of fields.split(',').map((field) => field.trim())) {
        await this.addEmployeePage.expectFieldShown(fieldName);
    }
});

Then('the profile photo picker is shown', async function (this: CustomWorld) {
    await this.addEmployeePage.expectPhotoPickerShown();
});

Then('the suggested Employee Id is filled in', async function (this: CustomWorld) {
    await this.addEmployeePage.getEmployeeId();
});

Then('Create Login Details is turned off', async function (this: CustomWorld) {
    await this.addEmployeePage.expectCreateLoginDetailsOff();
});

// names: danh sách cách nhau bằng dấu phẩy, ví dụ "Cancel, Save".
Then('the buttons {string} are shown', async function (this: CustomWorld, names: string) {
    for (const name of names.split(',').map((item) => item.trim())) {
        await this.addEmployeePage.expectButtonShown(name);
    }
});

Then('the text {string} is shown', async function (this: CustomWorld, text: string) {
    await this.addEmployeePage.expectTextShown(text);
});

When('I turn on Create Login Details', async function (this: CustomWorld) {
    await this.addEmployeePage.turnOnCreateLoginDetails();
});

Then('the Status options {string} are shown', async function (this: CustomWorld, options: string) {
    for (const status of options.split(',').map((item) => item.trim())) {
        await this.addEmployeePage.expectStatusOptionShown(status);
    }
});

Then('the Status {string} is selected', async function (this: CustomWorld, status: string) {
    await this.addEmployeePage.expectStatusSelected(status);
});

// Test case không ghi nguyên văn dòng gợi ý nên chỉ kiểm tra phần nội dung chính.
Then('the password hint mentions {string}', async function (this: CustomWorld, text: string) {
    await this.addEmployeePage.expectTextShown(text, false);
});

Then('the profile heading is {string}', async function (this: CustomWorld, name: string) {
    await this.addEmployeePage.expectProfileHeading(name);
});

Then('the {string} field has the value {string}', async function (
    this: CustomWorld,
    fieldName: string,
    value: string
) {
    await this.addEmployeePage.expectFieldValue(fieldName, value);
});
