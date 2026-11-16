import { expect, type Page, type Response } from '@playwright/test';

export class PersonalDetailsPage {
    readonly updates: { payload: unknown; status: number; body: unknown }[] = [];
    constructor(private readonly page: Page) {
        page.on('response', async response => {
            if (response.request().method() === 'PUT' && /\/personal-details$/.test(response.url())) {
                this.updates.push({ payload: response.request().postDataJSON(), status: response.status(),
                    body: await response.json().catch(() => null) });
            }
        });
    }
    fieldBox(label: string) {
        return this.page.locator('.oxd-input-group').filter({ has: this.page.getByText(label, { exact: true }) }).last();
    }
    input(field: string) {
        return ['First Name', 'Middle Name', 'Last Name'].includes(field)
            ? this.page.getByRole('textbox', { name: field, exact: true })
            : this.fieldBox(field).locator('input').first();
    }
    error(field: string) {
        return this.input(field).locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " oxd-input-group ")][1]')
            .locator('.oxd-input-field-error-message');
    }
    form() { return this.page.locator('form').filter({ has: this.input('First Name') }); }
    nationalitySelect() { return this.fieldBox('Nationality').locator('.oxd-select-text'); }
    private async ready(response: Response) {
        expect(response.ok(), 'Personal Details initial GET failed').toBeTruthy();
        await response.finished();
        await expect(this.input('First Name')).toBeVisible({ timeout: 30000 });
        await expect(this.page.locator('.oxd-loading-spinner')).toHaveCount(0, { timeout: 30000 });
    }
    async open(empNumber: number) {
        const loaded = this.page.waitForResponse(r => r.request().method() === 'GET' &&
            r.url().endsWith(`/api/v2/pim/employees/${empNumber}/personal-details`));
        await this.page.goto(`/web/index.php/pim/viewPersonalDetails/empNumber/${empNumber}`);
        await this.ready(await loaded);
    }
    async reload() {
        const loaded = this.page.waitForResponse(r => r.request().method() === 'GET' && /\/employees\/\d+\/personal-details$/.test(r.url()));
        await this.page.reload();
        await this.ready(await loaded);
    }
    async fill(field: string, value: string) {
        const target = this.input(field);
        await target.click();
        await target.press('ControlOrMeta+A');
        await target.press('Backspace');
        if (value) await this.page.keyboard.insertText(value);
        await target.press('Tab');
        await expect(target).toHaveValue(value);
    }
    async chooseNationality(value: string) {
        await this.nationalitySelect().click();
        await this.page.getByRole('option', { name: value, exact: true }).click();
    }
    async save() { await this.form().getByRole('button', { name: 'Save', exact: true }).click(); }
    async expectUpdated() {
        await expect(this.page.getByText('Successfully Updated', { exact: true })).toBeVisible({ timeout: 15000 });
        await expect.poll(() => this.updates.length).toBeGreaterThan(0);
        expect(this.updates.at(-1)?.status).toBe(200);
    }
    async expectFieldError(field: string, message: string) {
        await expect(this.error(field)).toHaveText(message, { timeout: 15000 });
        await expect(this.input(field)).toHaveClass(/oxd-input--error/);
        const color = await this.error(field).evaluate(el => getComputedStyle(el).color);
        const channels = color.match(/\d+/g)!.map(Number);
        expect(channels[0], 'Validation message must be red').toBeGreaterThan(channels[1]);
        await expect(this.page.getByText('Successfully Updated', { exact: true })).toHaveCount(0);
    }
    async expectValue(field: string, value: string) { await expect(this.input(field)).toHaveValue(value, { timeout: 15000 }); }
    async expectDefaults() {
        for (const field of ['Other Id', "Driver's License Number", 'License Expiry Date', 'Date of Birth']) await this.expectValue(field, '');
        for (const field of ['Nationality', 'Marital Status']) await expect(this.fieldBox(field).locator('.oxd-select-text')).toHaveText('-- Select --');
        await expect(this.page.getByRole('radio', { name: 'Male', exact: true })).not.toBeChecked();
        await expect(this.page.getByRole('radio', { name: 'Female', exact: true })).not.toBeChecked();
    }
    async expectLayout() {
        for (const field of ['First Name', 'Middle Name', 'Last Name', 'Employee Id', 'Other Id', "Driver's License Number", 'License Expiry Date', 'Date of Birth'])
            await expect(this.input(field)).toBeVisible();
        for (const field of ['Nationality', 'Marital Status', 'Gender']) await expect(this.fieldBox(field)).toBeVisible();
        for (const heading of ['Personal Details', 'Custom Fields', 'Attachments']) await expect(this.page.getByText(heading, { exact: true }).last()).toBeVisible();
        await expect(this.form().getByRole('button', { name: 'Save', exact: true })).toBeVisible();
        await expect(this.page.locator('.orangehrm-custom-fields').getByRole('button', { name: 'Save', exact: true })).toBeVisible();
    }
    async expectHeading(first: string, last: string) {
        await expect(this.page.locator('.orangehrm-edit-employee-name')).toHaveText(`${first} ${last}`);
    }
}
