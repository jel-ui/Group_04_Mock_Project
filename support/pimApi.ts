import { request as playwrightRequest, type APIRequestContext, type APIResponse } from '@playwright/test';

// Gọi API của OrangeHRM bằng cookie đăng nhập của trình duyệt (hoặc của loginPimApi).
// Chỉ dùng để chuẩn bị dữ liệu (precondition) và làm nguồn đối chiếu số liệu;
// thao tác cần kiểm thử vẫn làm trên giao diện.

const API = '/web/index.php/api/v2';

export type IncludeEmployees = 'onlyCurrent' | 'currentAndPast' | 'onlyPast';

// Lựa chọn của dropdown Include và giá trị tương ứng trên API.
export const includeOptions: Record<string, IncludeEmployees> = {
    'Current Employees Only': 'onlyCurrent',
    'Current and Past Employees': 'currentAndPast',
    'Past Employees Only': 'onlyPast'
};

export interface ApiEmployee {
    empNumber: number;
    employeeId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    terminationId: number | null;
}

export class PimApi {
    constructor(private readonly request: APIRequestContext) {}

    private async json(response: APIResponse, action: string) {
        if (!response.ok()) {
            throw new Error(`[API] ${action} failed: HTTP ${response.status()} ${(await response.text()).slice(0, 300)}`);
        }
        return response.json();
    }

    async countEmployees(include: IncludeEmployees) {
        const response = await this.request.get(`${API}/pim/employees`, {
            params: { limit: 1, includeEmployees: include }
        });
        return (await this.json(response, 'Count employees')).meta.total as number;
    }

    // API tìm Employee Id theo kiểu "chứa chuỗi", nên trả về mọi nhân viên có Id chứa giá trị này.
    async findEmployeesWithIdContaining(employeeId: string): Promise<ApiEmployee[]> {
        const response = await this.request.get(`${API}/pim/employees`, {
            params: { limit: 50, employeeId, includeEmployees: 'currentAndPast' }
        });
        return (await this.json(response, `Find Employee Id "${employeeId}"`)).data;
    }

    async findEmployeesWithId(employeeId: string) {
        return (await this.findEmployeesWithIdContaining(employeeId)).filter((employee) => employee.employeeId === employeeId);
    }

    async createEmployee(firstName: string, lastName: string, employeeId: string): Promise<ApiEmployee> {
        const response = await this.request.post(`${API}/pim/employees`, {
            data: { firstName, middleName: '', lastName, employeeId }
        });
        return (await this.json(response, `Create employee "${employeeId}"`)).data;
    }

    async deleteEmployees(employees: ApiEmployee[]) {
        if (employees.length === 0) return;
        const response = await this.request.delete(`${API}/pim/employees`, {
            data: { ids: employees.map((employee) => employee.empNumber) }
        });
        await this.json(response, 'Delete employees');
    }

    // Cho nhân viên nghỉ việc với lý do "Other" (id 1, có sẵn trên OrangeHRM).
    async terminateEmployee(employee: ApiEmployee, date = new Date().toISOString().slice(0, 10)) {
        const response = await this.request.post(`${API}/pim/employees/${employee.empNumber}/terminations`, {
            data: { terminationReasonId: 1, date }
        });
        await this.json(response, `Terminate employee "${employee.employeeId}"`);
    }

    async setEmploymentStatus(employee: ApiEmployee, statusName: string) {
        const statuses = await this.json(
            await this.request.get(`${API}/admin/employment-statuses`, { params: { limit: 0 } }),
            'List employment statuses'
        );
        const status = (statuses.data as { id: number; name: string }[]).find((item) => item.name === statusName);
        if (!status) throw new Error(`Employment Status "${statusName}" is not configured in Admin.`);

        const response = await this.request.put(`${API}/pim/employees/${employee.empNumber}/job-details`, {
            data: { empStatusId: status.id }
        });
        await this.json(response, `Set Employment Status of "${employee.employeeId}"`);
    }

    async assignSupervisor(employee: ApiEmployee, supervisor: ApiEmployee) {
        const response = await this.request.post(`${API}/pim/employees/${employee.empNumber}/supervisors`, {
            data: { empNumber: supervisor.empNumber, reportingMethodId: 1 }
        });
        await this.json(response, `Assign supervisor of "${employee.employeeId}"`);
    }

    async dispose() {
        await this.request.dispose();
    }
}

// Đăng nhập qua form login (lấy _token trong trang) để có phiên API riêng, không dùng trình duyệt của scenario.
export async function loginPimApi(baseURL: string, username: string, password: string) {
    const request = await playwrightRequest.newContext({ baseURL });
    const loginPage = await (await request.get('/web/index.php/auth/login')).text();
    const token = loginPage.match(/:token="&quot;(.+?)&quot;"/)?.[1];
    if (!token) throw new Error('[API] Login token was not found on the login page.');

    const response = await request.post('/web/index.php/auth/validate', { form: { _token: token, username, password } });
    if (!/\/dashboard\//.test(response.url())) throw new Error(`[API] Login failed. Current URL: ${response.url()}`);
    return new PimApi(request);
}
