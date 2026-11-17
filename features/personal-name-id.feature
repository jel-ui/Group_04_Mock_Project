@personalDetails @name-employee-id
Feature: Personal Details - Employee Full Name and Employee Id
  As an HR Admin
  I want to view and update an employee's full name and Employee Id
  So that the employee profile stays accurate

  Background:
    Given I am logged in and on the Personal Details page of employee "56415"

#---------- Giao diện ----------
  @layout @ED_01
  Scenario: ED_01 - Display all Personal Details fields and sections
    Then the Personal Details form shows the fields:
      | Employee Full Name      |
      | Employee Id             |
      | Other Id                |
      | Driver's License Number |
      | License Expiry Date     |
      | Nationality             |
      | Marital Status          |
      | Date of Birth           |
      | Gender                  |
    And the "Custom Fields" section is displayed
    And the "Attachments" section is displayed
    And the Personal Details and Custom Fields sections each have a Save button

  @layout @ED_02
  Scenario: ED_02 - Show saved data and default values of a new employee
    When I add a new employee "Shii" "Moi" with a generated Employee Id
    Then the "First Name" field has the value "Shii"
    And the "Middle Name" field has the value ""
    And the "Last Name" field has the value "Moi"
    And the "Employee Id" field has the generated Employee Id
    And the "Other Id" field has the value ""
    And the "Driver's License Number" field has the value ""
    And the "License Expiry Date" field has the value ""
    And the "Date of Birth" field has the value ""
    And the "Nationality" dropdown shows "-- Select --"
    And the "Marital Status" dropdown shows "-- Select --"
    And the Gender "Male" option is not selected
    And the Gender "Female" option is not selected

#---------- First Name, Last Name ----------
  @first-name @last-name @positive
  Scenario Outline: <TC ID> - Save a valid <Field> (<Case>)
    When I enter "<Value>" in the "<Field>" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "<Field>" field has the value "<Saved Value>"
    And the employee name in the left column shows the First Name and Last Name

    Examples:
      | TC ID | Field      | Case                        | Value       | Saved Value |
      | ED_20 | First Name | letters only                | Anh         | Anh         |
      | ED_22 | First Name | spaces between words        | Minh Anh    | Minh Anh    |
      | ED_23 | First Name | digits and special chars    | Minh123@#   | Minh123@#   |
      | ED_25 | First Name | emoji is saved as "?"       | An😀        | An?         |
      | ED_35 | Last Name  | letters only                | Nguyen      | Nguyen      |
      | ED_37 | Last Name  | spaces between words        | Nguyen Thi  | Nguyen Thi  |
      | ED_38 | Last Name  | digits and special chars    | Tung134&*   | Tung134&*   |
      | ED_40 | Last Name  | emoji is saved as "?"       | An😀        | An?         |

  @first-name @last-name @validation
  Scenario Outline: <TC ID> - Require a <Field> (empty value)
    When I enter "" in the "<Field>" field
    And I save the personal details
    Then the "<Field>" field shows the "Required" error
    And the personal details are not saved

    Examples:
      | TC ID | Field      |
      | ED_21 | First Name |
      | ED_36 | Last Name  |

  @first-name @last-name @validation
  Scenario Outline: <TC ID> - Require a <Field> (only spaces)
    When I enter 3 " " characters in the "<Field>" field
    And I save the personal details
    Then the "<Field>" field shows the "Required" error
    And the personal details are not saved

    Examples:
      | TC ID | Field      |
      | ED_24 | First Name |
      | ED_39 | Last Name  |

#---------- Middle Name ----------
  @middle-name @positive @ED_28
  Scenario: ED_28 - Save a valid Middle Name that is not shown in the left column
    When I enter "Van" in the "Middle Name" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "Middle Name" field has the value "Van"
    And the employee name in the left column shows the First Name and Last Name

  @middle-name @positive
  Scenario Outline: <TC ID> - Save a Middle Name (<Case>)
    When I enter "<Value>" in the "Middle Name" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "Middle Name" field has the value "<Saved Value>"

    Examples:
      | TC ID | Case                     | Value      | Saved Value |
      | ED_29 | empty value              |            |             |
      | ED_30 | spaces between words     | Thi Van    | Thi Van     |
      | ED_31 | digits and special chars | Tuan124@$  | Tuan124@$   |
      | ED_32 | emoji is saved as "?"    | Thi😀      | Thi?        |

