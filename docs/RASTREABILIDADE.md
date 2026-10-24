# Rastreabilidade: cenários ↔ matriz de testes

Liga cada cenário da suíte (`TC<NNN>`, no título do cenário e no Allure) aos casos da [matriz de testes](../../../MATRIZ_DE_TESTES.md) do TechMoney.

Divisão entre as camadas (o porquê está no [README](../README.md#por-que-a-maior-parte-dos-testes-está-na-api)):

- **API**: regras de negócio, validações, erros e efeitos colaterais.
- **Web**: caminho feliz de cada tela, um ou outro negativo e o que só existe na tela.

O ID é por feature: cada arquivo `.feature` numera os seus cenários a partir do `TC001`. Um cenário é identificado pela feature + ID (`web/login` TC001), que é também o jeito de rodar só ele: `npm test -- web/login --grep TC001`.

Cenário novo ou alterado: atualizar esta tabela junto. Cenário novo ganha o próximo ID da feature (maior + 1); ID removido fica aposentado naquela feature (nunca reaproveitar).

## Web

| Feature | TC | Cenário | Matriz |
|---|---|---|---|
| `web/login` | TC001 | Successful login with valid credentials | LOG-01 |
| `web/login` | TC002 | Wrong password is rejected | LOG-12 |
| `web/login` | TC003 | Password can be shown and hidden | LOG-13 |
| `web/login` | TC004 | Create account link opens the register screen | LOG-16 |
| `web/register` | TC001 | Successful registration opens the new account home | REG-01 |
| `web/register` | TC002 | Empty form shows all field errors | REG-02 |
| `web/register` | TC003 | Different passwords are rejected | REG-11 |
| `web/home` | TC001 | Home shows greeting and balance | HOM-01 |
| `web/home` | TC002 | Home shows the latest transactions | HOM-03 |
| `web/transfer` | TC001 | Successful transfer | TRF-01, TRF-42 |
| `web/transfer` | TC002 | Wrong PIN shows the attempts left | TRF-35 |
| `web/deposit` | TC001 | Successful deposit | DEP-01 |
| `web/statement` | TC001 | Statement lists the transactions from the most recent | EXT-01 |
| `web/statement` | TC002 | Period filter shows only that period | EXT-05 |
| `web/statement` | TC003 | Transaction detail shows its data | DET-01 |
| `web/profile` | TC001 | Profile shows the user data | PRF-01 |
| `web/profile` | TC002 | Logging out returns to the login screen | PRF-02 |
| `web/profile` | TC003 | Changing the name | EDT-02 |
| `web/help` | TC001 | Help opens with the welcome message and all topics | HLP-02 |
| `web/help` | TC002 | Topic shows its answer | HLP-03 |

## API

| Feature | TC | Cenário | Matriz |
|---|---|---|---|
| `api/auth` | TC001 | Login returns a token and the user data | LOG-01 |
| `api/auth` | TC002 | Empty CPF is rejected | LOG-04 |
| `api/auth` | TC003 | Empty password is rejected | LOG-05 |
| `api/auth` | TC004 | Invalid CPF is rejected | LOG-06 |
| `api/auth` | TC005 | Wrong password is rejected | LOG-12 |
| `api/auth` | TC006 | Valid but unregistered CPF is rejected | LOG-11 |
| `api/auth` | TC007 | Protected route requires a token | Contrato (401 `UNAUTHORIZED`) |
| `api/auth` | TC008 | Token stops working after logout | PRF-04 |
| `api/register` | TC001 | Successful registration creates an account with zero balance | REG-01 |
| `api/register` | TC002 | Invalid CPF is rejected | REG-04 |
| `api/register` | TC003 | Invalid e-mail is rejected | REG-06 |
| `api/register` | TC004 | Already registered CPF is rejected | REG-05 |
| `api/register` | TC005 | Already registered e-mail in uppercase is rejected | REG-07 |
| `api/register` | TC006 | Password shorter than 6 characters is rejected | REG-08 |
| `api/profile` | TC001 | Profile returns my data | PRF-01 |
| `api/profile` | TC002 | Changing name and e-mail | EDT-02, EDT-03 |
| `api/profile` | TC003 | Empty name is rejected | EDT-04 |
| `api/profile` | TC004 | Invalid e-mail is rejected | EDT-06 |
| `api/profile` | TC005 | E-mail of another account is rejected | EDT-07 |
| `api/profile` | TC006 | New e-mail works as transfer key | EDT-10 |
| `api/statement` | TC001 | Statement lists all transactions from the most recent | EXT-01 |
| `api/statement` | TC002 | Income filter returns only incoming transactions | EXT-02 |
| `api/statement` | TC003 | Outcome filter returns only outgoing transactions | EXT-03 |
| `api/statement` | TC004 | Period filter returns only that period | EXT-05 |
| `api/statement` | TC005 | Same start and end day includes that day | EXT-06 |
| `api/statement` | TC006 | Start date after the end date is rejected | EXT-09 |
| `api/statement` | TC007 | Transaction detail returns its data | DET-01 |
| `api/statement` | TC008 | Unknown transaction is not found | Contrato (404 `TRANSACTION_NOT_FOUND`) |
| `api/transfer` | TC001 | Successful transfer returns the receipt and debits the balance | TRF-01, TRF-42 |
| `api/transfer` | TC002 | Recipient receives the transfer | TRF-02 |
| `api/transfer` | TC003 | Recipient is found by e-mail in uppercase | TRF-04 |
| `api/transfer` | TC004 | Unknown recipient is rejected | TRF-06 |
| `api/transfer` | TC005 | Transfer to myself is rejected | TRF-07 |
| `api/transfer` | TC006 | Zero amount is rejected | TRF-15 |
| `api/transfer` | TC007 | Amount above the balance is rejected | TRF-21, TRF-24 |
| `api/transfer` | TC008 | Amount equal to the daily limit is accepted | TRF-22 |
| `api/transfer` | TC009 | Amount above the daily limit is rejected | TRF-23 |
| `api/transfer` | TC010 | Daily limit adds up the transfers of the day | TRF-25 |
| `api/transfer` | TC011 | Wrong PIN returns the attempts left | TRF-35 |
| `api/transfer` | TC012 | Third wrong PIN blocks the transaction PIN | TRF-37 |
| `api/transfer` | TC013 | Logging in again unblocks the transaction PIN | TRF-40 |
| `api/deposit` | TC001 | Successful deposit returns the receipt and credits the balance | DEP-01 |
| `api/deposit` | TC002 | Empty amount is rejected | DEP-02 |
| `api/deposit` | TC003 | Zero amount is rejected | DEP-03 |
| `api/deposit` | TC004 | Maximum amount is accepted | DEP-05 |
| `api/deposit` | TC005 | Amount above the maximum is rejected | DEP-06 |
| `api/deposit` | TC006 | Non-integer amount is rejected | DEP-07 |
