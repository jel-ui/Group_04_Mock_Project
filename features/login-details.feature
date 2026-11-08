@addEmployee
Feature: Create Login Details

  Background:
    Given I am logged in and on the Add Employee page

  @ui @AE_U02
  Scenario: Show the login fields after turning on Create Login Details
    When I turn on Create Login Details
    Then the form fields are shown:
      | Field            | Required |
      | Username         | yes      |
      | Status           | no       |
      | Password         | yes      |
      | Confirm Password | yes      |
    And the Status options "Enabled, Disabled" are shown
    And the password hint mentions "upper and lower case characters, symbols and numbers"

  @ui @AE_U03
  Scenario: Select Status Enabled by default
    When I turn on Create Login Details
    Then the Status "Enabled" is selected

# ---------- Create Login Details ----------

  @login-details @positive
  Scenario Outline: <TC ID> - Create an employee account (<Case>)
    Given no user account uses Username "<Username>"
    Given I have an unused Employee Id
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

    Examples:
      | TC ID  | Case            | First Name | Last Name | Username  | Status   | Password |
      | AE_P11 | Status Enabled  | QALogin    | User      | qa_user01 | Enabled  | Qa@12345 |
      | AE_P12 | Status Disabled | QADisabled | User      | qa_user02 | Disabled | Qa@12345 |

  @login-details @positive @boundary
  Scenario Outline: <TC ID> - Accept username length boundary (<Case>)
    Given no user account uses Username "<Username>"
    Given I have an unused Employee Id
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

    Examples:
      | TC ID  | Case                          | First Name | Last Name | Username                                 | Status  | Password  |
      | AE_B09 | Username has minimum 5 chars  | QAId100    | Tester    | AAAAA                                    | Enabled | Qa@123456 |
      | AE_B10 | Username has exactly 40 chars | QAId100    | Tester    | AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | Enabled | Qa@123456 |

  @login-details
  Scenario Outline: <TC ID> - Sign in with a <Status> employee account
    Given no user account uses Username "<Username>"
    Given I have an unused Employee Id
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
    And the created employee account login result is "<Login Result>"

    Examples:
      | TC ID  | First Name | Last Name | Username  | Status   | Password | Login Result  |
      | AE_L02 | QALogin    | User      | qa_user01 | Enabled  | Qa@12345 | signed in     |
      | AE_L03 | QADisabled | User      | qa_user02 | Disabled | Qa@12345 | not signed in |

  @login-details @positive @AE_P19
  Scenario: Verify the new username in User Management
    Given no user account uses Username "vuviet"
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | Vu   |
      | Last Name  | Viet |
    And I enter login details:
      | Username         | vuviet      |
      | Status           | Enabled     |
      | Password         | vuviet12345 |
      | Confirm Password | vuviet12345 |
    And I save the employee
    Then the employee profile shows the submitted details
    And the user "vuviet" has status "Enabled" in User Management
  @login-details @validation @AE_N16
  Scenario: Show employee and Login Details errors at the same time
    When I enter employee details:
      | Last Name | User |
    And I turn on Create Login Details
    And I save the employee
    Then the fields "First Name, Username, Password" show the "Required" error
    And the "Confirm Password" field shows the "Passwords do not match" error
    And the employee form remains unsaved

  @login-details @validation @AE_N17
  Scenario: Require Username, Password and Confirm Password when login is enabled
    When I enter employee details:
      | First Name | QALogin |
      | Last Name  | User    |
    And I turn on Create Login Details
    And I save the employee
    Then the fields "Username, Password" show the "Required" error
    And the "Confirm Password" field shows the "Passwords do not match" error
    And the employee form remains unsaved

  @login-details @validation @AE_N18
  Scenario: Reject an already registered Username
    When I enter employee details:
      | First Name | QALogin |
      | Last Name  | User    |
    And I enter login details:
      | Username         | Admin    |
      | Status           | Enabled  |
      | Password         | Qa@12345 |
      | Confirm Password | Qa@12345 |
    And I save the employee
    Then the "Username" field shows the "Username already exists" error
    And the employee form remains unsaved

  @login-details @validation
  Scenario Outline: <TC ID> - Reject invalid Login Details (<Case>)
    Given no user account uses Username "<Username>"
    When I enter employee details:
      | First Name | QALogin |
      | Last Name  | User    |
    And I enter login details:
      | Username         | <Username>         |
      | Status           | Enabled            |
      | Password         | <Password>         |
      | Confirm Password | <Confirm Password> |
    And I save the employee
    Then the "<Error Field>" field shows the "<Message>" error
    And the employee form remains unsaved

    Examples:
      | TC ID  | Case                             | Username  | Password  | Confirm Password | Error Field      | Message                                                |
      | AE_N19 | Password has no number           | qa_auto11 | Qaaaaaaa@ | Qaaaaaaa@        | Password         | Your password must contain minimum 1 number            |
      | AE_N20 | Password has no lowercase letter | qa_auto12 | 12345678  | 12345678         | Password         | Your password must contain minimum 1 lower-case letter |
      | AE_N21 | Confirm Password does not match  | qa_auto13 | Qa@12345  | Qa@12346         | Confirm Password | Passwords do not match                                 |

  @login-details @validation @boundary
  Scenario Outline: <TC ID> - Reject a Login Details boundary value (<Case>)
    Given no user account uses Username "<Username>"
    When I enter employee details:
      | First Name | QALogin |
      | Last Name  | User    |
    And I enter login details:
      | Username         | <Username>         |
      | Status           | Enabled            |
      | Password         | <Password>         |
      | Confirm Password | <Confirm Password> |
    And I save the employee
    Then the "<Error Field>" field shows the "<Message>" error
    And the employee form remains unsaved

    Examples:
      | TC ID  | Case                            | Username                                  | Password | Confirm Password | Error Field | Message                           |
      | AE_B11 | Username has fewer than 5 chars | qa_1                                      | Qa@12345 | Qa@12345         | Username    | Should be at least 5 characters   |
      | AE_B12 | Username has more than 40 chars | AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | Qa@12345 | Qa@12345         | Username    | Should not exceed 40 characters   |
      | AE_B13 | Password has fewer than 7 chars | qa_auto13b                                | Qa@1     | Qa@1             | Password    | Should have at least 7 characters |

  @login-details @validation @AE_L04
  Scenario: Turning off Create Login Details prevents account creation
    Given no user account uses Username "qa_toggle_off04"
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | QAToggle |
      | Last Name  | Off      |
    And I turn on Create Login Details
    And I enter login details:
      | Username         | qa_toggle_off04 |
      | Status           | Enabled         |
      | Password         | Qa@12345        |
      | Confirm Password | Qa@12345        |
    When I turn off Create Login Details
    Then the Login Details fields are hidden
    When I save the employee
    Then the employee profile shows the submitted details
    And the user account "qa_toggle_off04" is absent in User Management