#---------- Giới hạn 30 ký tự của họ tên ----------
  @first-name @middle-name @last-name @positive @boundary
  Scenario Outline: <TC ID> - Save a <Field> with exactly 30 characters
    When I enter 30 "<Character>" characters in the "<Field>" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
    When I reload the Personal Details page
    Then the "<Field>" field has 30 "<Character>" characters

    Examples:
      | TC ID | Field       | Character |
      | ED_26 | First Name  | A         |
      | ED_33 | Middle Name | B         |
      | ED_41 | Last Name   | C         |

  @first-name @middle-name @last-name @validation @boundary
  Scenario Outline: <TC ID> - Reject a <Field> longer than 30 characters
    When I enter 31 "<Character>" characters in the "<Field>" field
    And I save the personal details
    Then the "<Field>" field shows the "Should not exceed 30 characters" error
    And the personal details are not saved

    Examples:
      | TC ID | Field       | Character |
      | ED_27 | First Name  | A         |
      | ED_34 | Middle Name | B         |
      | ED_42 | Last Name   | C         |

#---------- Employee Id ----------
  @employee-id @positive
  Scenario Outline: <TC ID> - Save Employee Id (<Case>)
    When I change the Employee Id to "<Employee Id>"
    And I save the personal details
    Then the message "Successfully Updated" is shown
    And the Employee Id "<Employee Id>" is kept after reloading the page

    Examples:
      | TC ID | Case                              | Employee Id |
      | ED_43 | empty value                       |             |
      | ED_44 | value not used by other employee  | 031220      |
      | ED_45 | contains spaces                   | 031 456     |
      | ED_46 | letters, digits and special chars | QA$#70312   |

    @boundary
    Examples:
      | TC ID | Case                              | Employee Id |
      | ED_50 | exactly 10 characters             | 0860245685  |

  @employee-id @validation @boundary @ED_51
  Scenario: ED_51 - Reject an Employee Id longer than 10 characters
    When I change the Employee Id to "08602456851"
    And I save the personal details
    Then the "Employee Id" field shows the "Should not exceed 10 characters" error
    And the personal details are not saved

  @employee-id @validation
  Scenario Outline: <TC ID> - Reject an Employee Id already used by another employee (<Case>)
    Given employee "<Existing Id>" exists
    When I change the Employee Id to "<Employee Id>"
    And I save the personal details
    Then the "Employee Id" field shows the "Employee Id already exists" error
    And the personal details are not saved

    Examples:
      | TC ID | Case                  | Existing Id | Employee Id |
      | ED_47 | same value            | 56413       | 56413       |
      | ED_48 | different letter case | AB1234      | ab1234      |

  @employee-id @positive @ED_49
  Scenario: ED_49 - Save an existing Employee Id with leading and trailing spaces
    Given employee "AB1234" exists
    When I change the Employee Id to " AB1234 "
    And I save the personal details
    Then the message "Successfully Updated" is shown

#---------- Lưu khi có lỗi ----------
  @save-behaviour @validation @ED_102
  Scenario: ED_102 - Do not save valid fields when Save fails
    Given the "Nationality" dropdown is saved as "-- Select --"
    When I record the current First Name
    And I select "Vietnamese" in the "Nationality" dropdown
    And I enter "" in the "First Name" field
    And I save the personal details
    Then the "First Name" field shows the "Required" error
    And the personal details are not saved
    When I reload the Personal Details page
    Then the First Name still has its original saved value
    And the "Nationality" dropdown shows "-- Select --"

  @save-behaviour @validation @ED_103
  Scenario: ED_103 - Show several errors together and save only after fixing all of them
    When I enter "" in the "First Name" field
    And I change the Employee Id to "08602456851"
    And I enter 31 "D" characters in the "Other Id" field
    And I save the personal details
    Then the "First Name" field shows the "Required" error
    And the "Employee Id" field shows the "Should not exceed 10 characters" error
    And the "Other Id" field shows the "Should not exceed 30 characters" error
    And the personal details are not saved
    When I enter "Minh" in the "First Name" field
    And I change the Employee Id to "56415"
    And I enter "OT7031220" in the "Other Id" field
    And I save the personal details
    Then the message "Successfully Updated" is shown
