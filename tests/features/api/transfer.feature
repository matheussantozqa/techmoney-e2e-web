@api @transfer
Feature: Transfer

  Background:
    Given I am logged in

  @smoke @regression
  Scenario: TC001-Successful transfer returns the receipt and debits the balance
    When I transfer to Bruno
    Then I get the transfer receipt
    And my balance is debited by the transfer

  @regression
  Scenario: TC002-Recipient receives the transfer
    When I transfer to Bruno
    Then Bruno receives the amount

  @regression
  Scenario: TC003-Recipient is found by e-mail in uppercase
    When I search Bruno by his e-mail in uppercase
    Then I find Bruno as the recipient

  @regression
  Scenario: TC004-Unknown recipient is rejected
    When I transfer to an unknown key
    Then I get the unknown recipient error

  @regression
  Scenario: TC005-Transfer to myself is rejected
    When I transfer to myself
    Then I get the self transfer error

  @regression
  Scenario: TC006-Zero amount is rejected
    When I transfer a zero amount
    Then I get the zero amount error

  @regression
  Scenario: TC007-Amount above the balance is rejected
    When I transfer more than my balance
    Then I get the insufficient balance error

  @regression
  Scenario: TC008-Amount equal to the daily limit is accepted
    When I transfer exactly my daily limit
    Then the transfer is accepted

  @smoke @regression
  Scenario: TC009-Amount above the daily limit is rejected
    When I transfer above my daily limit
    Then I get the daily limit error

  @regression
  Scenario: TC010-Daily limit adds up the transfers of the day
    Given I have transferred part of my daily limit
    When I check my daily limit
    Then I see the remaining daily limit

  @regression
  Scenario: TC011-Wrong PIN returns the attempts left
    When I transfer with a wrong PIN
    Then I get the wrong PIN error

  @smoke @regression
  Scenario: TC012-Third wrong PIN blocks the transaction PIN
    Given I have entered a wrong PIN twice
    When I transfer with a wrong PIN
    Then I get the blocked PIN error
    And my transaction PIN is blocked

  @regression
  Scenario: TC013-Logging in again unblocks the transaction PIN
    Given I have blocked my transaction PIN
    When I log in again
    Then my transaction PIN is unblocked
