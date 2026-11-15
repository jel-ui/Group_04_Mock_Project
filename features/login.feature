@login
Feature: Login

  @smoke
  Scenario: Log in with valid credentials
    Given I open the OrangeHRM login page
    When I log in with valid credentials
    Then the Dashboard page is visible

  Scenario: Log in with invalid credentials
    Given I open the OrangeHRM login page
    When I log in with username "invalid.user" and password "wrong123"
    Then the login error "Invalid credentials" is shown

  Scenario: Log in with empty username and password
    Given I open the OrangeHRM login page
    When I click Login
    Then 2 required field messages are shown
