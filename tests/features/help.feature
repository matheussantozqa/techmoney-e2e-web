@web @help
Feature: Help

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC118-Help opens with the welcome message and all topics
    When I open the help
    Then I see the welcome message
    And I see all the help topics

  @regression
  Scenario: TC119-Topic shows its answer
    When I open the help
    And I choose the deposit topic
    Then I see the deposit answer
