// Massa dos testes web: o que os testes digitam e o que esperam ver na tela, separado por tela.
// Origem: seed do app (README "Usuários de teste") e docs/TEST_IDS.md. A conta usada é a da Ana.

export const login = {
  validCpf: '52998224725',
  validPassword: '123456',
  wrongPassword: '000000',
};

// Gabi não existe no seed: é criada pelo cadastro (CPF livre do README).
export const register = {
  name: 'Gabi Teste',
  cpf: '39053344705',
  email: 'gabi@teste.com',
  password: '123456',
  differentConfirmation: '654321',
  greeting: 'Olá, Gabi',
  balance: 'R$ 0,00',
};

// Home da Ana logo depois do reset.
export const home = {
  greeting: 'Olá, Ana',
  balance: 'R$ 5.000,00',
  recentTransactions: ['Internet', 'Pix recebido', 'Supermercado'],
};

// Ana transfere para o Bruno. PIN é a senha de transação da Ana.
export const transfer = {
  brunoCpf: '11144477735',
  pin: '1234',
  wrongPin: '0000',
  amount: '100,00',
  description: 'Almoço',
  receiptAmount: 'R$ 100,00',
  receiptRecipient: 'Bruno Lima',
  receiptDescription: 'Almoço',
  balanceAfter: 'R$ 4.900,00',
};

export const deposit = {
  amount: '150,00',
  receiptAmount: 'R$ 150,00',
  receiptBalance: 'R$ 5.150,00',
  balanceAfter: 'R$ 5.150,00',
};

// Extrato da Ana logo depois do reset.
export const statement = {
  allTransactions: ['Internet', 'Pix recebido', 'Supermercado', 'Salário', 'Uber dividido', 'Presente', 'Pizza'],
  periodFrom: '01/09/2026',
  periodTo: '30/09/2026',
  periodTransactions: ['Uber dividido', 'Presente', 'Pizza'],
  detailType: 'Saída',
  detailAmount: '- R$ 89,90',
  detailDescription: 'Internet',
  detailCounterpart: 'NetFibra',
  detailDate: '12/10/2026 08:00',
  detailId: 'TX0004',
};

export const profile = {
  name: 'Ana Souza',
  cpf: '529.982.247-25',
  email: 'ana@techmoney.com',
  agency: '0001',
  account: '12345-6',
  newName: 'Ana Paula',
};

export const help = {
  welcome: 'Olá! Sou a ajuda do TechMoney. Escolha um assunto abaixo ou escreva sua dúvida.',
  topics: [
    'Como transferir?',
    'Qual é o meu limite diário?',
    'Minha senha de transação bloqueou',
    'Como depositar?',
    'Como filtrar o extrato?',
    'Como alterar meu nome ou e-mail?',
    'Como criar uma conta?',
  ],
  depositTopic: 'Como depositar?',
  depositAnswer:
    'Na Home, toque em Depositar e informe o valor. O máximo por depósito é R$ 10.000,00 e o valor entra no saldo na hora. Seu saldo atual é R$ 5.000,00.',
};

// Mensagens de erro como aparecem na tela.
export const errors = {
  invalidCredentials: 'CPF ou senha inválidos',
  passwordMismatch: 'As senhas não conferem',
  requiredFields: ['Informe o nome', 'Informe o CPF', 'Informe o e-mail', 'Informe a senha', 'Confirme a senha'],
  wrongPin: 'Senha incorreta. Restam 2 tentativas',
};
