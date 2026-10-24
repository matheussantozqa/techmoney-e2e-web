@api @statement
Feature: Statement

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC001-Statement lists all transactions from the most recent
    When I get my statement
    Then I get all my transactions from the most recent

  @regression
  Scenario: TC002-Income filter returns only incoming transactions
    When I get my statement filtered by income
    Then I get only the income transactions

  @regression
  Scenario: TC003-Outcome filter returns only outgoing transactions
    When I get my statement filtered by outcome
    Then I get only the outcome transactions

  @regression
  Scenario: TC004-Period filter returns only that period
    When I get my statement for September
    Then I get only the September transactions

  @regression
  Scenario: TC005-Same start and end day includes that day
    When I get my statement for a single day
    Then I get only the transactions of that day

  @regression
  Scenario: TC006-Start date after the end date is rejected
    When I get my statement with the start date after the end date
    Then I get the inverted period error

  @regression
  Scenario: TC007-Transaction detail returns its data
    When I get a transaction by its id
    Then I get the transaction details

  @regression
  Scenario: TC008-Unknown transaction is not found
    When I get an unknown transaction
    Then I get the transaction not found error
