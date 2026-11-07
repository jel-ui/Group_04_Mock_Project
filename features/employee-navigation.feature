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

@employee-list @positive @AE_P05
  Scenario: Find a newly created employee by Employee Name
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | Ba    |
      | Last Name  | Vuong |
    And I save the employee
    Then the employee profile shows the submitted details
    And the employee is found in Employee List by Employee Name "Vuong"

@employee-list @positive @AE_P10
  Scenario: Find a newly created employee by Employee Id
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | Le  |
      | Last Name  | Duc |
    And I save the employee
    Then the employee profile shows the submitted details
    And the Employee List has 1 record for the employee under test
@employee-list @positive @AE_P20
  Scenario: Cancel adding an employee and verify no record is created
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | QACancel |
      | Last Name  | X        |
    When I cancel the employee form
    Then the employee is absent from Employee List when searched by Employee Name "QACancel"

  @employee-list @validation @AE_N22
  Scenario: Double-clicking Save creates only one employee record
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | QADouble |
      | Last Name  | Click    |
    And I double-click Save
    Then the employee profile shows the submitted details
    And the Employee List has 1 record for the employee under test
