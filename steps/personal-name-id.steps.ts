import fs from 'node:fs';
import { randomInt } from 'node:crypto';
import { After, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { config } from '../support/config';
import { randomBytes } from 'node:crypto';
const randomEmployeeId = () => 'K' + randomBytes(5).toString('hex').slice(0,9).toUpperCase();
import { CustomWorld } from '../support/world';

interface CaseData { id: string; description: string; manualExpected: string; manualResult: string;
    field?: string; value?: string; expectedValue?: string; error?: string; }
interface State { tc: CaseData; owned: number[]; emp: number; original: Record<string,string>;
    expected: Record<string,string>; duplicate: string; value: string; }
const cases: CaseData[] = JSON.parse(fs.readFileSync('test-data/personal-name-id.json', 'utf8'));
const states = new WeakMap<CustomWorld, State>();
const state = (world: CustomWorld) => { const s = states.get(world); if (!s) throw new Error('Missing ED fixture'); return s; };

async function create(world: CustomWorld, s: State, employeeId: string) {
    const response = await world.page.request.post('/web/index.php/api/v2/pim/employees', {
        data: { firstName: 'TestFirst', middleName: 'TestMiddle', lastName: 'TestLast', employeeId }
    });
    expect(response.status(), 'Synthetic employee fixture creation failed').toBe(200);
    const emp = Number((await response.json()).data.empNumber);
    expect(Number.isInteger(emp) && emp > 0).toBeTruthy();
    s.owned.push(emp);
    return emp;
}

Given('a private employee fixture for Personal Details case {string}', { timeout: 120000 }, async function(this: CustomWorld, id: string) {
    const tc = cases.find(c => c.id === id);
    if (!tc) throw new Error(`Unknown test case ${id}`);
    const original = { 'First Name': 'TestFirst', 'Middle Name': 'TestMiddle', 'Last Name': 'TestLast', 'Employee Id': randomEmployeeId() };
    const s: State = { tc, owned: [], emp: 0, original, expected: { ...original }, duplicate: 'K'+randomInt(10000,99999), value: '' };
    states.set(this, s);
    await this.loginPage.open();
    await this.loginPage.login(config.username, config.password);
    await expect(this.page).not.toHaveURL(/\/auth\/login$/);
    // API is used only for isolated prerequisite data. Updates and validation under test use UI.
    if (['ED_47','ED_48','ED_49'].includes(id)) await create(this, s, s.duplicate);
    s.emp = await create(this, s, original['Employee Id']);
    await this.personalIdentityPage.open(s.emp);
    for (const [field,value] of Object.entries(original)) await this.personalIdentityPage.expectValue(field,value);
    const n = String(randomInt(100000,999999));
    const tokens: Record<string,string> = { '{numeric6}': n, '{spaced7}': n.slice(0,3)+' '+n.slice(3),
        '{symbols9}': 'QA$#'+n.slice(0,5), '{numeric10}': '0'+String(randomInt(100000000,999999999)),
        '{duplicate}': s.duplicate, '{duplicateLower}': s.duplicate.toLowerCase(), '{duplicatePadded}': ' '+s.duplicate+' ' };
    s.value = tokens[tc.value ?? ''] ?? tc.value ?? '';
    this.attach(JSON.stringify({ testCase: tc, actualInput: s.value, fixtureEmpNumbers: s.owned, note: 'Unique IDs preserve input shape and avoid changing existing demo users.' },null,2),'application/json');
});

When('I perform the Personal Details case actions', async function(this: CustomWorld) {
    const s = state(this); const p = this.personalIdentityPage;
    if (s.tc.id === 'ED_01') {
        // Exercise Employee List -> Personal Details using our own exact ID.
        await this.employeeListPage.open();
        const loaded = this.page.waitForResponse(r => r.request().method() === 'GET' && r.url().includes('/api/v2/pim/employees?') && r.url().includes('employeeId='));
        await this.employeeListPage.employeeIdFilter().fill(s.original['Employee Id']);
        await this.employeeListPage.searchButton().click();
        await loaded;
        const row = this.page.getByRole('row').filter({ has: this.page.getByRole('cell', { name: s.original['Employee Id'], exact: true }) });
        await expect(row).toHaveCount(1);
        await row.getByRole('cell', { name: 'TestLast', exact: true }).click();
        await expect(this.page).toHaveURL(new RegExp('/pim/viewPersonalDetails/empNumber/' + s.emp + '$'));
        // Reload with an explicit response barrier before inspecting UI.
        await p.open(s.emp);
        return;
    }
    if (s.tc.id === 'ED_02') { await p.reload(); return; }
    if (s.tc.id === 'ED_102') {
        await p.expectDefaults();
        await p.chooseNationality('Vietnamese');
        await expect(p.nationalitySelect()).toHaveText('Vietnamese');
        await p.fill('First Name','');
    } else if (s.tc.id === 'ED_103') {
        await p.fill('First Name','');
        await p.fill('Employee Id','08602456851');
        await p.fill('Other Id','X'.repeat(31));
    } else {
        await p.fill(s.tc.field!,s.value);
        s.expected[s.tc.field!] = s.tc.expectedValue?.includes('{') ? s.value : s.tc.expectedValue ?? s.value;
    }
    await p.save();
});

Then('the Personal Details result matches the assigned case', async function(this: CustomWorld) {
    const s = state(this); const p = this.personalIdentityPage; const id = s.tc.id;
    if (id === 'ED_01') { await p.expectLayout(); return; }
    if (id === 'ED_02') {
        for (const [field,value] of Object.entries(s.original)) await p.expectValue(field,value);
        await p.expectDefaults(); return;
    }
    if (s.tc.error || ['ED_102','ED_103'].includes(id)) {
        if (id === 'ED_103') {
            for (const [field,error] of [['First Name','Required'],['Employee Id','Should not exceed 10 characters'],['Other Id','Should not exceed 30 characters']]) await p.expectFieldError(field,error);
        } else await p.expectFieldError(s.tc.field ?? 'First Name',s.tc.error ?? 'Required');
        expect(p.updates, 'Invalid form must not send a partial update').toHaveLength(0);
        await p.reload();
        for (const [field,value] of Object.entries(s.original)) await p.expectValue(field,value);
        if (id === 'ED_102') await expect(p.nationalitySelect()).toHaveText('-- Select --');
        if (id !== 'ED_103') return;
        s.expected = { ...s.original, 'First Name': 'FixedFirst', 'Employee Id': randomEmployeeId(), 'Other Id': 'FixedOther' };
        // Restore the invalid form to fix all three errors as in the source procedure.
        await p.fill('First Name',''); await p.fill('Employee Id','08602456851'); await p.fill('Other Id','X'.repeat(31));
        await p.save();
        for (const [field,value] of Object.entries(s.expected)) await p.fill(field,value);
        await p.save();
    }
    await p.expectUpdated();
    await p.reload();
    for (const [field,value] of Object.entries(s.expected)) await p.expectValue(field,value);
    await p.expectHeading(s.expected['First Name'],s.expected['Last Name']);
});

After({ tags: '@employee-details' }, async function(this: CustomWorld, { result }) {
    const s = states.get(this); if (!s) return;
    this.attach(JSON.stringify({ updates: this.personalIdentityPage.updates },null,2),'application/json');
    // Leave final screenshot capture to the shared hook; remove only owned synthetic API fixtures.
    if (this.page && !this.page.isClosed()) {
        const screenshot = await this.page.screenshot({ timeout: 5000 }).catch(() => undefined);
        if (screenshot) this.attach(screenshot, 'image/png');
        if (result?.status === 'FAILED') {
            const persisted = [];
            for (const emp of s.owned) {
                const response = await this.page.request.get(`/web/index.php/api/v2/pim/employees/${emp}/personal-details`);
                persisted.push({ empNumber: emp, status: response.status(), body: await response.json() });
            }
            this.attach(JSON.stringify({ persistedBeforeCleanup: persisted },null,2),'application/json');
        }
        for (const emp of s.owned) {
            const response = await this.page.request.delete('/web/index.php/api/v2/pim/employees', { data: { ids: [emp] } });
            expect(response.ok(), `Cleanup failed for owned test fixture ${emp}`).toBeTruthy();
        }
    }
});
