import { Then, When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

When('I upload a profile photo if provided {string}', async function (this: CustomWorld, fileName: string) {
    if (fileName !== 'NONE') await this.addEmployeePage.uploadPhoto(fileName);
});

Then('the profile photo preview is {string}', async function (this: CustomWorld, state: string) {
    await this.addEmployeePage.expectPhotoPreviewState(state);
});

Then('the saved employee photo is shown', async function (this: CustomWorld) {
    await this.addEmployeePage.expectSavedProfilePhotoShown();
});
