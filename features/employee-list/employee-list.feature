@employeeList
Feature: Employee List

  # Sprint 3 - PIM > Employee List (BA-S3-EMPLIST-001).
  # Scenario @employee-list-data dùng nhân viên test tạo bằng UI trước khi chạy và xoá khi chạy xong
  # (support/employeeListData.ts): 56420 Shii Hoshino (Full-Time Permanent), 56421 Shii Yorukawa (đã nghỉ việc),
  # 56422 Shii Senpai là Supervisor của 56423 Shii Kouhai.

  Background:
    Given I am logged in and on the Employee List page

  #---------- Employee Name ----------
  @employee-name @ui @EL_01
  Scenario: EL_01 - Show the Employee Name autocomplete field and its placeholder
    Then the Employee Information filter shows the fields:
      | Employee Name     |
      | Employee Id       |
      | Employment Status |
    And the "Employee Name" filter is an autocomplete field with placeholder "Type for hints..."

  @employee-name @positive @employee-list-data @EL_02
  Scenario: EL_02 - Suggest employees whose name contains the typed text
    When I type "Hoshin" in the "Employee Name" filter
    Then the "Employee Name" suggestions include "Shii Hoshino"
    And every "Employee Name" suggestion contains "Hoshin"

  @employee-name @positive @employee-list-data @EL_03
  Scenario: EL_03 - Search by an Employee Name chosen from the suggestions
    When I choose "Shii Hoshino" from the "Employee Name" suggestions after typing "Hoshino"
    And I click Search
    Then the Records Found label shows "(1) Record Found"
    And the results contain only employee "56420"
    And the results include employee "56420"

  # BA US-02 AC3 (VR-01) yêu cầu hiện "Invalid" khi không chọn gợi ý, nhưng OrangeHRM 5.9
  # tìm theo phần tên đã gõ (tham số nameOrId). Kịch bản theo Expected Output của test case EL_04.
  @employee-name @validation @employee-list-data @EL_04
  Scenario: EL_04 - Search by a typed Employee Name without choosing a suggestion
    When I type "Hoshino" in the "Employee Name" filter without selecting a suggestion
    And I click Search
    Then the "Employee Name" filter shows no validation error
    And the results include employee "56420"
    And every result has a name containing "Hoshino"

  #---------- Employee Id ----------
  @employee-id @positive @employee-list-data @EL_05
  Scenario: EL_05 - Search by an existing Employee Id
    When I enter "56420" in the "Employee Id" filter
    And I click Search
    Then the results include employee "56420"
    And every result has an "Id" containing "56420"

  @employee-id @negative @EL_06
  Scenario: EL_06 - Search by an Employee Id that does not exist
    Given no employee has an Employee Id containing "99999999"
    When I enter "99999999" in the "Employee Id" filter
    And I click Search
    Then the Records Found label shows "No Records Found"
    And the result list is empty

  @employee-id @positive @EL_07
  Scenario: EL_07 - Search with an empty Employee Id returns the default list
    Then the "Employee Id" filter is a text field
    When I enter "56420" in the "Employee Id" filter
    And I clear the "Employee Id" filter
    And I click Search
    Then the "Employee Id" filter has the value ""
    And no result is marked "(Past Employee)"
    And the Records Found count equals the number of "Current Employees Only" employees in PIM

  #---------- Employment Status ----------
  # Test case liệt kê 5 trạng thái; Freelance lấy thêm từ BA US-03 AC1.
  # Demo có thể có thêm trạng thái do người dùng khác tạo, nên chỉ kiểm tra "có chứa".
  @employment-status @ui @EL_08
  Scenario: EL_08 - Show the Employment Status options
    Then the "Employment Status" filter is a dropdown showing "-- Select --"
    When I open the "Employment Status" filter dropdown
    Then the dropdown options include:
      | -- Select --         |
      | Freelance            |
      | Full-Time Contract   |
      | Full-Time Permanent  |
      | Full-Time Probation  |
      | Part-Time Contract   |
      | Part-Time Internship |

  @employment-status @positive @employee-list-data @EL_09
  Scenario: EL_09 - Filter the list by Employment Status
    When I select "Full-Time Permanent" in the "Employment Status" filter
    And I click Search
    Then every result has "Full-Time Permanent" in the "Employment Status" column
    And the results include employee "56420"

  #---------- Include ----------
  @include @positive @EL_10
  Scenario: EL_10 - Include defaults to Current Employees Only
    Then the "Include" filter is a dropdown showing "Current Employees Only"
    And no result is marked "(Past Employee)"
    And the Records Found count equals the number of "Current Employees Only" employees in PIM

  @include @ui @EL_11
  Scenario: EL_11 - Show the Include options
    When I open the "Include" filter dropdown
    Then the dropdown options are exactly:
      | Current Employees Only     |
      | Current and Past Employees |
      | Past Employees Only        |
    And the selected dropdown option is "Current Employees Only"

  @include @positive @employee-list-data @EL_12
  Scenario: EL_12 - Search without conditions returns only current employees
    Then the "Include" filter is a dropdown showing "Current Employees Only"
    When I click Search
    Then no result is marked "(Past Employee)"
    And the Records Found count equals the number of "Current Employees Only" employees in PIM

  # Các scenario @employee-list-data dùng nhân viên tạo bằng UI trong support/employeeListData.ts:
  # 56422 Shii Senpai là Supervisor của 56423 Shii Kouhai, 56421 Shii Yorukawa đã nghỉ việc.
  @include @positive @employee-list-data @EL_13
  Scenario: EL_13 - Past Employees Only shows only past employees
    When I select "Past Employees Only" in the "Include" filter
    And I click Search
    Then every result is marked "(Past Employee)"
    And the Records Found count equals the number of "Past Employees Only" employees in PIM

  @include @positive @employee-list-data @EL_15
  Scenario: EL_15 - Current and Past Employees shows both current and past employees
    When I select "Current and Past Employees" in the "Include" filter
    And I click Search
    Then the Records Found count equals the number of "Current and Past Employees" employees in PIM
    And the Records Found count is greater than the number of "Current Employees Only" employees in PIM

  @include @positive @employee-list-data @EL_16
  Scenario: EL_16 - Include is not applied until Search is clicked
    Given I note the current results
    When I select "Past Employees Only" in the "Include" filter
    Then the results are unchanged
    When I click Search
    Then every result is marked "(Past Employee)"
    And the Records Found count equals the number of "Past Employees Only" employees in PIM

  @include @positive @EL_17
  Scenario: EL_17 - Reset puts Include back to Current Employees Only
    When I select "Past Employees Only" in the "Include" filter
    And I click Reset
    Then the "Include" filter is a dropdown showing "Current Employees Only"

  #---------- Supervisor Name ----------
  @supervisor-name @ui @EL_18
  Scenario: EL_18 - Show the Supervisor Name autocomplete field and its placeholder
    Then the Employee Information filter shows the fields:
      | Supervisor Name |
    And the "Supervisor Name" filter is an autocomplete field with placeholder "Type for hints..."

  @supervisor-name @positive @employee-list-data @EL_19
  Scenario: EL_19 - Choose a Supervisor Name from the suggestions
    When I choose "Shii Senpai" from the "Supervisor Name" suggestions after typing "Senpai"
    Then the "Supervisor Name" filter shows the name "Shii Senpai"
    And the "Supervisor Name" filter shows no validation error

  @supervisor-name @positive @employee-list-data @EL_20
  Scenario: EL_20 - Search by a Supervisor Name chosen from the suggestions
    When I choose "Shii Senpai" from the "Supervisor Name" suggestions after typing "Senpai"
    And I click Search
    Then every result has "Shii Senpai" in the "Supervisor" column
    And the results include employee "56423"

  # BA VR-02: gõ Supervisor Name mà không chọn gợi ý thì báo "Invalid", viền đỏ và không tìm kiếm.
  @supervisor-name @validation
  Scenario Outline: <id> - Supervisor Name typed without choosing a suggestion is Invalid
    Given I note the current results
    When I type "<text>" in the "Supervisor Name" filter
    And I click Search
    Then the "Supervisor Name" filter shows the error "Invalid" with a red border
    And the results are unchanged

    @employee-list-data @EL_22
    Examples: Name of an existing supervisor
      | id    | text        |
      | EL_22 | Shii Senpai |

    @EL_24
    Examples: Wrong format
      | id    | text          |
      | EL_24 | 12345         |
      | EL_24 | @#$%          |
      | EL_24 | Shii   Senpai |

  @supervisor-name @positive @EL_23
  Scenario: EL_23 - Search with an empty Supervisor Name returns the default list
    Then the "Supervisor Name" filter has the value ""
    When I click Search
    Then no result is marked "(Past Employee)"
    And the Records Found count equals the number of "Current Employees Only" employees in PIM
