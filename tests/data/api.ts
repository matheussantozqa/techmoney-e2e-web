// Massa dos testes de API: o corpo que cada teste manda e o que a API deve devolver, separado por recurso.
// Origem: docs/API.md (contrato) e seed do app (README "Usuários de teste"). Dinheiro sempre em centavos.

export const auth = {
  validLogin: { cpf: '52998224725', password: '123456' },
  emptyCpf: { cpf: '', password: '123456' },
  emptyPassword: { cpf: '52998224725', password: '' },
  invalidCpf: { cpf: '12345678900', password: '123456' },
  wrongPassword: { cpf: '52998224725', password: '000000' },
  unregisteredCpf: { cpf: '39053344705', password: '123456' }, // CPF válido que não está no seed
};

// Gabi não existe no seed: é criada pelo cadastro (CPF livre do README).
export const register = {
  newAccount: { name: 'Gabi Teste', cpf: '39053344705', email: 'gabi@teste.com', password: '123456' },
  invalidCpf: { name: 'Gabi Teste', cpf: '12345678900', email: 'gabi@teste.com', password: '123456' },
  invalidEmail: { name: 'Gabi Teste', cpf: '39053344705', email: 'ana@', password: '123456' },
  registeredCpf: { name: 'Gabi Teste', cpf: '52998224725', email: 'gabi@teste.com', password: '123456' }, // CPF da Ana
  registeredEmailUppercase: { name: 'Gabi Teste', cpf: '39053344705', email: 'ANA@TECHMONEY.COM', password: '123456' },
  shortPassword: { name: 'Gabi Teste', cpf: '39053344705', email: 'gabi@teste.com', password: '12345' },
  createdAccount: { name: 'Gabi Teste', cpf: '39053344705', email: 'gabi@teste.com', agency: '0001', balanceCents: 0 },
};

// Perfil da Ana logo depois do reset.
export const profile = {
  user: {
    id: '1',
    name: 'Ana Souza',
    cpf: '52998224725',
    email: 'ana@techmoney.com',
    agency: '0001',
    account: '12345-6',
    balanceCents: 500000,
  },
  newData: { name: 'Ana Paula', email: 'ANA.NOVA@techmoney.com' },
  updatedData: { name: 'Ana Paula', email: 'ana.nova@techmoney.com' }, // a API salva o e-mail em minúsculas
  emptyName: { name: '', email: 'ana@techmoney.com' },
  invalidEmail: { name: 'Ana Souza', email: 'ana@' },
  otherAccountEmail: { name: 'Ana Souza', email: 'bruno@techmoney.com' },
  newEmail: { name: 'Ana Souza', email: 'ana.nova@techmoney.com' },
  recipientMe: { id: '1', name: 'Ana Souza', cpf: '52998224725', agency: '0001', account: '12345-6' },
};

// Extrato da Ana logo depois do reset (descrições, da mais recente para a mais antiga).
export const statement = {
  allTransactions: ['Internet', 'Pix recebido', 'Supermercado', 'Salário', 'Uber dividido', 'Presente', 'Pizza'],
  incomeFilter: { type: 'INCOME' },
  incomeTransactions: ['Pix recebido', 'Salário'],
  outcomeFilter: { type: 'OUTCOME' },
  outcomeTransactions: ['Internet', 'Supermercado', 'Uber dividido', 'Presente', 'Pizza'],
  septemberFilter: { from: '2026-09-01', to: '2026-09-30' },
  septemberTransactions: ['Uber dividido', 'Presente', 'Pizza'],
  singleDayFilter: { from: '2026-10-05', to: '2026-10-05' },
  singleDayTransactions: ['Salário'],
  invertedPeriodFilter: { from: '2026-10-05', to: '2026-10-01' },
  transactionId: 'TX0004',
  transaction: {
    id: 'TX0004',
    type: 'OUTCOME',
    amountCents: 8990,
    description: 'Internet',
    counterpartName: 'NetFibra',
    date: '2026-10-12T11:00:00.000Z',
  },
  unknownTransactionId: 'TX9999',
};

