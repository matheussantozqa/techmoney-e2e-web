@web @login
Feature: Login

  Background:
    Given I am on the login page

  @smoke @regression
  Scenario: TC001-Successful login with valid credentials
    When I log in with valid credentials
    Then I see my home

  @smoke @regression
  Scenario: TC002-Wrong password is rejected
    When I log in with a wrong password
    Then I see the invalid credentials error

  @regression
  Scenario: TC003-Password can be shown and hidden
    When I type a password
    Then the password is hidden
    When I toggle the password visibility
    Then the password is visible
    When I toggle the password visibility
    Then the password is hidden

  @regression
  Scenario: TC004-Create account link opens the register screen
    When I choose to create an account
    Then I see the register screen
