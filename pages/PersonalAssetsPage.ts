import path from 'path';
import { readFile } from 'node:fs/promises';
import { expect, type Page } from '@playwright/test';
import { PAGE_LOAD_TIMEOUT, waitForPageLoad } from '../support/pageLoad';

export class PersonalAssetsPage {
    constructor(private readonly page: Page) {}

    // ---------- Profile picture ----------

    profilePictureEditor() {
        return this.page.getByRole('heading', { name: 'Change Profile Picture', exact: true });
    }

    profilePictureInput() {
        return this.page.locator('input[type="file"]');
    }


    async openProfilePictureEditor() {
        await this.page.locator('.orangehrm-edit-employee-image').click();
        await waitForPageLoad(
            this.page,
            /\/pim\/viewPhotograph\/empNumber\/\d+$/,
            'Change Profile Picture'
        );
        await expect(this.profilePictureEditor()).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    }

    async uploadProfilePicture(fileName: string) {
        await this.profilePictureInput().setInputFiles(
            path.join(process.cwd(), 'test-data', 'profile-pictures', fileName)
        );
    }

    async uploadTextFileWithJpgName() {
        const fileName = 'ED19_fake.jpg';
        const filePath = path.join(process.cwd(), 'test-data', 'profile-pictures', fileName);
        const buffer = await readFile(filePath);
        await this.profilePictureInput().setInputFiles({
            name: fileName,
            mimeType: 'text/plain',
            buffer
        });
    }

    async saveProfilePicture() {
        await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    }

    async expectProfilePictureError(message: string) {
        await expect(this.page.getByText(message, { exact: true })).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    }

    async expectSavedProfilePictureAfterReload() {
        await this.page.reload();
        await waitForPageLoad(
            this.page,
            /\/pim\/viewPhotograph\/empNumber\/\d+$/,
            'Saved profile picture'
        );
        const image = this.page.locator('img.employee-image[src*="/pim/viewPhoto/empNumber/"]');
        await expect(image).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
        await expect(image).toHaveAttribute('src', /\/pim\/viewPhoto\/empNumber\/\d+/);
    }

    // ---------- Gender ----------

    private genderOption(label: string) {
        return this.page.locator('.oxd-radio-wrapper').filter({
            has: this.genderRadio(label)
        });
    }

    private genderRadio(label: string) {
        return this.page.getByRole('radio', { name: label, exact: true });
    }

    async selectGender(label: string) {
        await this.genderOption(label).click();
        await expect(this.genderRadio(label)).toBeChecked();
    }

    async expectGenderSelected(label: string) {
        await expect(this.genderRadio(label)).toBeChecked();
    }

    async expectGenderNotSelected(label: string) {
        await expect(this.genderRadio(label)).not.toBeChecked();
    }

    // ---------- Attachments ----------

    attachmentSection() {
        return this.page.locator('.orangehrm-attachment');
    }

    private attachmentRows() {
        return this.attachmentSection().locator('.oxd-table-card');
    }

    private rowsWithComment(comment: string) {
        return this.attachmentRows().filter({ hasText: comment });
    }

    private addAttachmentHeading() {
        return this.attachmentSection().getByRole('heading', { name: 'Add Attachment', exact: true });
    }

    private attachmentForm() {
        return this.attachmentSection().locator('form.oxd-form');
    }

    private attachmentField(label: string) {
        return this.attachmentForm().locator('.oxd-input-group').filter({ hasText: label });
    }

    private attachmentFileInput() {
        return this.attachmentForm().locator('input[type="file"]');
    }

    private attachmentCommentInput() {
        return this.attachmentForm().getByPlaceholder('Type comment here');
    }

    async openAttachmentForm() {
        await this.attachmentSection().getByRole('button', { name: /Add/ }).click();
        await expect(this.addAttachmentHeading()).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    }

    async uploadAttachment(fileName: string) {
        await this.attachmentFileInput().setInputFiles(
            path.join(process.cwd(), 'test-data', 'attachments', fileName)
        );
    }

    async enterAttachmentComment(comment: string) {
        await this.attachmentCommentInput().fill(comment);
    }

