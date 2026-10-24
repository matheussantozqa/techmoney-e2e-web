@web @home
Feature: Home

  @smoke @regression
  Scenario: TC001-Home shows greeting and balance
    Given I am on the login page
    When I log in with valid credentials
    Then I see my home
    And I see my balance

  @regression
  Scenario: TC002-Home shows the latest transactions
    Given I am on the login page
    When I log in with valid credentials
    Then I see my recent transactions
