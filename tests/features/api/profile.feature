@api @profile
Feature: Profile

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC001-Profile returns my data
    When I get my profile
    Then I get my user data

  @regression
  Scenario: TC002-Changing name and e-mail
    When I change my name and e-mail
    Then I get my new data with the e-mail in lowercase

  @regression
  Scenario: TC003-Empty name is rejected
    When I save an empty name
    Then I get the empty name error

  @regression
  Scenario: TC004-Invalid e-mail is rejected
    When I save an invalid e-mail
    Then I get the invalid e-mail error

  @regression
  Scenario: TC005-E-mail of another account is rejected
    When I save the e-mail of another account
    Then I get the already registered e-mail error

  @regression
  Scenario: TC006-New e-mail works as transfer key
    Given I have changed my e-mail
    When I search a recipient by my new e-mail
    Then I find myself as the recipient
