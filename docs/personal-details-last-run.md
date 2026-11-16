# Personal Details results

Run UTC: 2026-11-16T14:45:31.045Z

36 scenarios; 34 PASS; 2 FAIL. Missing IDs: none.

| Case | Result |
| --- | --- |
| ED_01 | PASS |
| ED_02 | PASS |
| ED_20 | PASS |
| ED_21 | PASS |
| ED_22 | PASS |
| ED_23 | PASS |
| ED_24 | PASS |
| ED_25 | PASS |
| ED_26 | PASS |
| ED_27 | PASS |
| ED_28 | PASS |
| ED_29 | PASS |
| ED_30 | PASS |
| ED_31 | PASS |
| ED_32 | PASS |
| ED_33 | PASS |
| ED_34 | PASS |
| ED_35 | PASS |
| ED_36 | PASS |
| ED_37 | PASS |
| ED_38 | PASS |
| ED_39 | PASS |
| ED_40 | PASS |
| ED_41 | PASS |
| ED_42 | PASS |
| ED_43 | PASS |
| ED_44 | PASS |
| ED_45 | PASS |
| ED_46 | PASS |
| ED_47 | FAIL |
| ED_48 | FAIL |
| ED_49 | PASS |
| ED_50 | PASS |
| ED_51 | PASS |
| ED_102 | PASS |
| ED_103 | PASS |

## Failures

### ED_47

```text
Error: expect(locator).toHaveText(expected) failed

Locator: locator('.oxd-input-group').filter({ has: getByText('Employee Id', { exact: true }) }).last().locator('input').first().locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " oxd-input-group ")][1]').locator('.oxd-input-field-error-message')
Expected: "Employee Id already exists"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" locator('.oxd-input-group').filter({ has: getByText('Employee Id', { exact: true }) }).last().locator('input').first().locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " oxd-input-group ")][1]').locator('.oxd-input-field-error-message') with timeout 15000ms
  - waiting for locator('.oxd-input-group').filter({ has: getByText('Employee Id', { exact: true }) }).last().locator('input').first().locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " oxd-input-group ")][1]').locator('.oxd-input-field-error-message')

    at captureRawStack (D:\SE_VI\Group_04_Mock_Project\node_modules\playwright-core\lib\coreBundle.js:9282:17)
    at callMatcherAsStep (D:\SE_VI\Group_04_Mock_Project\node_modules\playwright\lib\matchers\expect.js:13316:57)
    at Object.toHaveText (D:\SE_VI\Group_04_Mock_Project\node_modules\playwright\lib\matchers\expect.js:13308:23)
    at PersonalDetailsPage.expectFieldError (D:\SE_VI\Group_04_Mock_Project\pages\PersonalDetailsPage.ts:64:41)
    at CustomWorld.<anonymous> (D:\SE_VI\Group_04_Mock_Project\steps\personal-details.steps.ts:92:24)
```

### ED_48

```text
Error: expect(locator).toHaveText(expected) failed

Locator: locator('.oxd-input-group').filter({ has: getByText('Employee Id', { exact: true }) }).last().locator('input').first().locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " oxd-input-group ")][1]').locator('.oxd-input-field-error-message')
Expected: "Employee Id already exists"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" locator('.oxd-input-group').filter({ has: getByText('Employee Id', { exact: true }) }).last().locator('input').first().locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " oxd-input-group ")][1]').locator('.oxd-input-field-error-message') with timeout 15000ms
  - waiting for locator('.oxd-input-group').filter({ has: getByText('Employee Id', { exact: true }) }).last().locator('input').first().locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " oxd-input-group ")][1]').locator('.oxd-input-field-error-message')

    at captureRawStack (D:\SE_VI\Group_04_Mock_Project\node_modules\playwright-core\lib\coreBundle.js:9282:17)
    at callMatcherAsStep (D:\SE_VI\Group_04_Mock_Project\node_modules\playwright\lib\matchers\expect.js:13316:57)
    at Object.toHaveText (D:\SE_VI\Group_04_Mock_Project\node_modules\playwright\lib\matchers\expect.js:13308:23)
    at PersonalDetailsPage.expectFieldError (D:\SE_VI\Group_04_Mock_Project\pages\PersonalDetailsPage.ts:64:41)
    at CustomWorld.<anonymous> (D:\SE_VI\Group_04_Mock_Project\steps\personal-details.steps.ts:92:24)
```