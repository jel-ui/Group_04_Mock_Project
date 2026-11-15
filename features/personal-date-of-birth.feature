@personalDetails @date-of-birth
Feature: Personal Details - Date of Birth

  Background:
    Given I am logged in and on the Personal Details page of employee "56412"

  @positive @ED_79
  Scenario: ED_79 - Pick today as the Date of Birth from the calendar
    When I pick Today from the "Date of Birth" calendar
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "Date of Birth" field has today's date

  @positive
  Scenario Outline: <TC ID> - Save a valid Date of Birth (<Case>)
    When I enter the date "<Date>" in the "Date of Birth" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "Date of Birth" field has the date "<Date>"

    Examples:
      | TC ID | Case           | Date       |
      | ED_80 | past date      | 2000-20-02 |
      | ED_83 | future date    | 2030-31-12 |

    @boundary
    Examples:
      | TC ID | Case           | Date       |
      | ED_87 | very old date  | 1800-01-01 |

  @validation
  Scenario Outline: <TC ID> - Reject an invalid Date of Birth (<Case>)
    When I enter the date "<Date>" in the "Date of Birth" field
    And I save the personal details
    Then the "Date of Birth" field shows the invalid date format error
    And the personal details are not saved

    Examples:
      | TC ID | Case                         | Date       |
      | ED_81 | day-month-year order         | 31-12-2025 |
      | ED_82 | day 31 in February           | 2025-31-02 |
      | ED_84 | letters instead of digits    | abcd-ef-gh |
      | ED_85 | slash separators             | 1990/15/06 |
      | ED_86 | 29 February in a common year | 1999-29-02 |
