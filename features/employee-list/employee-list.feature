@employeeList
Feature: Employee List

  # Sprint 3 - PIM > Employee List (BA-S3-EMPLIST-001).
  # Nhân viên test 56420 (hiện tại) và 56421 (đã nghỉ việc) khai báo trong support/testData.ts;
  # bị xoá hoặc sửa trên demo thì step chuẩn bị dữ liệu tạo lại qua API.

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

  @employee-name @positive @EL_02
  Scenario: EL_02 - Suggest employees whose name contains the typed text
    Given the current employee "56420" exists
    When I type "Hoshin" in the "Employee Name" filter
    Then the "Employee Name" suggestions include "Shii Hoshino"
    And every "Employee Name" suggestion contains "Hoshin"

  @employee-name @positive @EL_03
  Scenario: EL_03 - Search by an Employee Name chosen from the suggestions
    Given the current employee "56420" exists
    When I choose "Shii Hoshino" from the "Employee Name" suggestions after typing "Hoshino"
    And I click Search
    Then the Records Found label shows "(1) Record Found"
    And the results contain only employee "56420"
    And the results include employee "56420"

  # BA US-02 AC3 (VR-01) yêu cầu hiện "Invalid" khi không chọn gợi ý, nhưng OrangeHRM 5.9
  # tìm theo phần tên đã gõ (tham số nameOrId). Kịch bản theo Expected Output của test case EL_04.
  @employee-name @validation @EL_04
  Scenario: EL_04 - Search by a typed Employee Name without choosing a suggestion
    Given the current employee "56420" exists
    When I type "Hoshino" in the "Employee Name" filter without selecting a suggestion
    And I click Search
    Then the "Employee Name" filter shows no validation error
    And the results include employee "56420"
    And every result has a name containing "Hoshino"

  #---------- Employee Id ----------
  @employee-id @positive @EL_05
  Scenario: EL_05 - Search by an existing Employee Id
    Given the current employee "56420" exists
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

  @employment-status @positive @EL_09
  Scenario: EL_09 - Filter the list by Employment Status
    Given the current employee "56420" has Employment Status "Full-Time Permanent"
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

  @include @positive @EL_12
  Scenario: EL_12 - Search without conditions returns only current employees
    Given the past employee "56421" exists
    Then the "Include" filter is a dropdown showing "Current Employees Only"
    When I click Search
    Then no result is marked "(Past Employee)"
    And the Records Found count equals the number of "Current Employees Only" employees in PIM
