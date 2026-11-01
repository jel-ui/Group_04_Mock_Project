Feature: Add Employee

  Background:
    Given I am logged in and on the Add Employee page

  @AE_P01 @addEmployee @smoke
  Scenario: Add an employee with the generated Employee Id
    When I enter unique employee details:
      | First Name  | Auto       |
      | Middle Name | QA         |
      | Last Name   | Automation |
    And I save the employee
    Then the employee profile shows the submitted details

  @AE_N01 @addEmployee @validation
  Scenario: Require First Name and Last Name
    When I save without entering employee details
    Then the "First Name" field shows the "Required" error
    And the "Last Name" field shows the "Required" error
    And the employee form remains unsaved

  @AE_N04 @addEmployee @validation
  Scenario: Reject an Employee Id that is already in use
    Given an employee with a unique Employee Id has already been created
    When I try to add a different employee with that Employee Id
    Then the "Employee Id" field shows the "Employee Id already exists" error
    And the employee form remains unsaved

  @AE_P03 @addEmployee @login-details
  Scenario: Add an employee with login details enabled
    When I enter unique employee details:
      | First Name  | Login |
      | Middle Name | QA    |
      | Last Name   | User  |
    And I enter unique login details:
      | Username        | qa_auto_ |
      | Status          | Enabled  |
      | Password        | Qa@12345 |
      | Confirm Password| Qa@12345 |
    And I save the employee
    Then the employee profile shows the submitted details
    And the created employee login account can sign in