// Ana transfere para o Bruno. Ana tem R$ 5.000,00 e limite diário de R$ 1.000,00; Bruno tem R$ 1.250,50.
export const transfer = {
  toBruno: { recipientKey: '11144477735', amountCents: 10000, description: 'Almoço', pin: '1234' },
  receipt: { type: 'OUTCOME', amountCents: 10000, description: 'Almoço', counterpartName: 'Bruno Lima', counterpartId: '2' },
  receiptId: /^TX\d{4}$/,
  balanceAfter: 490000,
  brunoLogin: { cpf: '11144477735', password: '123456' },
  brunoBalanceAfter: 135050,
  brunoEmailUppercase: { key: 'BRUNO@TECHMONEY.COM' },
  bruno: { id: '2', name: 'Bruno Lima', cpf: '11144477735', agency: '0001', account: '23456-7' },
  toUnknownKey: { recipientKey: '39053344705', amountCents: 10000, pin: '1234' }, // CPF válido que não está no seed
  toMyself: { recipientKey: '52998224725', amountCents: 10000, pin: '1234' },
  zeroAmount: { recipientKey: '11144477735', amountCents: 0, pin: '1234' },
  aboveBalance: { recipientKey: '11144477735', amountCents: 500001, pin: '1234' },
  exactDailyLimit: { recipientKey: '11144477735', amountCents: 100000, pin: '1234' },
  aboveDailyLimit: { recipientKey: '11144477735', amountCents: 100001, pin: '1234' },
  partOfDailyLimit: { recipientKey: '11144477735', amountCents: 60000, pin: '1234' },
  remainingDailyLimit: { limitCents: 100000, remainingCents: 40000 },
  wrongPin: { recipientKey: '11144477735', amountCents: 10000, pin: '0000' },
};

export const deposit = {
  validAmount: { amountCents: 15000 },
  receipt: { type: 'INCOME', amountCents: 15000, description: 'Depósito', counterpartName: 'TechMoney' },
  balanceAfter: 515000,
  noAmount: {},
  zeroAmount: { amountCents: 0 },
  maximumAmount: { amountCents: 1000000 },
  aboveMaximum: { amountCents: 1000001 },
  nonIntegerAmount: { amountCents: 10.5 },
};

// Erros como a API devolve: status + corpo { code, message, field? }.
export const errors = {
  emptyCpf: { status: 400, body: { code: 'VALIDATION_ERROR', message: 'Informe o CPF', field: 'cpf' } },
  emptyPassword: { status: 400, body: { code: 'VALIDATION_ERROR', message: 'Informe a senha', field: 'password' } },
  invalidCpf: { status: 400, body: { code: 'VALIDATION_ERROR', message: 'CPF inválido', field: 'cpf' } },
  invalidCredentials: { status: 401, body: { code: 'INVALID_CREDENTIALS', message: 'CPF ou senha inválidos' } },
  unauthorized: { status: 401, body: { code: 'UNAUTHORIZED', message: 'Sessão expirada, faça login novamente' } },
  invalidEmail: { status: 400, body: { code: 'VALIDATION_ERROR', message: 'E-mail inválido', field: 'email' } },
  registeredCpf: { status: 409, body: { code: 'CPF_ALREADY_EXISTS', message: 'CPF já cadastrado' } },
  registeredEmail: { status: 409, body: { code: 'EMAIL_ALREADY_EXISTS', message: 'E-mail já cadastrado' } },
  shortPassword: {
    status: 400,
    body: { code: 'VALIDATION_ERROR', message: 'A senha deve ter pelo menos 6 caracteres', field: 'password' },
  },
  emptyName: { status: 400, body: { code: 'VALIDATION_ERROR', message: 'Informe o nome', field: 'name' } },
  invertedPeriod: {
    status: 400,
    body: { code: 'VALIDATION_ERROR', message: 'A data inicial não pode ser depois da data final', field: 'from' },
  },
  transactionNotFound: { status: 404, body: { code: 'TRANSACTION_NOT_FOUND', message: 'Transação não encontrada' } },
  unknownRecipient: { status: 404, body: { code: 'RECIPIENT_NOT_FOUND', message: 'Destinatário não encontrado' } },
  selfTransfer: { status: 422, body: { code: 'SELF_TRANSFER', message: 'Você não pode transferir para você mesmo' } },
  emptyAmount: { status: 400, body: { code: 'VALIDATION_ERROR', message: 'Informe o valor', field: 'amountCents' } },
  zeroAmount: {
    status: 400,
    body: { code: 'VALIDATION_ERROR', message: 'O valor deve ser maior que zero', field: 'amountCents' },
  },
  invalidAmount: { status: 400, body: { code: 'VALIDATION_ERROR', message: 'Valor inválido', field: 'amountCents' } },
  insufficientBalance: { status: 422, body: { code: 'INSUFFICIENT_BALANCE', message: 'Saldo insuficiente' } },
  dailyLimit: { status: 422, body: { code: 'DAILY_LIMIT_EXCEEDED', message: 'Valor acima do limite diário' } },
  wrongPin: {
    status: 422,
    body: { code: 'WRONG_PIN', message: 'Senha incorreta. Restam 2 tentativas', attemptsLeft: 2 },
  },
  blockedPin: {
    status: 423,
    body: { code: 'PIN_BLOCKED', message: 'Senha de transação bloqueada. Faça login novamente para desbloquear.' },
  },
  depositLimit: {
    status: 422,
    body: { code: 'DEPOSIT_LIMIT_EXCEEDED', message: 'O valor máximo por depósito é R$ 10.000,00' },
  },
};
