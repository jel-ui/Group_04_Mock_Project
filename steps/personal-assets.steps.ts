import { Given, Then, When } from '@cucumber/cucumber';
import { PersonalAssetsPage } from '../pages/PersonalAssetsPage';
import { CustomWorld } from '../support/world';

When('I open the profile picture editor', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).openProfilePictureEditor();
});

When('I upload the profile picture {string}', async function (this: CustomWorld, fileName: string) {
    await new PersonalAssetsPage(this.page).uploadProfilePicture(fileName);
});

When('I upload the text file with a JPG filename', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).uploadTextFileWithJpgName();
});

When('I save the profile picture', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).saveProfilePicture();
});

Then('the profile picture shows the {string} error', async function (this: CustomWorld, message: string) {
    await new PersonalAssetsPage(this.page).expectProfilePictureError(message);
});

Then('the saved profile picture remains after reload', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).expectSavedProfilePictureAfterReload();
});

When('I select Gender {string}', async function (this: CustomWorld, gender: string) {
    await new PersonalAssetsPage(this.page).selectGender(gender);
});

Then('the Gender {string} option is selected', async function (this: CustomWorld, gender: string) {
    await new PersonalAssetsPage(this.page).expectGenderSelected(gender);
});

Then('the Gender {string} option is not selected', async function (this: CustomWorld, gender: string) {
    await new PersonalAssetsPage(this.page).expectGenderNotSelected(gender);
});

Given('there is no previous attachment with comment {string}', async function (
    this: CustomWorld,
    comment: string
) {
    const assets = new PersonalAssetsPage(this.page);
    await assets.ensureNoAttachmentWithComment(comment);
    this.scenarioData['attachment-count-before'] = String(await assets.attachmentCount());
});

Given('an attachment with comment {string} exists', async function (this: CustomWorld, comment: string) {
    await new PersonalAssetsPage(this.page).addAttachmentIfMissing('File_Attachment.txt', comment);
});

When('I open the Attachments form', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).openAttachmentForm();
});

When('I upload the attachment {string}', async function (this: CustomWorld, fileName: string) {
    await new PersonalAssetsPage(this.page).uploadAttachment(fileName);
});

When('I enter the attachment comment {string}', async function (this: CustomWorld, comment: string) {
    await new PersonalAssetsPage(this.page).enterAttachmentComment(comment);
});

When('I enter {int} characters as the attachment comment', async function (this: CustomWorld, length: number) {
    await new PersonalAssetsPage(this.page).enterAttachmentCommentWithLength(length);
});

When('I save the attachment', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).saveAttachment();
});

Then('the Attachments form shows the {string} error under {string}', async function (
    this: CustomWorld,
    message: string,
    fieldName: string
) {
    await new PersonalAssetsPage(this.page).expectAttachmentFormError(fieldName, message);
});

Then('the attachment with comment {string} is displayed', async function (this: CustomWorld, comment: string) {
    await new PersonalAssetsPage(this.page).expectAttachmentWithComment(comment);
});

Then('the attachment with comment {string} is not displayed', async function (this: CustomWorld, comment: string) {
    await new PersonalAssetsPage(this.page).expectNoAttachmentWithComment(comment);
});

When('I select the attachment with comment {string}', async function (this: CustomWorld, comment: string) {
    await new PersonalAssetsPage(this.page).selectAttachmentWithComment(comment);
});

When('I select all attachments', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).selectAllAttachments();
});

When('I click Delete Selected in Attachments', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).clickDeleteSelected();
});

Then('the attachment deletion confirmation is shown', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).expectAttachmentDeletionConfirmation();
});

When('I cancel the attachment deletion', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).confirmAttachmentDeletion(false);
});

When('I confirm the attachment deletion', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).confirmAttachmentDeletion(true);
});

Then('no attachment records are displayed', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).expectNoAttachmentRows();
});

When('I cancel the Attachments form', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).cancelAttachmentForm();
});

Then('the Attachments form is closed', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).expectAttachmentFormClosed();
});

Then('the attachment list has the same number of records as before adding', async function (this: CustomWorld) {
    const previousCount = Number(this.scenarioData['attachment-count-before']);
    await new PersonalAssetsPage(this.page).expectAttachmentListCount(previousCount);
});

Then('the Attachments section remains available', async function (this: CustomWorld) {
    await new PersonalAssetsPage(this.page).expectAttachmentSectionAvailable();
});
