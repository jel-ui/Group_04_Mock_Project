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
    Then the employee profile shows the submitted details

  @AE_N01 @validation
  Scenario: Require First Name and Last Name
    When I save the employee
    Then the "First Name" field shows the "Required" error
    And the "Last Name" field shows the "Required" error
    And the employee form remains unsaved

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

# ---------- Giao diện form ----------

  # TC ghi "First và Last có *"; BA 4.2 và BA Personal Details ghi dấu * nằm ở nhãn "Employee Full Name".
  # Giữ đúng Expected của TC: nếu DOM khác thì scenario FAIL và thông báo lỗi ghi rõ khác biệt.
  # Bước kiểm tra dấu * để cuối để các kiểm tra khác vẫn chạy được.
  @ui @AE_U01
  Scenario: Show the form layout, defaults and photo hint
    Then the profile photo picker is shown
    And the suggested Employee Id is filled in
    And Create Login Details is turned off
    And the buttons "Cancel, Save" are shown
    And the text "Accepts jpg, .png, .gif up to 1MB. Recommended dimensions: 200px X 200px" is shown
    And the fields "First Name, Middle Name, Last Name, Employee Id" are visible

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
