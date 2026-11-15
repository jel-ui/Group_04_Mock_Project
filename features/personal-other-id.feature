@personalDetails @other-id
Feature: Personal Details - Other Id

  Background:
    Given I am logged in and on the Personal Details page of employee "56412"

  @positive
  Scenario Outline: <TC ID> - Save Other Id (<Case>)
    When I enter "<Other Id>" in the "Other Id" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "Other Id" field has the value "<Other Id>"

    Examples:
      | TC ID | Case                            | Other Id     |
      | ED_52 | letters and numbers             | OT7031220    |
      | ED_53 | empty value                     |              |
      | ED_54 | contains spaces                 | OT 703 1220  |
      | ED_56 | contains special characters     | OT@#703-1220 |
      | ED_57 | same as the employee's own Id   | 56412        |

  @validation @ED_55
  Scenario: ED_55 - Reject an Other Id with only spaces
    When I enter "   " in the "Other Id" field
    And I save the personal details
    Then the message "Invalid Parameter" is shown
    And the personal details are not saved

  @positive @ED_58
  Scenario: ED_58 - Save an Other Id already used by another employee
    Given employee "56413" has "56413" saved as "Other Id"
    When I enter "56413" in the "Other Id" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "Other Id" field has the value "56413"

  @positive @boundary @ED_59
  Scenario: ED_59 - Save an Other Id with exactly 30 characters
    When I enter 30 "D" characters in the "Other Id" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "Other Id" field has 30 "D" characters

  @validation @boundary @ED_60
  Scenario: ED_60 - Reject an Other Id longer than 30 characters
    When I enter 31 "D" characters in the "Other Id" field
    And I save the personal details
    Then the "Other Id" field shows the "Should not exceed 30 characters" error
    And the personal details are not saved
