import { randomBytes } from 'node:crypto';

// Employee Id ngẫu nhiên 10 ký tự (giới hạn của field), dùng cho các test không kiểm tra Id gợi ý.
export function randomEmployeeId() {
    return 'T' + randomBytes(5).toString('hex').slice(0, 9).toUpperCase();
}
