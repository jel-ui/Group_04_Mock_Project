@personalDetails
Feature: Personal Details

  @name-employee-id
  Rule: Employee Name and Employee Id

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

  @other-id
  Rule: Other Id

    Background:
      Given I am logged in and on the Personal Details page of employee "56412"

    @positive
    Scenario Outline: <TC ID> - Save Other Id (<Case>)
      When I enter "<Other Id>" in the "Other Id" field
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Other Id" field has the value "<Other Id>"

      Examples:
        | TC ID | Case                            | Other Id     |
        | ED_52 | letters and numbers             | OT7031220    |
        | ED_53 | empty value                     |              |
        | ED_54 | contains spaces                 | OT 703 1220  |
        | ED_56 | contains special characters     | OT@#703-1220 |
        | ED_57 | same as the employee's own Id   | 56412        |

    @validation @ED_55
    Scenario: ED_55 - Reject an Other Id with only spaces
      When I enter "   " in the "Other Id" field
      And I save the personal details
      Then the message "Invalid Parameter" is shown
      And the personal details are not saved

    @positive @ED_58
    Scenario: ED_58 - Save an Other Id already used by another employee
      Given employee "56413" has "56413" saved as "Other Id"
      When I enter "56413" in the "Other Id" field
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Other Id" field has the value "56413"

    @positive @boundary @ED_59
    Scenario: ED_59 - Save an Other Id with exactly 30 characters
      When I enter 30 "D" characters in the "Other Id" field
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Other Id" field has 30 "D" characters

    @validation @boundary @ED_60
    Scenario: ED_60 - Reject an Other Id longer than 30 characters
      When I enter 31 "D" characters in the "Other Id" field
      And I save the personal details
      Then the "Other Id" field shows the "Should not exceed 30 characters" error
      And the personal details are not saved

  @license
  Rule: Driver License and License Expiry

    Background:
      Given I am logged in and on the Personal Details page of employee "56412"

    #---------- Driver's License Number ----------
    @license @positive
    Scenario Outline: <TC ID> - Save Driver's License Number (<Case>)
      When I enter "<License Number>" in the "Driver's License Number" field
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Driver's License Number" field has the value "<License Number>"

      Examples:
        | TC ID | Case                        | License Number |
        | ED_61 | letters and numbers         | DL7031220      |
        | ED_62 | empty value                 |                |
        | ED_63 | contains spaces             | DL 703 1220    |
        | ED_64 | contains special characters | DL@#703-1220   |

    @license @validation @ED_65
    Scenario: ED_65 - Reject a Driver's License Number with only a space
      When I enter " " in the "Driver's License Number" field
      And I save the personal details
      Then the message "Invalid Parameter" is shown
      And the personal details are not saved

    @license @positive @ED_66
    Scenario: ED_66 - Save a Driver's License Number already used by another employee
      Given employee "56413" has "DL5641300" saved as "Driver's License Number"
      When I enter "DL5641300" in the "Driver's License Number" field
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Driver's License Number" field has the value "DL5641300"

    @license @positive @boundary @ED_67
    Scenario: ED_67 - Save a Driver's License Number with exactly 30 characters
      When I enter 30 "E" characters in the "Driver's License Number" field
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Driver's License Number" field has 30 "E" characters

    @license @validation @boundary @ED_68
    Scenario: ED_68 - Reject a Driver's License Number longer than 30 characters
      When I enter 31 "F" characters in the "Driver's License Number" field
      And I save the personal details
      Then the "Driver's License Number" field shows the "Should not exceed 30 characters" error
      And the personal details are not saved

    #---------- License Expiry Date ----------
    @license-expiry @positive @ED_69
    Scenario: ED_69 - Pick today as the License Expiry Date from the calendar
      When I pick Today from the "License Expiry Date" calendar
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "License Expiry Date" field has today's date

    @license-expiry @positive @ED_70
    Scenario: ED_70 - Type a valid License Expiry Date
      When I enter the date "2030-15-06" in the "License Expiry Date" field
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "License Expiry Date" field has the date "2030-15-06"

    @license-expiry @positive @ED_72
    Scenario: ED_72 - Convert License Expiry Date from yyyy-mm-dd to yyyy-dd-mm
      When I enter the date "2026-12-31" as typed in the "License Expiry Date" field
      And I save the personal details
      Then the message "Successfully Updated" is shown
      Then the "License Expiry Date" field has the value "2026-31-12"

    @license-expiry @validation
    Scenario Outline: <TC ID> - Reject an invalid License Expiry Date (<Case>)
      When I enter the date "<Date>" in the "License Expiry Date" field
      And I save the personal details
      Then the "License Expiry Date" field shows the invalid date format error
      And the personal details are not saved

      Examples:
        | TC ID | Case                         | Date       |
        | ED_71 | day-month-year order         | 31-12-2026 |
        | ED_73 | day 31 in February           | 2026-31-02 |
        | ED_76 | letters instead of digits    | abcd-ef-gh |
        | ED_77 | slash separators             | 2030/15/06 |
        | ED_78 | two-digit year               | 30-15-06   |
        | ED_79 | 29 February in a common year | 2026-29-02 |

    @license-expiry @positive
    Scenario Outline: <TC ID> - Save a License Expiry Date outside the usual date range
      When I enter the date "<Date>" in the "License Expiry Date" field
      And I save the personal details
      Then the message "Successfully Updated" is shown

      Examples:
        | TC ID | Date       |
        | ED_74 | 3000-31-12 |
        | ED_75 | 1100-01-01 |

  @nationality @marital-status
  Rule: Nationality and Marital Status

    Background:
      Given I am logged in and on the Personal Details page of employee "56412"

    @positive @ED_80
    Scenario: ED_80 - Save a Nationality selected from the dropdown
      When I select "Afghan" in the "Nationality" dropdown
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Nationality" dropdown shows "Afghan"

    @positive @ED_81
    Scenario: ED_81 - Show the default Nationality when none is saved
      Given the "Nationality" dropdown is saved as "-- Select --"
      Then the "Nationality" dropdown shows "-- Select --"

    @positive @ED_82
    Scenario: ED_82 - Save an empty Nationality
      When I select "-- Select --" in the "Nationality" dropdown
      And I save the personal details
      Then the message "Successfully Updated" is shown

    @positive @ED_83
    Scenario: ED_83 - Change a saved Nationality
      When I select "Indian" in the "Nationality" dropdown
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Nationality" dropdown shows "Indian"

    @keyboard @ED_84
    Scenario: ED_84 - Find a Nationality by typing its first letter
      When I type "B" in the "Nationality" dropdown without selecting an option
      Then the option "Bahamian" is visible

    @keyboard @ED_85
    Scenario: ED_85 - Cycle through Nationalities that start with the same letter
      When I press "A" twice in the "Nationality" dropdown
      Then the keyboard selection cycles through:
        | Afghan   |
        | Albanian |

    @keyboard @ED_86
    Scenario: ED_86 - Keep the typed Nationality when the placeholder cannot be selected
      When I type "A" in the "Nationality" dropdown
      Then the "Nationality" dropdown shows "Afghan"
      And the "-- Select --" option is unavailable in the "Nationality" dropdown

    @positive @ED_87
    Scenario: ED_87 - Save a Marital Status selected from the dropdown
      When I select "Single" in the "Marital Status" dropdown
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Marital Status" dropdown shows "Single"

    @positive @ED_88
    Scenario: ED_88 - Show the default Marital Status when none is saved
      Given the "Marital Status" dropdown is saved as "-- Select --"
      Then the "Marital Status" dropdown shows "-- Select --"

    @positive @ED_89
    Scenario: ED_89 - Save an empty Marital Status
      When I select "-- Select --" in the "Marital Status" dropdown
      And I save the personal details
      Then the message "Successfully Updated" is shown

    @positive @ED_90
    Scenario: ED_90 - Change a saved Marital Status
      When I select "Married" in the "Marital Status" dropdown
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Marital Status" dropdown shows "Married"

    @keyboard @ED_91
    Scenario: ED_91 - Find a Marital Status by typing its first letter
      When I type "O" in the "Marital Status" dropdown without selecting an option
      Then the option "Other" is visible

    @keyboard @ED_92
    Scenario: ED_92 - Keep the typed Marital Status when the placeholder cannot be selected
      When I type "S" in the "Marital Status" dropdown
      Then the "Marital Status" dropdown shows "Single"
      And the "-- Select --" option is unavailable in the "Marital Status" dropdown

  @date-of-birth
  Rule: Date of Birth

    Background:
      Given I am logged in and on the Personal Details page of employee "56412"

    @positive @ED_93
    Scenario: ED_93 - Pick today as the Date of Birth from the calendar
      When I pick Today from the "Date of Birth" calendar
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the "Date of Birth" field has today's date

    @positive @ED_96
    Scenario: ED_96 - Convert Date of Birth from yyyy-mm-dd to yyyy-dd-mm
      When I enter the date "2010-12-31" as typed in the "Date of Birth" field
      And I save the personal details
      Then the message "Successfully Updated" is shown
      Then the "Date of Birth" field has the value "2010-31-12"

    @positive
    Scenario Outline: <TC ID> - Save a valid Date of Birth (<Case>)
      When I enter the date "<Date>" in the "Date of Birth" field
      And I save the personal details
      Then the message "Successfully Updated" is shown

      Examples:
        | TC ID | Case                    | Date       |
        | ED_94 | valid past date         | 2000-20-02 |
        | ED_98 | future date             | 2030-31-12 |
        | ED_99 | very old date           | 1800-01-01 |

    @validation
    Scenario Outline: <TC ID> - Reject an invalid Date of Birth (<Case>)
      When I enter the date "<Date>" in the "Date of Birth" field
      And I save the personal details
      Then the "Date of Birth" field shows the invalid date format error
      And the personal details are not saved

      Examples:
        | TC ID  | Case                         | Date       |
        | ED_95  | day-month-year order         | 31-12-2025 |
        | ED_97  | day 31 in February           | 2025-31-02 |
        | ED_100 | letters instead of digits    | abcd-ef-gh |
        | ED_101 | slash separators             | 1990/15/06 |
        | ED_102 | 29 February in a common year | 1999-29-02 |

  @gender @attachments
  Rule: Gender and Attachments

    Background:
      Given I am logged in and on the Personal Details page of employee "56414"

    @positive
    Scenario Outline: <TC ID> - Save Gender as <Gender>
      When I select Gender "<Gender>"
      And I save the personal details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the Gender "<Gender>" option is selected

      Examples:
        | TC ID  | Gender |
        | ED_103 | Male   |
        | ED_104 | Female |

    @positive @ED_105
    Scenario: ED_105 - Only one Gender option can be selected
      When I select Gender "Male"
      And I select Gender "Female"
      Then the Gender "Female" option is selected
      And the Gender "Male" option is not selected

    #---------- Add valid attachments ----------
    @positive
    Scenario Outline: <TC ID> - Add a valid <File Type> attachment
      Given there is no previous attachment with comment "<Comment>"
      When I open the Attachments form
      And I upload the attachment "<File>"
      And I enter the attachment comment "<Comment>"
      And I save the attachment
      Then the attachment save message is shown
      And the attachment with comment "<Comment>" is displayed

      Examples:
        | TC ID  | File Type | File                 | Comment            |
        | ED_106 | TXT       | File_Attachment.txt  | ED106 valid TXT    |
        | ED_107 | JPG       | ED107_valid.jpg      | ED107 valid JPG    |
        | ED_108 | PDF       | ED108_valid.pdf      | ED108 valid PDF    |
        | ED_109 | PNG       | ED109_valid.png      | ED109 valid PNG    |
        | ED_110 | GIF       | ED110_valid.gif      | ED110 valid GIF    |

    @validation @ED_111
    Scenario: ED_111 - Require a file before saving an attachment
      When I open the Attachments form
      And I save the attachment
      Then the Attachments form shows the "Required" error under "Select File"

    @validation
    Scenario Outline: <TC ID> - Reject an invalid attachment (<Case>)
      Given there is no previous attachment with comment "<Comment>"
      When I open the Attachments form
      And I upload the attachment "<File>"
      And I enter the attachment comment "<Comment>"
      And I save the attachment
      Then the attachment upload shows the "<Message>" error
      And the attachment with comment "<Comment>" is not displayed

      Examples:
        | TC ID  | Case                          | File                      | Comment               | Message                  |
        | ED_112 | SVG attachment                | ED93_invalid.svg          | ED112 invalid SVG     | File type not allowed    |
        | ED_113 | Executable file               | ED97_executable.exe       | ED113 executable      | File type not allowed    |
        | ED_114 | HTML file containing a script | ED98_script.html          | ED114 html script     | File type not allowed    |
        | ED_115 | GITIGNORE file                | ED115_invalid.gitignore   | ED115 gitignore       | Invalid Parameter        |
        | ED_116 | Attachment larger than 1 MB   | ED94_over_1MB.txt         | ED116 oversized file  | Attachment Size Exceeded |

    @validation @ED_117
    Scenario: ED_117 - Reject an empty attachment file
      Given there is no previous attachment with comment "ED117 empty file"
      When I open the Attachments form
      And I upload the attachment "empty.txt"
      And I enter the attachment comment "ED117 empty file"
      And I save the attachment
      Then the Attachments form shows the "Required" error under "Select File"
      When I cancel the Attachments form
      Then the Attachments form is closed
      And the attachment list has the same number of records as before adding

    @positive @ED_118
    Scenario: ED_118 - Replace an existing attachment file
      Given an attachment with comment "ED118 original file" exists
      When I click Edit for the attachment with comment "ED118 original file"
      And I replace the attachment file with "File_Replace.txt"
      And I save the attachment
      Then the message "Successfully Updated" is shown
      And the attachment with comment "ED118 original file" is displayed
      And the attachment with comment "ED118 original file" has file name "File_Replace.txt"

    @positive @ED_119
    Scenario: ED_119 - Delete an attachment
      Given an attachment with comment "ED119 delete file" exists
      When I click Delete for the attachment with comment "ED119 delete file"
      Then the attachment deletion confirmation is shown
      When I confirm the attachment deletion
      Then the attachment deletion message is shown
      And the attachment with comment "ED119 delete file" is not displayed

    @positive @ED_120
    Scenario: ED_120 - Cancel deleting an attachment
      Given an attachment with comment "ED120 keep file" exists
      When I click Delete for the attachment with comment "ED120 keep file"
      Then the attachment deletion confirmation is shown
      When I cancel the attachment deletion
      Then the attachment with comment "ED120 keep file" is displayed

    @positive @ED_121
    Scenario: ED_121 - Delete all attachments
      Given an attachment with comment "ED121 seed file" exists
      When I select all attachments
      And I click Delete Selected in Attachments
      Then the attachment deletion confirmation is shown
      When I confirm the attachment deletion
      Then the attachment deletion message is shown
      And no attachment records are displayed

    @positive @ED_122
    Scenario: ED_122 - Download an attachment
      Given an attachment with comment "ED122 download file" exists
      When I download the attachment with comment "ED122 download file"
      Then the downloaded attachment has the file name "File_Attachment.txt"

    @positive @ED_123
    Scenario: ED_123 - Cancel adding an attachment
      Given there is no previous attachment with comment "ED123 cancelled file"
      When I open the Attachments form
      And I upload the attachment "File_Attachment.txt"
      And I enter the attachment comment "ED123 cancelled file"
      And I cancel the Attachments form
      Then the Attachments form is closed
      And the attachment list has the same number of records as before adding

    #---------- Attachment comments ----------
    @positive @ED_124
    Scenario: ED_124 - Save a valid attachment comment
      Given there is no previous attachment with comment "ahihi đồ ngốc"
      When I open the Attachments form
      And I upload the attachment "File_Attachment.txt"
      And I enter the attachment comment "ahihi đồ ngốc"
      And I save the attachment
      Then the attachment save message is shown

    @positive @ED_125
    Scenario: ED_125 - Save an attachment with an empty comment
      Given there is no previous attachment with file name "ED125_empty_comment.txt"
      When I open the Attachments form
      And I upload the attachment "ED125_empty_comment.txt"
      And I save the attachment
      Then the attachment save message is shown

    @positive @ED_126
    Scenario: ED_126 - Save a comment with letters, numbers, symbols and spaces
      Given there is no previous attachment with file name "ED126_spaced_comment.txt"
      When I open the Attachments form
      And I upload the attachment "ED126_spaced_comment.txt"
      And I enter the attachment comment " This is file attachment 1$ "
      And I save the attachment
      Then the attachment save message is shown

    @positive @ED_127
    Scenario: ED_127 - Save an attachment comment containing only spaces
      Given there is no previous attachment with file name "ED127_spaces_comment.txt"
      When I open the Attachments form
      And I upload the attachment "ED127_spaces_comment.txt"
      And I enter 3 spaces as the attachment comment
      And I save the attachment
      Then the attachment save message is shown

    @positive @ED_128
    Scenario: ED_128 - Edit an attachment comment
      Given there is no previous attachment with comment "Hello"
      And an attachment with comment "ED128 original comment" exists
      When I click Edit for the attachment with comment "ED128 original comment"
      And I type the attachment comment "Hello" in the edit form
      And I save the attachment
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      And the attachment with comment "Hello" is displayed
      And the attachment with comment "ED128 original comment" is not displayed

    @positive @boundary @ED_129
    Scenario: ED_129 - Save an attachment comment with exactly 200 characters
      Given there is no previous attachment with file name "ED129_200char_comment.txt"
      When I open the Attachments form
      And I upload the attachment "ED129_200char_comment.txt"
      And I enter 200 characters as the attachment comment
      And I save the attachment
      Then the attachment save message is shown

    @validation @boundary @ED_130
    Scenario: ED_130 - Reject an attachment comment longer than 200 characters
      Given there is no previous attachment with comment "ED130 overlong comment"
      When I open the Attachments form
      And I upload the attachment "File_Attachment.txt"
      And I enter 201 characters as the attachment comment
      And I save the attachment
      Then the Attachments form shows the "Should not exceed 200 characters" error under "Comment"
      And the attachment list has the same number of records as before adding

  @employee-state
  Rule: Unsaved Changes and Access

    Background:
      Given I am logged in and on the Personal Details page of employee "56414"

    @save-behaviour @validation @ED_131
    Scenario: ED_131 - Do not save valid fields when Personal Details validation fails
      Given the "Nationality" dropdown is saved as "Vietnamese"
      When I record the current First Name
      And I select "Indian" in the "Nationality" dropdown
      And I enter "" in the "First Name" field
      And I save the personal details
      Then the "First Name" field shows the "Required" error
      And the personal details are not saved
      When I reload the Personal Details page
      Then the First Name still has its original saved value
      And the "Nationality" dropdown shows "Vietnamese"

    @save-behaviour @validation @ED_132
    Scenario: ED_132 - Show several errors together and save only after fixing all of them
      When I enter "" in the "First Name" field
      And I change the Employee Id to "08602456851"
      And I enter 31 "D" characters in the "Other Id" field
      And I save the personal details
      Then the "First Name" field shows the "Required" error
      And the "Employee Id" field shows the "Should not exceed 10 characters" error
      And the "Other Id" field shows the "Should not exceed 30 characters" error
      And the personal details are not saved
      When I enter "Minh" in the "First Name" field
      And I change the Employee Id to "56414"
      And I enter "OT7031220" in the "Other Id" field
      And I save the personal details
      Then the message "Successfully Updated" is shown

    @positive @ED_133
    Scenario: ED_133 - Do not save changes when leaving without Save
      When I record the current First Name
      And I change the First Name to "Temp"
      And I leave Personal Details without saving and reopen employee "56414"
      Then the First Name still has its original saved value

    @positive @ED_134
    Scenario: ED_134 - Handle two quick clicks on Save
      When I change the First Name to "Minh"
      And I double click Save in Personal Details
      Then the message "Successfully Updated" is shown
      When I reload the Personal Details page
      Then the First Name is "Minh"
      When I open the Employee List
      Then there is exactly one employee with Employee Id "56414"

    @positive @ED_135
    Scenario: ED_135 - Do not save after logging out in another tab
      When I record the current First Name
      And I log out from a second browser tab
      And I change the First Name to "Temp"
      And I save the personal details
      Then the Login page is displayed instead of employee details
      When I log in again and reopen employee "56414"
      Then the First Name still has its original saved value

    @validation @ED_136
    Scenario: ED_136 - Block Personal Details when logged out
      When I log out from the current browser tab
      And I open the Personal Details URL for employee "56414"
      Then the Login page is displayed instead of employee details
