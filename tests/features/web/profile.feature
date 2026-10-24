@web @profile
Feature: Profile

  Background:
    Given I am logged in

  @regression
  Scenario: TC001-Profile shows the user data
    When I open my profile
    Then I see my profile data

  @smoke @regression
  Scenario: TC002-Logging out returns to the login screen
    When I log out
    Then I see the login screen

  @smoke @regression
  Scenario: TC003-Changing the name
    When I change my name
    Then I see the new name in my profile
