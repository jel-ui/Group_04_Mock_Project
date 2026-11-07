@addEmployee
Feature: Profile Photo

  Background:
    Given I am logged in and on the Add Employee page

  @photo @validation
  Scenario Outline: Reject a profile photo that violates the accepted type or size
    When I enter employee details:
      | First Name | QAPhoto |
      | Last Name  | Test    |
    And I upload the profile photo "<File>"
    Then the profile photo shows the "<Message>" error
    When I save the employee
    Then the employee form remains unsaved

    @AE_N09
    Examples: JPG exceeds 1MB
      | File             | Message                  |
      | F05_over_1MB.jpg | Attachment Size Exceeded |

    @AE_N11
    Examples: PNG exceeds 1MB
      | File              | Message                  |
      | F09_over_1MB.png  | Attachment Size Exceeded |

    @AE_N12
    Examples: GIF exceeds 1MB
      | File              | Message                  |
      | F10_over_1MB.gif  | Attachment Size Exceeded |

    @AE_N13
    Examples: TXT is not an accepted image type
      | File            | Message               |
      | F11_invalid.txt | File type not allowed |

    @AE_N14
    Examples: SVG is not an accepted image type
      | File            | Message               |
      | F12_invalid.svg | File type not allowed |

    @AE_N15
    Examples: PDF is not an accepted image type
      | File             | Message               |
      | F06_document.pdf | File type not allowed |

  @photo @positive @boundary
  Scenario Outline: Accept a profile photo at the 1MB size limit
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | QAPhoto |
      | Last Name  | Test    |
    And I upload a profile photo if provided "<File>"
    Then the profile photo preview is "uploaded" for "<File>"
    When I save the employee
    Then the employee profile shows the submitted details
    And the saved employee photo is shown

    @AE_N08
    Examples: JPG is exactly 1MB and accepted
      | File              |
      | F07_exact_1MB.jpg |

    @AE_N10
    Examples: PNG is exactly 1MB and accepted
      | File              |
      | F08_exact_1MB.png |

  @photo @positive
  Scenario Outline: Save an employee with <Photo State>
    Given I have an unused Employee Id
    When I enter employee details:
      | First Name | QAPhoto |
      | Last Name  | Test    |
    And I upload a profile photo if provided "<File>"
    Then the profile photo preview is "<Preview State>" for "<File>"
    When I save the employee
    Then the employee profile shows the submitted details
    And the saved employee photo is shown

    @AE_P13
    Examples: Save without a photo and show the default image
      | File | Photo State | Preview State |
      | NONE | no photo    | default       |

    @AE_P14
    Examples: Accept a valid JPG photo
      | File          | Photo State | Preview State |
      | F04_valid.jpg | JPG photo   | uploaded      |

    @AE_P15
    Examples: Accept a valid PNG photo
      | File          | Photo State | Preview State |
      | F13_valid.png | PNG photo   | uploaded      |

    @AE_P16
    Examples: Accept a valid GIF photo
      | File          | Photo State | Preview State |
      | F14_valid.gif | GIF photo   | uploaded      |

    @AE_P17
    Examples: Accept a 200 by 200 pixel photo
      | File               | Photo State      | Preview State |
      | F15_200x200.png   | 200 by 200 photo | uploaded      |

    @AE_P18
    Examples: Accept a photo with non-recommended dimensions
      | File                       | Photo State            | Preview State |
      | F16_other_dimensions.png  | non-200 by 200 photo   | uploaded      |
