@addEmployee
Feature: Employee Id

  Background:
    Given I am logged in and on the Add Employee page

@AE_N05 @validation
  Scenario: Reject an Employee Id that is already in use
    Given an employee with Employee Id "9102" exists
    When I enter employee details:
      | First Name  | QADup |
      | Last Name   | Test  |
      | Employee Id | 9102  |
    And I save the employee
    Then the "Employee Id" field shows the "Employee Id already exists" error
    And the employee form remains unsaved

#---------- Employee Id ----------
  @employee-id @positive
  Scenario Outline: <TC ID> - Save an employee with a custom Employee Id (<Case>)
    Given no employee uses Employee Id "<Employee Id>"
    When I enter employee details:
      | First Name  | <First Name>  |
      | Last Name   | <Last Name>   |
      | Employee Id | <Employee Id> |
    And I save the employee
    Then the employee profile shows the submitted details

    Examples:
      | TC ID  | Case                                 | First Name | Last Name | Employee Id |
      | AE_P06 | User enters a numeric Employee Id    | QAAn       | Nguyen    | 9102        |
      | AE_P08 | Employee Id contains letters/numbers | QAIdAlpha  | Test      | QA9a01      |

  @employee-id @positive @boundary @AE_B07
  Scenario: AE_B07 - Save an Employee Id with exactly 10 characters
    Given no employee uses Employee Id "0123456789"
    When I enter employee details:
      | First Name  | QAId10     |
      | Last Name   | Test       |
      | Employee Id | 0123456789 |
    And I save the employee
    Then the employee profile shows the submitted details

  @employee-id @AE_P07
  Scenario: Suggest a new Employee Id after an employee is saved
    When I note the suggested Employee Id
    And I enter employee details:
      | First Name | QANextId |
      | Last Name  | Test     |
    And I save the employee
    Then the employee profile shows the submitted details
    When I open the Add Employee page again
    Then the suggested Employee Id is greater than the noted one

  @employee-id @AE_P09
  Scenario: Save after replacing a duplicate Employee Id with an unused one
    Given an employee with Employee Id "9102" exists
    And no employee uses Employee Id "91002"
    When I enter employee details:
      | First Name  | QADup |
      | Last Name   | Test  |
      | Employee Id | 9102  |
    And I save the employee
    Then the "Employee Id" field shows the "Employee Id already exists" error
    When I change the Employee Id to "91002"
    And I save the employee
    Then the employee profile shows the submitted details
@employee-id @boundary @AE_B08
Scenario: Reject an Employee Id longer than 10 characters
  When I enter First Name "QAId", Last Name "Len" and Employee Id "12345678901"
  And I save the employee
  Then the "Employee Id" field shows the "Should not exceed 10 characters" error
  And the employee form remains unsaved
