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

    @AE_B02 @boundary
    Examples: First Name has 31 characters
      | First Name                        | Last Name | Employee Id | Error Fields | Message                         |
      | "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" | "Len"     | ""          | First Name   | Should not exceed 30 characters |

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

    # Giữ Id 9102 theo Excel; bước "no employee uses Employee Id" dọn bản ghi cũ nên chạy lại không bị trùng.
    @AE_P05 @positive
    Examples: Employee Id is set by the user
      | First Name | Last Name | Employee Id |
      | QAAn       | Nguyen    | 9102        |

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

  # ---------- Giao diện form ----------

  # TC ghi "First và Last có *"; BA 4.2 và BA Personal Details ghi dấu * nằm ở nhãn "Employee Full Name".
  # Giữ đúng Expected của TC: nếu DOM khác thì scenario FAIL và thông báo lỗi ghi rõ khác biệt.
  # Bước kiểm tra dấu * để cuối để các kiểm tra khác vẫn chạy được.
  @ui @AE_U01
  Scenario: Show the form layout, required markers, defaults and photo hint
    Then the profile photo picker is shown
    And the suggested Employee Id is filled in
    And Create Login Details is turned off
    And the buttons "Cancel, Save" are shown
    And the text "* Required" is shown
    And the text "Accepts jpg, .png, .gif up to 1MB. Recommended dimensions: 200px X 200px" is shown
    And the form fields are shown:
      | Field       | Required |
      | First Name  | yes      |
      | Middle Name | no       |
      | Last Name   | yes      |
      | Employee Id | no       |

  # TC chỉ ghi "dòng gợi ý mật khẩu"; nội dung lấy theo BA 4.2 (chữ hoa, chữ thường, ký hiệu và số).
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

  @ui @AE_U04
  Scenario: Navigate between the PIM tabs and highlight the selected tab
    When I open the PIM menu
    Then the PIM tab "Employee List" is selected and shows the "Employee Information" heading
    When I open the PIM tab "Add Employee"
    Then the PIM tab "Add Employee" is selected and shows the "Add Employee" heading
    When I open the PIM tab "Employee List"
    Then the PIM tab "Employee List" is selected and shows the "Employee Information" heading

  # Tự tạo nhân viên có Middle Name (dữ liệu của AE_P01) để chạy độc lập.
  @ui @AE_U05
  Scenario: Show only First Name and Last Name in the profile heading
    Given the suggested Employee Id is not used yet
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

  # ---------- Dữ liệu tên hợp lệ ----------
  # Test case không ghi Employee Id nên giữ Id gợi ý, chỉ kiểm tra trước là Id chưa có ai dùng.
  # Ô Middle Name để trống nghĩa là không nhập.

  @positive
  Scenario Outline: <Test Case> - Save an employee whose name data is accepted
    Given the suggested Employee Id is not used yet
    When I enter employee details:
      | First Name  | <First Name>  |
      | Middle Name | <Middle Name> |
      | Last Name   | <Last Name>   |
    And I save the employee
    Then the employee profile shows the submitted details

    # BR-18 đang chờ stakeholder xác nhận có cho phép số, ký tự đặc biệt hay không; giữ Expected của TC là lưu thành công.
    @AE_P02
    Examples: First Name contains digits and special characters
      | Test Case | First Name | Middle Name | Last Name |
      | AE_P02    | An123@#    |             | Test      |

    @AE_P03
    Examples: First Name has a space between words
      | Test Case | First Name | Middle Name | Last Name |
      | AE_P03    | wang ming  |             | Test      |

    @AE_P04
    Examples: Name has Vietnamese diacritics
      | Test Case | First Name | Middle Name | Last Name |
      | AE_P04    | Lê Minh    |             | Hưng      |

  # ---------- Giới hạn 30 ký tự của họ tên ----------
  # AE_B02 (First Name 31 ký tự) nằm trong outline validation ở trên vì Expected có "Không lưu".

  @boundary
  Scenario Outline: <Test Case> - Accept a name with exactly 30 characters
    Given the suggested Employee Id is not used yet
    When I enter employee details:
      | First Name  | <First Name>  |
      | Middle Name | <Middle Name> |
      | Last Name   | <Last Name>   |
    And I save the employee
    Then the employee profile shows the submitted details

    @AE_B01
    Examples: First Name has exactly 30 characters
      | Test Case | First Name                     | Middle Name | Last Name |
      | AE_B01    | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa |             | Len       |

    @AE_B03
    Examples: Middle Name has exactly 30 characters
      | Test Case | First Name | Middle Name                    | Last Name |
      | AE_B03    | Le         | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb | Trung     |

    @AE_B05
    Examples: Last Name has exactly 30 characters
      | Test Case | First Name | Middle Name | Last Name                      |
      | AE_B05    | Nguyen     |             | cccccccccccccccccccccccccccccc |

  # Expected của AE_B04 chỉ ghi thông báo lỗi, không ghi "Không lưu" nên không kiểm tra thêm bước đó.
  @boundary @AE_B04
  Scenario: Show the 30-character error for a 31-character Middle Name
    When I enter employee details:
      | First Name  | QAMid                           |
      | Middle Name | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb |
      | Last Name   | Hung                            |
    And I save the employee
    Then the "Middle Name" field shows the "Should not exceed 30 characters" error
