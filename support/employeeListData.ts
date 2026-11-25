import { AfterAll, Before } from '@cucumber/cucumber';
import { config } from './config';
import { loginPimApi, type ApiEmployee, type PimApi } from './pimApi';
import { employeeListEmployees } from './testData';

// 56423 Shii Kouhai có Supervisor là 56422 Shii Senpai; 56424 Shii Sayonara đã nghỉ việc.
const SUPERVISOR_ID = '56422';
const SUBORDINATE_ID = '56423';
const PAST_ID = '56424';

let api: PimApi | undefined;
let created: ApiEmployee[] = [];
let setup: Promise<void> | undefined;

async function createEmployee(employeeId: string) {
    const { firstName, lastName } = employeeListEmployees[employeeId];
    await api!.deleteEmployees(await api!.findEmployeesWithId(employeeId));
    const employee = await api!.createEmployee(firstName, lastName, employeeId);
    created.push(employee);
    return employee;
}

async function createEmployeeListData() {
    api ??= await loginPimApi(config.baseUrl, config.username, config.password);
    created = [];
    const supervisor = await createEmployee(SUPERVISOR_ID);
    const subordinate = await createEmployee(SUBORDINATE_ID);
    await api.assignSupervisor(subordinate, supervisor);
    await api.terminateEmployee(await createEmployee(PAST_ID));
}

// Tạo dữ liệu một lần cho cả lần chạy; lỗi thì scenario sau (hoặc lần retry) tạo lại.
Before({ tags: '@employee-list-data' }, async function () {
    setup ??= createEmployeeListData().catch((error) => {
        setup = undefined;
        throw error;
    });
    await setup;
});

AfterAll(async function () {
    if (!api) return;
    try {
        await api.deleteEmployees(created);
    } finally {
        await api.dispose();
    }
});
