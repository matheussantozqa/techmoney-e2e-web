@web @transfer
Feature: Transfer

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC038-Successful transfer
    When I transfer to Bruno
    Then I see the transfer receipt
    When I finish the transfer
    Then I see the balance after the transfer

  @regression
  Scenario: TC041-Unknown recipient is rejected
    When I start a transfer to an unknown key
    Then I see the unknown recipient error

  @regression
  Scenario: TC048-Amount above the balance is rejected
    When I start a transfer to Bruno
    And I enter an amount above the balance
    Then I see the insufficient balance error

  @smoke @regression
  Scenario: TC049-Amount above the daily limit is rejected
    When I start a transfer to Bruno
    And I enter an amount above the daily limit
    Then I see the daily limit error

  @regression
  Scenario: TC064-Wrong PIN shows the attempts left
    Given I am on the PIN step of a transfer to Bruno
    When I enter a wrong PIN
    Then I see the wrong PIN error

  @smoke @regression
  Scenario: TC065-Third wrong PIN blocks the transaction PIN
    Given I am on the PIN step of a transfer to Bruno
    When I enter a wrong PIN 3 times
    Then I see the blocked PIN error
