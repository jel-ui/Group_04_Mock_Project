@personalDetails @gender @attachments
Feature: Personal Details - Gender and Attachments
  As an HR Admin
  I want to update gender and manage employee attachments
  So that the personal details and files are stored correctly

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
      | TC ID | Gender |
      | ED_88 | Male   |
      | ED_89 | Female |

  @positive @ED_90
  Scenario: ED_90 - Only one Gender option can be selected
    When I select Gender "Male"
    And I select Gender "Female"
    Then the Gender "Female" option is selected
    And the Gender "Male" option is not selected

  @positive @ED_91
  Scenario: ED_91 - Add a valid file to Attachments
    Given there is no previous attachment with comment "ED91 valid attachment"
    When I open the Attachments form
    And I upload the attachment "File_Attachment.txt"
    And I enter the attachment comment "ED91 valid attachment"
    And I save the attachment
    Then the attachment with comment "ED91 valid attachment" is displayed

  @validation @ED_92
  Scenario: ED_92 - Require a file before saving an attachment
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
    Then the Attachments form shows the "<Message>" error under "Select File"
    And the attachment with comment "<Comment>" is not displayed

    Examples:
      | TC ID | Case                          | File                    | Comment             | Message                  |
      | ED_93 | SVG attachment                | ED93_invalid.svg        | ED93 invalid SVG    | File type not allowed    |
      | ED_94 | Attachment larger than 1 MB   | ED94_over_1MB.txt       | ED94 oversized file | Attachment Size Exceeded |
      | ED_97 | Executable file               | ED97_executable.exe     | ED97 executable     | File type not allowed    |
      | ED_98 | HTML file containing a script | ED98_script.html        | ED98 html script    | File type not allowed    |

  @validation @ED_99
  Scenario: ED_99 - Reject an attachment comment longer than 200 characters
    Given there is no previous attachment with comment "ED99 overlong comment"
    When I open the Attachments form
    And I upload the attachment "File_Attachment.txt"
    And I enter 201 characters as the attachment comment
    And I save the attachment
    Then the Attachments form shows the "Should not exceed 200 characters" error under "Comment"
    And the attachment with comment "ED99 overlong comment" is not displayed

  @validation @ED_100
  Scenario: ED_100 - Do not add an empty attachment file
    Given there is no previous attachment with comment "ED100 empty file"
    When I open the Attachments form
    And I upload the attachment "empty.txt"
    And I enter the attachment comment "ED100 empty file"
    And I save the attachment
    Then the attachment with comment "ED100 empty file" is not displayed
    And the Attachments section remains available

  @positive @ED_95
  Scenario: ED_95 - Keep an attachment when deletion is cancelled
    Given an attachment with comment "ED95 keep file" exists
    When I select the attachment with comment "ED95 keep file"
    And I click Delete Selected in Attachments
    Then the attachment deletion confirmation is shown
    When I cancel the attachment deletion
    Then the attachment with comment "ED95 keep file" is displayed

  @positive @ED_96
  Scenario: ED_96 - Delete all attachments
    Given an attachment with comment "ED96 delete seed" exists
    When I select all attachments
    And I click Delete Selected in Attachments
    And I confirm the attachment deletion
    Then no attachment records are displayed

  @positive @ED_101
  Scenario: ED_101 - Cancel adding an attachment
    Given there is no previous attachment with comment "ED101 cancelled file"
    When I open the Attachments form
    And I upload the attachment "File_Attachment.txt"
    And I enter the attachment comment "ED101 cancelled file"
    And I cancel the Attachments form
    Then the Attachments form is closed
    And the attachment list has the same number of records as before adding
