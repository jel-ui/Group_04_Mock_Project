@personalDetails
Feature: Personal Details - Nationality and Marital Status

  Background:
    Given I am logged in and on the Personal Details page of employee "56412"

  @positive
  Scenario Outline: <TC ID> - Save the <Field> selected from the dropdown
    When I select "<Option>" in the "<Field>" dropdown
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "<Field>" dropdown shows "<Option>"

    @nationality
    Examples:
      | TC ID | Field       | Option |
      | ED_77 | Nationality | Afghan |

    @marital-status
    Examples:
      | TC ID | Field          | Option |
      | ED_78 | Marital Status | Single |
