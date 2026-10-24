@web @register
Feature: Register

  Background:
    Given I am on the register page

  @smoke @regression
  Scenario: TC015-Successful registration opens the new account home
    When I register a new account
    Then I see the new account home

  @regression
  Scenario: TC016-Empty form shows all field errors
    When I submit an empty registration form
    Then I see all the required field errors

  @regression
  Scenario: TC017-Invalid CPF is rejected
    When I register with an invalid CPF
    Then I see the invalid CPF error

  @regression
  Scenario: TC129-Invalid e-mail is rejected
    When I register with an invalid e-mail
    Then I see the invalid e-mail error

  @regression
  Scenario: TC130-Different passwords are rejected
    When I register with different passwords
    Then I see the password mismatch error

  @regression
  Scenario: TC020-Already registered CPF is rejected
    When I register with an already registered CPF
    Then I see the already registered CPF error
