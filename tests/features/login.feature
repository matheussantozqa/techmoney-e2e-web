@web @login
Feature: Login

  Background:
    Given I am on the login page

  @smoke @regression
  Scenario: TC001-Successful login with valid credentials
    When I log in with valid credentials
    Then I see my home

  @regression
  Scenario: TC003-Empty CPF is rejected
    When I log in with an empty CPF
    Then I see the empty CPF error

  @regression
  Scenario: TC004-Empty password is rejected
    When I log in with an empty password
    Then I see the empty password error

  @regression
  Scenario: TC005-Invalid CPF is rejected
    When I log in with an invalid CPF
    Then I see the invalid CPF error

  @smoke @regression
  Scenario: TC007-Wrong password is rejected
    When I log in with a wrong password
    Then I see the invalid credentials error

  @regression
  Scenario: TC008-Valid but unregistered CPF is rejected
    When I log in with an unregistered CPF
    Then I see the invalid credentials error

  @regression
  Scenario: TC009-Password can be shown and hidden
    When I type a password
    Then the password is hidden
    When I toggle the password visibility
    Then the password is visible
    When I toggle the password visibility
    Then the password is hidden

  @regression
  Scenario: TC012-Create account link opens the register screen
    When I choose to create an account
    Then I see the register screen
