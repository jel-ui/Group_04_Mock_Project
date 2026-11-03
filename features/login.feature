@login
Feature: Login and open Add Employee

  @smoke
  Scenario: Log in with valid credentials and open the Add Employee page
    Given I open the OrangeHRM login page
    When I log in with valid credentials
    Then the Dashboard page is visible
    When I open PIM > Add Employee
    Then the Add Employee page is visible

  Scenario: Log in with invalid credentials
    Given I open the OrangeHRM login page
    When I log in with username "invalid.user" and password "wrong123"
    Then the login error "Invalid credentials" is shown

  Scenario: Log in with empty username and password
    Given I open the OrangeHRM login page
    When I click Login
    Then 2 required field messages are shown

  @smoke
  Scenario: Shared precondition reaches the Add Employee page
    Given I am logged in and on the Add Employee page
    Then the Add Employee page is visible

  @addEmployee @AE_L01
  Scenario: Redirect to Login when opening Add Employee without signing in
    When I open the Add Employee page URL without signing in
    Then the OrangeHRM login page is shown
    And the Add Employee form is not shown
