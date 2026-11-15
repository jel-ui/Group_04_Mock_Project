import { expect, type Page } from '@playwright/test';
import { waitForPageLoad } from '../support/pageLoad';

export class AddEmployeePage {
    constructor(private readonly page: Page) {}

    heading() {
        return this.page.getByRole('heading', { name: 'Add Employee' });
    }

    firstNameInput() {
        return this.page.getByRole('textbox', { name: 'First Name' });
    }

    lastNameInput() {
        return this.page.getByRole('textbox', { name: 'Last Name' });
    }

    employeeIdInput() {
        return this.page.locator('.oxd-input-group').filter({ has: this.page.getByText('Employee Id', { exact: true }) }).locator('input');
    }

    saveButton() {
        return this.page.getByRole('button', { name: 'Save' });
    }

    async open() {
        await this.page.goto('/web/index.php/pim/addEmployee');
        await waitForPageLoad(this.page, /\/pim\/addEmployee$/, 'Add Employee');
        await expect(this.heading()).toBeVisible({ timeout: 30000 });
    }

    async addEmployee(firstName: string, lastName: string, employeeId: string) {
        await this.firstNameInput().fill(firstName);
        await this.lastNameInput().fill(lastName);
        await this.employeeIdInput().fill(employeeId);
        await this.saveButton().click();
    }
}
