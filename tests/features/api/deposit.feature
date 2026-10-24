@api @deposit
Feature: Deposit

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC001-Successful deposit returns the receipt and credits the balance
    When I deposit a valid amount
    Then I get the deposit receipt
    And my balance is credited by the deposit

  @regression
  Scenario: TC002-Empty amount is rejected
    When I deposit without an amount
    Then I get the empty amount error

  @regression
  Scenario: TC003-Zero amount is rejected
    When I deposit a zero amount
    Then I get the zero amount error

  @regression
  Scenario: TC004-Maximum amount is accepted
    When I deposit the maximum amount
    Then the deposit is accepted

  @smoke @regression
  Scenario: TC005-Amount above the maximum is rejected
    When I deposit above the maximum
    Then I get the deposit limit error

  @regression
  Scenario: TC006-Non-integer amount is rejected
    When I deposit a non-integer amount
    Then I get the invalid amount error
