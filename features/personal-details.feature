@employee-details
Feature: Personal Details - Khoi assigned cases
  Test data and original manual expectations: test-data/personal-details.json.
  Each scenario uses its own synthetic employee; UI actions perform all changes under test.

  Scenario Outline: <ID> - <Description>
    Given a private employee fixture for Personal Details case "<ID>"
    When I perform the Personal Details case actions
    Then the Personal Details result matches the assigned case

    Examples:
      | ID | Description |
      | ED_01 | Xác minh giao diện Personal Details được hiển thị đầy đủ. |
      | ED_02 | Xác minh các trường trên Personal Details hiển thị đúng dữ liệu đã lưu hoặc giá trị mặc định khi chưa có dữ liệu. |
      | ED_20 | Xác minh hệ thống cập nhật First Name với dữ liệu hợp lệ. |
      | ED_21 | Xác minh hệ thống khi First Name bị để trống. |
      | ED_22 | Xác minh hệ thống chấp nhận First Name có khoảng trắng giữa các từ. |
      | ED_23 | Xác minh hệ thống khi First Name có thể chứa số và ký tự đặc biệt. |
      | ED_24 | Xác minh hệ thống First Name chỉ chứa khoảng trắng. |
      | ED_25 | Xác minh hệ thống xử lý emoji trong First Name. |
      | ED_26 | Xác minh hệ thống khi First Name đúng 30 ký tự. | 
      | ED_27 | Xác minh hệ thống khi First Name vượt quá 30 ký tự. |
      | ED_28 | Xác minh hệ thống cập nhật Middle Name với dữ liệu hợp lệ. |
      | ED_29 | Xác minh hệ thống để trống Middle Name. |
      | ED_30 | Xác minh hệ thống chấp nhận Middle Name có khoảng trắng giữa các từ. |
      | ED_31 | Xác minh hệ thống khi Middle Name có thể chứa số và ký tự đặc biệt. |
      | ED_32 | Xác minh hệ thống xử lý emoji trong Middle Name. |
      | ED_33 | Xác minh hệ thống khi Middle Name đúng 30 ký tự. |
      | ED_34 | Xác minh hệ thống Middle Name vượt quá 30 ký tự. |
      | ED_35 | Xác minh hệ thống cập nhật Last Name với dữ liệu hợp lệ. |
      | ED_36 | Xác minh hệ thống khi Last Name để trống. |
      | ED_37 | Xác minh hệ thống chấp nhận Last Name có khoảng trắng giữa các từ. |
      | ED_38 | Xác minh hệ thống khi Last Name có thể chứa số và ký tự đặc biệt. |
      | ED_39 | Xác minh hệ thống Last Name chỉ chứa khoảng trắng. |
      | ED_40 | Xác minh hệ thống xử lý emoji trong Last Name. |
      | ED_41 | Xác minh hệ thống khi Last Name đúng 30 ký tự. |
      | ED_42 | Xác minh hệ thống khi Last Name vượt quá 30 ký tự. |
      | ED_43 | Xác minh Employee ID để trống. |
      | ED_44 | Xác minh cập nhật Employee ID bằng một giá trị chưa được sử dụng trong hệ thống. |
      | ED_45 | Xác minh Employee ID có thể chứa khoảng trắng. |
      | ED_46 | Xác minh Employee ID chứa cả chữ, số và ký tự đặt biệt. |
      | ED_47 | Xác minh Employee Id trùng với mã của nhân viên khác. |
      | ED_48 | Xác minh Employee ID trùng với nhân viên khác nhưng khác chữ hoa/chữ thường. |
      | ED_49 | Xác minh Employee ID trùng với nhân viên khác nhưng có khoảng trắng ở đầu và cuối. |
      | ED_50 | Xác minh Employee ID đúng 10 ký tự. |
      | ED_51 | Xác minh Employee ID vượt quá 10 ký tự. |
      | ED_102 | Xác minh Save thất bại không làm thay đổi các trường hợp lệ khác (không lưu một phần). |
      | ED_103 | Xác minh hệ thống hiển thị đồng thời nhiều lỗi và chỉ lưu khi đã sửa hết. |
