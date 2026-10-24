@web @register
Feature: Register

  Background:
    Given I am on the register page

  @smoke @regression
  Scenario: TC001-Successful registration opens the new account home
    When I register a new account
    Then I see the new account home

  @regression
  Scenario: TC002-Empty form shows all field errors
    When I submit an empty registration form
    Then I see all the required field errors

  @regression
  Scenario: TC003-Different passwords are rejected
    When I register with different passwords
    Then I see the password mismatch error
