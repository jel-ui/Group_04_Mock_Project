import { Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

// Kiểm tra Status của tài khoản ở Admin > User Management (AE_P09, AE_P10, AE_B09).
Then('the user {string} has status {string} in User Management', async function (
    this: CustomWorld,
    username: string,
    status: string
) {
    await this.systemUsersPage.open();
    await this.systemUsersPage.searchByUsername(username);
    await this.systemUsersPage.expectUserStatus(username, status);
});
