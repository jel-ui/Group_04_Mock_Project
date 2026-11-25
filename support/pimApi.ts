import type { APIResponse, Page } from '@playwright/test';

// Gọi API của OrangeHRM bằng cookie đăng nhập của trình duyệt.
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
    constructor(private readonly page: Page) {}

    private async json(response: APIResponse, action: string) {
        if (!response.ok()) {
            throw new Error(`[API] ${action} failed: HTTP ${response.status()} ${(await response.text()).slice(0, 300)}`);
        }
        return response.json();
    }

    async countEmployees(include: IncludeEmployees) {
        const response = await this.page.request.get(`${API}/pim/employees`, {
            params: { limit: 1, includeEmployees: include }
        });
        return (await this.json(response, 'Count employees')).meta.total as number;
    }

    // API tìm Employee Id theo kiểu "chứa chuỗi", nên trả về mọi nhân viên có Id chứa giá trị này.
    async findEmployeesWithIdContaining(employeeId: string): Promise<ApiEmployee[]> {
        const response = await this.page.request.get(`${API}/pim/employees`, {
            params: { limit: 50, employeeId, includeEmployees: 'currentAndPast' }
        });
        return (await this.json(response, `Find Employee Id "${employeeId}"`)).data;
    }

    async findEmployeesWithId(employeeId: string) {
        return (await this.findEmployeesWithIdContaining(employeeId)).filter((employee) => employee.employeeId === employeeId);
    }

    async createEmployee(firstName: string, lastName: string, employeeId: string): Promise<ApiEmployee> {
        const response = await this.page.request.post(`${API}/pim/employees`, {
            data: { firstName, middleName: '', lastName, employeeId }
        });
        return (await this.json(response, `Create employee "${employeeId}"`)).data;
    }

    async deleteEmployees(employees: ApiEmployee[]) {
        if (employees.length === 0) return;
        const response = await this.page.request.delete(`${API}/pim/employees`, {
            data: { ids: employees.map((employee) => employee.empNumber) }
        });
        await this.json(response, 'Delete employees');
    }

    // Cho nhân viên nghỉ việc với lý do "Other" (id 1, có sẵn trên OrangeHRM).
    async terminateEmployee(employee: ApiEmployee, date = new Date().toISOString().slice(0, 10)) {
        const response = await this.page.request.post(`${API}/pim/employees/${employee.empNumber}/terminations`, {
            data: { terminationReasonId: 1, date }
        });
        await this.json(response, `Terminate employee "${employee.employeeId}"`);
    }

    async setEmploymentStatus(employee: ApiEmployee, statusName: string) {
        const statuses = await this.json(
            await this.page.request.get(`${API}/admin/employment-statuses`, { params: { limit: 0 } }),
            'List employment statuses'
        );
        const status = (statuses.data as { id: number; name: string }[]).find((item) => item.name === statusName);
        if (!status) throw new Error(`Employment Status "${statusName}" is not configured in Admin.`);

        const response = await this.page.request.put(`${API}/pim/employees/${employee.empNumber}/job-details`, {
            data: { empStatusId: status.id }
        });
        await this.json(response, `Set Employment Status of "${employee.employeeId}"`);
    }
}
