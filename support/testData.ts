import { randomBytes } from 'node:crypto';

// Employee Id ngẫu nhiên 10 ký tự (giới hạn của field), dùng cho các test không kiểm tra Id gợi ý.
export function randomEmployeeId() {
    return 'T' + randomBytes(5).toString('hex').slice(0, 9).toUpperCase();
}

// Nhân viên test dùng riêng cho từng phần. Nếu bị xoá trên demo thì step mở Personal Details sẽ tạo lại.
export const testEmployees: Record<string, { firstName: string; lastName: string }> = {
    '56412': { firstName: 'Shii', lastName: 'Chan' },
    '56413': { firstName: 'Shii', lastName: 'Neko' },
    '56414': { firstName: 'Shii', lastName: 'Mori' },
    // Họ tên, Employee Id (ED_01-02, ED_20-51, ED_102-103).
    '56415': { firstName: 'Shii', lastName: 'Kumo' },
    // Nhân viên A có Employee Id "AB1234" cho ED_48, ED_49.
    'AB1234': { firstName: 'Shii', lastName: 'Aoi' }
};

// Nhân viên test của Employee List (Sprint 3). Họ hiếm để tìm theo tên chỉ ra đúng một người.
// Bị xoá, đổi tên hoặc sai trạng thái trên demo thì step chuẩn bị dữ liệu sẽ tạo lại.
export const employeeListEmployees: Record<string, { firstName: string; lastName: string }> = {
    // Nhân viên hiện tại (EL_02-05, EL_09).
    '56420': { firstName: 'Shii', lastName: 'Hoshino' },
    // Nhân viên đã nghỉ việc (EL_12).
    '56421': { firstName: 'Shii', lastName: 'Yorukawa' }
};
