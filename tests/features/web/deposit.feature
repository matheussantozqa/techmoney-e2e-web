@web @deposit
Feature: Deposit

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC001-Successful deposit
    When I deposit a valid amount
    Then I see the deposit receipt
    When I finish the deposit
    Then I see the balance after the deposit
