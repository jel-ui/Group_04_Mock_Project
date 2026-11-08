@addEmployee
Feature: Add Employee form

  Background:
    Given I am logged in and on the Add Employee page

@AE_P01 @smoke
  Scenario: Add an employee with the generated Employee Id
    When I enter employee details:
      | First Name  | QAHung |
      | Middle Name | M      |
      | Last Name   | Le     |
    And I save the employee
    Then the success toast is shown
    And the employee profile shows the submitted details

  @AE_N01 @validation
  Scenario: Require First Name and Last Name
    When I save the employee
    Then the "First Name" field shows the "Required" error
    And the "Last Name" field shows the "Required" error
    And the employee form remains unsaved

  @AE_N06 @positive
  Scenario: Allow saving an employee with an empty Employee Id
    When I enter employee details:
      | First Name | QAEmptyID |
      | Last Name  | Test      |
    And I clear the Employee Id
    And I save the employee
    Then the employee profile shows the submitted details
    And the "Employee Id" field has the value ""

  @AE_N07 @positive
  Scenario: Allow duplicate names when Employee Id is empty
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | QAEmptyID |
      | Last Name  | Same      |
    And I clear the Employee Id
    And I save the employee
    Then the employee profile shows the submitted details
    When I open the Add Employee page again
    And I enter employee details:
      | First Name | QAEmptyID |
      | Last Name  | Same      |
    And I clear the Employee Id
    And I save the employee
    Then the employee profile shows the submitted details
    And the "Employee Id" field has the value ""
#---------- Validation tên và Employee Id ----------
  # Mỗi dòng Examples là một lần chạy riêng, ID được đưa vào tên scenario để truy vết.
  @validation
  Scenario Outline: <TC ID> - <Case>
    When I enter First Name <First Name>, Last Name <Last Name> and Employee Id <Employee Id>
    And I save the employee
    Then the fields "<Error Fields>" show the "<Message>" error
    And the employee form remains unsaved

    Examples:
      | TC ID  | Case                                     | First Name | Last Name | Employee Id | Error Fields          | Message  |
      | AE_N02 | First and last names contain only spaces | "   "      | "   "     | ""          | First Name, Last Name | Required |
      | AE_N03 | Last Name is empty                       | "QAOnly"   | ""        | ""          | Last Name             | Required |
      | AE_N04 | First Name is empty                      | ""         | "QAOnly"  | ""          | First Name            | Required |

  @validation @boundary
  Scenario Outline: <TC ID> - <Case>
    When I enter First Name <First Name>, Last Name <Last Name> and Employee Id <Employee Id>
    And I save the employee
    Then the fields "<Error Fields>" show the "<Message>" error
    And the employee form remains unsaved

    Examples:
      | TC ID  | Case                         | First Name                        | Last Name                         | Employee Id | Error Fields | Message                         |
      | AE_B02 | First Name has 31 characters | "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" | "Len"                             | ""          | First Name   | Should not exceed 30 characters |
      | AE_B06 | Last Name has 31 characters  | "QALast"                          | "ccccccccccccccccccccccccccccccc" | ""          | Last Name    | Should not exceed 30 characters |

#---------- Giao diện form ----------
  # Giữ đúng Expected của TC: nếu DOM khác thì scenario FAIL và thông báo lỗi ghi rõ khác biệt.
  @ui @AE_U01
  Scenario: Show the form layout, defaults and photo hint
    Then the profile photo picker is shown
    And the suggested Employee Id is filled in
    And Create Login Details is turned off
    And the buttons "Cancel, Save" are shown
    And the text "* Required" is shown
    And the text "Accepts jpg, .png, .gif up to 1MB. Recommended dimensions: 200px X 200px" is shown
    And the fields "First Name, Middle Name, Last Name, Employee Id" are visible

  # Tự tạo nhân viên có Middle Name (dữ liệu của AE_P01) để chạy độc lập.
  @ui @AE_U05
  Scenario: Show only First Name and Last Name in the profile heading
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name  | QAHung |
      | Middle Name | M      |
      | Last Name   | Le     |
    And I save the employee
    Then the profile heading is "QAHung Le"
    And the "Middle Name" field has the value "M"

  @ui @AE_U06
  Scenario: Keep the valid input after a failed save
    When I enter employee details:
      | First Name | Le |
    And I save the employee
    Then the "Last Name" field shows the "Required" error
    And the "First Name" field has the value "Le"
    And the employee form remains unsaved

#---------- Dữ liệu tên hợp lệ ----------
  # Các giá trị khác nhau dùng chung luồng lưu hồ sơ.
  @positive
  Scenario Outline: <TC ID> - <Case>
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name  | <First Name>  |
      | Middle Name | <Middle Name> |
      | Last Name   | <Last Name>   |
    And I save the employee
    Then the employee profile shows the submitted details

    Examples:
      | TC ID  | Case                                   | First Name | Middle Name | Last Name |
      | AE_P02 | First Name contains digits and symbols | An123@#    |             | Test      |
      | AE_P03 | First Name contains a space            | wang ming  |             | Test      |
      | AE_P04 | Names contain Vietnamese diacritics    | Lê Minh    |             | Hưng      |

# ---------- Giới hạn 30 ký tự của họ tên ----------
  # AE_B02 và AE_B06 kiểm tra trường hợp vượt giới hạn; AE_B01, AE_B03 và AE_B05 kiểm tra đúng 30 ký tự.
  @boundary
  Scenario Outline: <TC ID> - <Case>
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name  | <First Name>  |
      | Middle Name | <Middle Name> |
      | Last Name   | <Last Name>   |
    And I save the employee
    Then the employee profile shows the submitted details

    Examples:
      | TC ID  | Case                             | First Name                     | Middle Name                    | Last Name                      |
      | AE_B01 | First Name has exactly 30 chars  | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa |                                | Len                            |
      | AE_B03 | Middle Name has exactly 30 chars | Le                             | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb | Trung                          |
      | AE_B05 | Last Name has exactly 30 chars   | Nguyen                         |                                | cccccccccccccccccccccccccccccc |

  @boundary @AE_B04
  Scenario: Show the 30-character error for a 31-character Middle Name
    When I enter employee details:
      | First Name  | QAMid                           |
      | Middle Name | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb |
      | Last Name   | Hung                            |
    And I save the employee
    Then the "Middle Name" field shows the "Should not exceed 30 characters" error
