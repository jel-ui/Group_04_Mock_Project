@addEmployee
Feature: Profile Photo

  Background:
    Given I am logged in and on the Add Employee page

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

@photo
  Scenario Outline: Save an employee with <Photo State>
    Given the suggested Employee Id is not used yet
    When I enter employee details:
      | First Name | QAPhoto |
      | Last Name  | Test    |
    And I upload a profile photo if provided "<File>"
    Then the profile photo preview is "<Preview State>"
    When I save the employee
    Then the employee profile shows the submitted details
    And the saved employee photo is shown

    @AE_P11 @positive
    Examples: Upload a valid JPG photo
      | File         | Photo State  | Preview State |
      | F04_valid.jpg | a valid photo | uploaded      |

    @AE_P12
    Examples: Save without a photo
      | File | Photo State | Preview State |
      | NONE | no photo    | default       |