    async enterAttachmentCommentWithLength(length: number) {
        await this.attachmentCommentInput().fill('A'.repeat(length));
    }

    async saveAttachment() {
        await this.attachmentForm().getByRole('button', { name: 'Save', exact: true }).click();
    }

    async cancelAttachmentForm() {
        await this.attachmentForm().getByRole('button', { name: 'Cancel', exact: true }).click();
    }

    async expectAttachmentFormError(fieldName: string, message: string) {
        await expect(
            this.attachmentField(fieldName).locator('.oxd-input-field-error-message')
        ).toHaveText(message, { timeout: PAGE_LOAD_TIMEOUT });
    }

    async expectFileTypeOrSizeError(message: string) {
        await expect(this.page.getByText(message, { exact: true })).toBeVisible({
            timeout: PAGE_LOAD_TIMEOUT
        });
    }

    async hasAttachmentWithComment(comment: string) {
        return (await this.rowsWithComment(comment).count()) > 0;
    }

    async ensureNoAttachmentWithComment(comment: string) {
        const matchingRows = this.rowsWithComment(comment);
        const count = await matchingRows.count();

        if (count === 0) return;

        for (let index = 0; index < count; index++) {
            await matchingRows.nth(index).locator('.oxd-checkbox-wrapper').click();
        }

        await this.clickDeleteSelected();
        await this.confirmAttachmentDeletion(true);
        await expect(matchingRows).toHaveCount(0, { timeout: PAGE_LOAD_TIMEOUT });
    }

    async addAttachmentIfMissing(fileName: string, comment: string) {
        if (await this.hasAttachmentWithComment(comment)) return;

        await this.openAttachmentForm();
        await this.uploadAttachment(fileName);
        await this.enterAttachmentComment(comment);
        await this.saveAttachment();
        await expect(this.rowsWithComment(comment)).toHaveCount(1, { timeout: PAGE_LOAD_TIMEOUT });
    }

    async attachmentCount() {
        return this.attachmentRows().count();
    }

    async expectAttachmentWithComment(comment: string) {
        await expect(this.rowsWithComment(comment)).toHaveCount(1, { timeout: PAGE_LOAD_TIMEOUT });
    }

    async expectNoAttachmentWithComment(comment: string) {
        await expect(this.rowsWithComment(comment)).toHaveCount(0, { timeout: PAGE_LOAD_TIMEOUT });
    }

    async selectAttachmentWithComment(comment: string) {
        await this.rowsWithComment(comment).first().locator('.oxd-checkbox-wrapper').click();
    }

    async selectAllAttachments() {
        const rows = this.attachmentRows();
        const count = await rows.count();
        for (let index = 0; index < count; index++) {
            await rows.nth(index).locator('.oxd-checkbox-wrapper').click();
        }
    }

    async clickDeleteSelected() {
        await this.attachmentSection().getByRole('button', { name: /Delete Selected/ }).click();
    }

    attachmentDeletionDialog() {
        return this.page.locator('.oxd-dialog-container-default');
    }

    async expectAttachmentDeletionConfirmation() {
        await expect(this.attachmentDeletionDialog()).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    }

    async confirmAttachmentDeletion(confirm: boolean) {
        const buttonName = confirm ? /Yes, Delete/ : /No, Cancel/;
        await this.attachmentDeletionDialog().getByRole('button', { name: buttonName }).click();
        await expect(this.attachmentDeletionDialog()).toBeHidden({ timeout: PAGE_LOAD_TIMEOUT });
    }

    async expectAttachmentListCount(count: number) {
        await expect(this.attachmentRows()).toHaveCount(count, { timeout: PAGE_LOAD_TIMEOUT });
    }

    async expectNoAttachmentRows() {
        await expect(this.attachmentRows()).toHaveCount(0, { timeout: PAGE_LOAD_TIMEOUT });
    }

    async expectAttachmentFormClosed() {
        await expect(this.addAttachmentHeading()).toHaveCount(0);
    }

    async expectAttachmentSectionAvailable() {
        await expect(this.attachmentSection()).toBeVisible();
    }
}
