@personalDetails @employee-state
Feature: Personal Details - Unsaved Changes and Access
  As an HR Admin
  I want unsaved changes and access restrictions to behave correctly
  So that employee information remains protected and consistent

  Background:
    Given I am logged in and on the Personal Details page of employee "56414"

  @positive @ED_104
  Scenario: ED_104 - Do not save changes when leaving without Save
    When I record the current First Name
    And I change the First Name to "Temp"
    And I leave Personal Details without saving and reopen employee "56414"
    Then the First Name still has its original saved value

  @positive @ED_105
  Scenario: ED_105 - Handle two quick clicks on Save
    When I change the First Name to "Minh"
    And I double click Save in Personal Details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the First Name is "Minh"
    When I open the Employee List
    Then there is exactly one employee with Employee Id "56414"

  @positive @ED_106
  Scenario: ED_106 - Do not save after the session expires
    When I record the current First Name
    And I log out from a second browser tab
    And I change the First Name to "Temp"
    And I save the personal details
    Then a login page or session-expired message is displayed
    When I log in again and reopen employee "56414"
    Then the First Name still has its original saved value

  @validation @ED_107
  Scenario: ED_107 - Block Personal Details when logged out
    When I log out from the current browser tab
    And I open the Personal Details URL for employee "56414"
    Then the Login page is displayed instead of employee details

  @validation @ED_108
  Scenario: ED_108 - Handle a Personal Details URL for a missing employee
    When I open Personal Details for the missing employee "99999999"
    Then a friendly no-records result is displayed without a server error
