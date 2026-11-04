import { randomBytes } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';

// Dọn dữ liệu cố định trước khi scenario nhập lại, để chạy lại nhiều lần không bị "already exists".
// Dùng API mà chính giao diện OrangeHRM gọi (xem F12 > Network khi xoá ở Employee List / User Management).
// request phải lấy từ context đã đăng nhập (this.context.request), nên gọi sau Background.

const API = '/web/index.php/api/v2';

async function getData(request: APIRequestContext, url: string) {
    const response = await request.get(url);
    if (!response.ok()) throw new Error(`GET ${url} trả về ${response.status()}`);
    return (await response.json()).data;
}

async function deleteByIds(request: APIRequestContext, url: string, ids: number[]) {
    if (ids.length === 0) return;
    const response = await request.delete(url, { data: { ids } });
    if (!response.ok()) throw new Error(`DELETE ${url} trả về ${response.status()}`);
}

// Tìm empNumber của nhân viên có Employee Id đúng bằng employeeId (API tìm gần đúng nên lọc lại).
export async function findEmployeeNumbers(request: APIRequestContext, employeeId: string) {
    const employees = await getData(request, `${API}/pim/employees?nameOrId=${encodeURIComponent(employeeId)}&includeEmployees=currentAndPast`);
    return employees
        .filter((employee: { employeeId: string }) => employee.employeeId === employeeId)
        .map((employee: { empNumber: number }) => employee.empNumber);
}

export async function createUnusedEmployeeId(request: APIRequestContext) {
    for (let attempt = 0; attempt < 10; attempt++) {
        const employeeId = 'T' + randomBytes(5).toString('hex').slice(0, 9).toUpperCase();
        if ((await findEmployeeNumbers(request, employeeId)).length === 0) return employeeId;
    }
    throw new Error('Could not generate an unused Employee Id after 10 attempts.');
}
// Xoá nhân viên đang dùng Employee Id này (tài khoản login gắn với nhân viên cũng bị xoá theo).
export async function deleteEmployeeById(request: APIRequestContext, employeeId: string) {
    await deleteByIds(request, `${API}/pim/employees`, await findEmployeeNumbers(request, employeeId));
}

// Xoá tài khoản có Username này. Nếu tài khoản gắn với nhân viên thì xoá luôn nhân viên đó.
export async function deleteUserByUsername(request: APIRequestContext, username: string) {
    const users = await getData(request, `${API}/admin/users?username=${encodeURIComponent(username)}`);
    const matched = users.filter((user: { userName: string }) => user.userName.toLowerCase() === username.toLowerCase());

    const employeeNumbers: number[] = [];
    const userIds: number[] = [];
    for (const user of matched) {
        if (user.employee?.empNumber) employeeNumbers.push(user.employee.empNumber);
        else userIds.push(user.id);
    }
    await deleteByIds(request, `${API}/pim/employees`, employeeNumbers);
    await deleteByIds(request, `${API}/admin/users`, userIds);
}
