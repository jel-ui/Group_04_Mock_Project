@addEmployee
Feature: Add Employee

  Background:
    Given I am logged in and on the Add Employee page

  @AE_P01 @smoke
  Scenario: Add an employee with the generated Employee Id
    When I enter employee details:
      | First Name  | QAHung |
      | Middle Name | M      |
      | Last Name   | Le     |
    And I save the employee
    Then the employee profile shows the submitted details

  @AE_N01 @validation
  Scenario: Require First Name and Last Name
    When I save the employee
    Then the "First Name" field shows the "Required" error
    And the "Last Name" field shows the "Required" error
    And the employee form remains unsaved

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

  @AE_L02 @login-details
  Scenario: Verify the newly created employee account can sign in
    Given no user account uses Username "qa_user01"
    When I enter employee details:
      | First Name | QALogin |
      | Last Name  | User    |
    And I enter login details:
      | Username         | qa_user01 |
      | Status           | Enabled   |
      | Password         | Qa@12345  |
      | Confirm Password | Qa@12345  |
    And I save the employee
    Then the employee profile shows the submitted details
    And the created employee login account can sign in

  # ---------- Validation tên và Employee Id ----------
  # Giá trị để trong ngoặc kép để giữ được dấu cách; "" là không nhập (Employee Id thì giữ Id gợi ý).

  @validation
  Scenario Outline: Show a validation error and keep the form unsaved
    When I enter First Name <First Name>, Last Name <Last Name> and Employee Id <Employee Id>
    And I save the employee
    Then the fields "<Error Fields>" show the "<Message>" error
    And the employee form remains unsaved

    @AE_N02
    Examples: First Name and Last Name contain only spaces
      | First Name | Last Name | Employee Id | Error Fields          | Message  |
      | "   "      | "   "     | ""          | First Name, Last Name | Required |

    @AE_N03
    Examples: Last Name is empty
      | First Name | Last Name | Employee Id | Error Fields | Message  |
      | "QAOnly"   | ""        | ""          | Last Name    | Required |

    @AE_N04
    Examples: First Name is empty
      | First Name | Last Name | Employee Id | Error Fields | Message  |
      | ""         | "QAOnly"  | ""          | First Name   | Required |

    @AE_B06
    Examples: Last Name has 31 characters
      | First Name | Last Name                         | Employee Id | Error Fields | Message                         |
      | "QALast"   | "ccccccccccccccccccccccccccccccc" | ""          | Last Name    | Should not exceed 30 characters |

    @AE_B08
    Examples: Employee Id has 11 characters
      | First Name | Last Name | Employee Id   | Error Fields | Message                         |
      | "QAId"     | "Len"     | "12345678901" | Employee Id  | Should not exceed 10 characters |

  # ---------- Employee Id ----------

  @employee-id
  Scenario Outline: Save an employee with a custom Employee Id
    Given no employee uses Employee Id "<Employee Id>"
    When I enter employee details:
      | First Name  | <First Name>  |
      | Last Name   | <Last Name>   |
      | Employee Id | <Employee Id> |
    And I save the employee
    Then the employee profile shows the submitted details

    @AE_P07
    Examples: Employee Id contains letters and digits
      | First Name | Last Name | Employee Id |
      | QAIdAlpha  | Test      | QA9a01      |

    @AE_B07
    Examples: Employee Id has exactly 10 characters
      | First Name | Last Name | Employee Id |
      | QAId10     | Test      | 0123456789  |

  @employee-id @AE_P06
  Scenario: Suggest a new Employee Id after an employee is saved
    When I note the suggested Employee Id
    And I enter employee details:
      | First Name | QANextId |
      | Last Name  | Test     |
    And I save the employee
    Then the employee profile shows the submitted details
    When I open the Add Employee page again
    Then the suggested Employee Id is greater than the noted one

  @employee-id @AE_P08
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

  # ---------- Create Login Details ----------

  @login-details
  Scenario Outline: Create an employee with login details
    Given no user account uses Username "<Username>"
    When I enter employee details:
      | First Name | <First Name> |
      | Last Name  | <Last Name>  |
    And I enter login details:
      | Username         | <Username> |
      | Status           | <Status>   |
      | Password         | <Password> |
      | Confirm Password | <Password> |
    And I save the employee
    Then the employee profile shows the submitted details
    And the user "<Username>" has status "<Status>" in User Management

    @AE_P09
    Examples: Status Enabled
      | First Name | Last Name | Username  | Status  | Password |
      | QALogin    | User      | qa_user01 | Enabled | Qa@12345 |

    @AE_P10
    Examples: Status Disabled
      | First Name | Last Name | Username  | Status   | Password |
      | QADisabled | User      | qa_user02 | Disabled | Qa@12345 |

    @AE_B09
    Examples: Username has the minimum 5 characters
      | First Name | Last Name | Username | Status  | Password  |
      | QAId100    | Tester    | AAAAA    | Enabled | Qa@123456 |

  # ---------- Ảnh đại diện ----------
  # File nằm trong test-data/photos

  @photo
  Scenario Outline: Reject an invalid profile photo
    When I enter employee details:
      | First Name | QAPhoto |
      | Last Name  | Test    |
    And I upload the profile photo "<File>"
    Then the profile photo shows the "<Message>" error
    When I save the employee
    Then the employee form remains unsaved

    @AE_N06
    Examples: File type is not supported
      | File             | Message               |
      | F06_document.pdf | File type not allowed |

    @AE_N07
    Examples: File is larger than 1MB
      | File             | Message                  |
      | F05_over_1MB.jpg | Attachment Size Exceeded |
