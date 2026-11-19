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
