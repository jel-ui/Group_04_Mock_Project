@personalDetails @profile-picture
Feature: Personal Details - Profile Picture
  As an HR Admin
  I want to update an employee profile picture
  So that the employee profile shows an accepted image

  Background:
    Given I am logged in and on the Personal Details page of employee "56414"

  @validation @ED_03
  Scenario: ED_03 - Require a file when saving a profile picture
    When I open the profile picture editor
    And I save the profile picture
    Then the profile picture shows the "Required" error

  @positive @boundary
  Scenario Outline: <TC ID> - Accept a valid profile picture (<Case>)
    When I open the profile picture editor
    And I upload the profile picture "<File>"
    And I save the profile picture
    Then the message "Successfully Updated" is shown
    And the saved profile picture remains after reload

    Examples:
      | TC ID | Case                           | File                 |
      | ED_04 | recommended 200 x 200 JPG      | ED04_200x200.jpg     |
      | ED_05 | JPG with 800 x 1422 dimensions | ED05_800x1422.jpg    |
      | ED_06 | JPG below 1 MB                 | ED06_under_1MB.jpg   |
      | ED_07 | JPG exactly 1 MB               | ED07_exact_1MB.jpg   |
      | ED_09 | PNG below 1 MB                 | ED09_under_1MB.png   |
      | ED_10 | PNG exactly 1 MB               | ED10_exact_1MB.png   |
      | ED_12 | GIF below 1 MB                 | ED12_under_1MB.gif   |
      | ED_13 | GIF exactly 1 MB               | ED13_exact_1MB.gif   |

  @validation
  Scenario Outline: <TC ID> - Reject an invalid profile picture (<Case>)
    When I open the profile picture editor
    And I upload the profile picture "<File>"
    And I save the profile picture
    Then the profile picture shows the "<Message>" error

    Examples:
      | TC ID | Case                            | File                  | Message                  |
      | ED_08 | JPG larger than 1 MB            | ED08_over_1MB.jpg     | Attachment Size Exceeded |
      | ED_11 | PNG larger than 1 MB            | ED11_over_1MB.png     | Attachment Size Exceeded |
      | ED_14 | GIF larger than 1 MB            | ED14_over_1MB.gif     | Attachment Size Exceeded |
      | ED_15 | PDF instead of an image         | ED15_document.pdf     | File type not allowed    |
      | ED_16 | TXT instead of an image         | ED16_invalid.txt      | File type not allowed    |
      | ED_17 | SVG instead of an image         | ED17_invalid.svg      | File type not allowed    |
      | ED_18 | BMP instead of a supported image | ED18_invalid.bmp     | File type not allowed    |

  @validation @ED_19
  Scenario: ED_19 - Reject text content renamed to JPG
    When I open the profile picture editor
    And I upload the text file with a JPG filename
    And I save the profile picture
    Then the profile picture shows the "File type not allowed" error
