@web @profile
Feature: Profile

  Background:
    Given I am logged in

  @regression
  Scenario: TC098-Profile shows the user data
    When I open my profile
    Then I see my profile data

  @smoke @regression
  Scenario: TC099-Logging out returns to the login screen
    When I log out
    Then I see the login screen

  @smoke @regression
  Scenario: TC105-Changing the name
    When I change my name
    Then I see the new name in my profile

  @regression
  Scenario: TC107-Invalid e-mail is rejected
    When I save an invalid e-mail
    Then I see the invalid e-mail error
