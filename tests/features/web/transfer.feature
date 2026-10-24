@web @transfer
Feature: Transfer

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC001-Successful transfer
    When I transfer to Bruno
    Then I see the transfer receipt
    When I finish the transfer
    Then I see the balance after the transfer

  @regression
  Scenario: TC002-Wrong PIN shows the attempts left
    Given I am on the PIN step of a transfer to Bruno
    When I enter a wrong PIN
    Then I see the wrong PIN error
