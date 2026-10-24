@web @deposit
Feature: Deposit

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC073-Successful deposit
    When I deposit a valid amount
    Then I see the deposit receipt
    When I finish the deposit
    Then I see the balance after the deposit

  @regression
  Scenario: TC074-Empty amount is rejected
    When I deposit an empty amount
    Then I see the empty amount error

  @smoke @regression
  Scenario: TC075-Deposit above the maximum is rejected
    When I deposit above the maximum
    Then I see the deposit above the maximum error
