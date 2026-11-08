@addEmployee
Feature: Profile Photo

  Background:
    Given I am logged in and on the Add Employee page

  @photo @validation
  Scenario Outline: <TC ID> - Reject an unsupported profile photo (<Case>)
    When I enter employee details:
      | First Name | QAPhoto |
      | Last Name  | Test    |
    And I upload the profile photo "<File>"
    Then the profile photo shows the "<Message>" error
    When I save the employee
    Then the employee form remains unsaved

    Examples:
      | TC ID  | Case                         | File             | Message                  |
      | AE_N09 | JPG exceeds 1 MB             | F05_over_1MB.jpg | Attachment Size Exceeded |
      | AE_N11 | PNG exceeds 1 MB             | F09_over_1MB.png | Attachment Size Exceeded |
      | AE_N12 | GIF exceeds 1 MB             | F10_over_1MB.gif | Attachment Size Exceeded |
      | AE_N13 | TXT is not an accepted image | F11_invalid.txt  | File type not allowed    |
      | AE_N14 | SVG is not an accepted image | F12_invalid.svg  | File type not allowed    |
      | AE_N15 | PDF is not an accepted image | F06_document.pdf | File type not allowed    |

  @photo @positive @boundary
  Scenario Outline: <TC ID> - Accept a photo at the 1 MB boundary (<Case>)
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | QAPhoto |
      | Last Name  | Test    |
    And I upload a profile photo if provided "<File>"
    Then the profile photo preview is "uploaded" for "<File>"
    When I save the employee
    Then the employee profile shows the submitted details
    And the saved employee photo is shown

    Examples:
      | TC ID  | Case                | File              |
      | AE_N08 | JPG is exactly 1 MB | F07_exact_1MB.jpg |
      | AE_N10 | PNG is exactly 1 MB | F08_exact_1MB.png |

  @photo @positive
  Scenario Outline: <TC ID> - Save an employee with <Photo State> (<Case>)
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | QAPhoto |
      | Last Name  | Test    |
    And I upload a profile photo if provided "<File>"
    Then the profile photo preview is "<Preview State>" for "<File>"
    When I save the employee
    Then the employee profile shows the submitted details
    And the saved employee photo is shown

    Examples:
      | TC ID  | Case                                 | File                     | Photo State          | Preview State |
      | AE_P13 | Save without a photo                 | NONE                     | no photo             | default       |
      | AE_P14 | Accept a valid JPG photo             | F04_valid.jpg            | JPG photo            | uploaded      |
      | AE_P15 | Accept a valid PNG photo             | F13_valid.png            | PNG photo            | uploaded      |
      | AE_P16 | Accept a valid GIF photo             | F14_valid.gif            | GIF photo            | uploaded      |
      | AE_P17 | Accept a 200 by 200 pixel photo      | F15_200x200.png          | 200 by 200 photo     | uploaded      |
      | AE_P18 | Accept a photo with other dimensions | F16_other_dimensions.png | non-200 by 200 photo | uploaded      |
