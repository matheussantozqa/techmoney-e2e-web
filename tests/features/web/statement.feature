@web @statement
Feature: Statement

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC001-Statement lists the transactions from the most recent
    When I open the statement
    Then I see all the transactions

  @regression
  Scenario: TC002-Period filter shows only that period
    When I open the statement
    And I filter by a period
    Then I see only the transactions of that period

  @regression
  Scenario: TC003-Transaction detail shows its data
    When I open a transaction from the statement
    Then I see the transaction details
