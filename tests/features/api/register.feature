@api @register
Feature: Register

  @smoke @regression
  Scenario: TC001-Successful registration creates an account with zero balance
    When I register a new account
    Then I get a token and the new account with zero balance

  @regression
  Scenario: TC002-Invalid CPF is rejected
    When I register with an invalid CPF
    Then I get the invalid CPF error

  @regression
  Scenario: TC003-Invalid e-mail is rejected
    When I register with an invalid e-mail
    Then I get the invalid e-mail error

  @regression
  Scenario: TC004-Already registered CPF is rejected
    When I register with an already registered CPF
    Then I get the already registered CPF error

  @regression
  Scenario: TC005-Already registered e-mail in uppercase is rejected
    When I register with an already registered e-mail in uppercase
    Then I get the already registered e-mail error

  @regression
  Scenario: TC006-Password shorter than 6 characters is rejected
    When I register with a 5-character password
    Then I get the short password error
