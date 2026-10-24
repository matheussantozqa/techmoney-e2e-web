@api @auth
Feature: Auth

  @smoke @regression
  Scenario: TC001-Login returns a token and the user data
    When I log in with valid credentials
    Then I get a token and my user data

  @regression
  Scenario: TC002-Empty CPF is rejected
    When I log in with an empty CPF
    Then I get the empty CPF error

  @regression
  Scenario: TC003-Empty password is rejected
    When I log in with an empty password
    Then I get the empty password error

  @regression
  Scenario: TC004-Invalid CPF is rejected
    When I log in with an invalid CPF
    Then I get the invalid CPF error

  @regression
  Scenario: TC005-Wrong password is rejected
    When I log in with a wrong password
    Then I get the invalid credentials error

  @regression
  Scenario: TC006-Valid but unregistered CPF is rejected
    When I log in with an unregistered CPF
    Then I get the invalid credentials error

  @regression
  Scenario: TC007-Protected route requires a token
    When I get my profile without a token
    Then I get the unauthorized error

  @regression
  Scenario: TC008-Token stops working after logout
    Given I am logged in
    When I log out
    Then my token is rejected
