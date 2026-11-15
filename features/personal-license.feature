@personalDetails
Feature: Personal Details - Driver's License Number and License Expiry Date

  Background:
    Given I am logged in and on the Personal Details page of employee "56412"

#---------- Driver's License Number ----------
  @license @positive
  Scenario Outline: <TC ID> - Save Driver's License Number (<Case>)
    When I enter "<License Number>" in the "Driver's License Number" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "Driver's License Number" field has the value "<License Number>"

    Examples:
      | TC ID | Case                        | License Number |
      | ED_61 | letters and numbers         | DL7031220      |
      | ED_62 | empty value                 |                |
      | ED_63 | contains spaces             | DL 703 1220    |
      | ED_64 | contains special characters | DL@#703-1220   |

  @license @validation @ED_65
  Scenario: ED_65 - Reject a Driver's License Number with only a space
    When I enter " " in the "Driver's License Number" field
    And I save the personal details
    Then the message "Invalid Parameter" is shown
    And the personal details are not saved

  @license @positive @ED_66
  Scenario: ED_66 - Save a Driver's License Number already used by another employee
    Given employee "56413" has "DL5641300" saved as "Driver's License Number"
    When I enter "DL5641300" in the "Driver's License Number" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "Driver's License Number" field has the value "DL5641300"

  @license @positive @boundary @ED_67
  Scenario: ED_67 - Save a Driver's License Number with exactly 30 characters
    When I enter 30 "E" characters in the "Driver's License Number" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "Driver's License Number" field has 30 "E" characters

  @license @validation @boundary @ED_68
  Scenario: ED_68 - Reject a Driver's License Number longer than 30 characters
    When I enter 31 "F" characters in the "Driver's License Number" field
    And I save the personal details
    Then the "Driver's License Number" field shows the "Should not exceed 30 characters" error
    And the personal details are not saved

#---------- License Expiry Date ----------
  @license-expiry @positive @ED_69
  Scenario: ED_69 - Pick today as the License Expiry Date from the calendar
    When I pick Today from the "License Expiry Date" calendar
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "License Expiry Date" field has today's date

  @license-expiry @positive @ED_70
  Scenario: ED_70 - Type a valid License Expiry Date
    When I enter the date "2030-15-06" in the "License Expiry Date" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "License Expiry Date" field has the date "2030-15-06"

  @license-expiry @validation
  Scenario Outline: <TC ID> - Reject an invalid License Expiry Date (<Case>)
    When I enter the date "<Date>" in the "License Expiry Date" field
    And I save the personal details
    Then the "License Expiry Date" field shows the invalid date format error
    And the personal details are not saved

    Examples:
      | TC ID | Case                         | Date       |
      | ED_71 | day-month-year order         | 31-12-2026 |
      | ED_72 | day 31 in February           | 2026-31-02 |
      | ED_73 | letters instead of digits    | abcd-ef-gh |
      | ED_74 | slash separators             | 2030/15/06 |
      | ED_75 | two-digit year               | 30-15-06   |
      | ED_76 | 29 February in a common year | 2026-29-02 |
