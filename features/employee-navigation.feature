@addEmployee
Feature: Employee Navigation

  Background:
    Given I am logged in and on the Add Employee page

@ui @AE_U04
  Scenario: Navigate between the PIM tabs and highlight the selected tab
    When I open the PIM menu
    Then the PIM tab "Employee List" is selected and shows the "Employee Information" heading
    When I open the PIM tab "Add Employee"
    Then the PIM tab "Add Employee" is selected and shows the "Add Employee" heading
    When I open the PIM tab "Employee List"
    Then the PIM tab "Employee List" is selected and shows the "Employee Information" heading

@employee-list @positive @AE_P13
  Scenario: Cancel adding an employee and verify no record is created
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | QACancel |
      | Last Name  | X        |
    When I cancel the employee form
    Then the Employee List has 0 records for the employee under test

  @employee-list @validation @AE_N14
  Scenario: Double-clicking Save creates only one employee record
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | QADouble |
      | Last Name  | Click    |
    And I double-click Save
    Then the employee profile shows the submitted details
    And the Employee List has 1 record for the employee under test
