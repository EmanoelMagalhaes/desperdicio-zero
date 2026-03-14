import { createId } from '../utils/ids';

function isApprovedClient(account) {
  const status = account?.approvalStatus || 'approved';
  return status === 'approved';
}

function baseClientChallenges() {
  return {
    completed: [],
    current: [
      'Cadastrar os primeiros itens do estoque',
      'Montar a primeira lista de compras',
      'Revisar itens com validade mais proxima',
    ],
  };
}

function resolveAccountsByMode(state, mode) {
  if (mode === 'admin') return state.adminAccounts;
  if (mode === 'consumer') return state.consumerAccounts || [];
  return state.clientAccounts;
}

export function loginWithMode(state, mode, email, password) {
  const source = resolveAccountsByMode(state, mode);
  const account = source.find((item) => item.email === email && item.password === password);

  if (!account) {
    return { ok: false, error: 'Nao encontramos esse acesso. Confira e-mail e senha.' };
  }

  if (mode === 'client' && !isApprovedClient(account)) {
    const status = account.approvalStatus || 'pending';

    if (status === 'pending') {
      return { ok: false, error: 'Seu cadastro esta pendente de aprovacao do administrador.' };
    }

    if (status === 'rejected') {
      return { ok: false, error: 'Seu cadastro foi reprovado. Entre em contato com o administrador.' };
    }

    return { ok: false, error: 'Sua conta de cliente ainda nao foi aprovada.' };
  }

  return { ok: true, account };
}

export function registerClientAccount(state, form) {
  const { name, email, password, businessType } = form;

  if (!name || !email || !password) {
    return { ok: false, error: 'Preencha nome, e-mail e senha para criar sua conta.' };
  }

  if (state.clientAccounts.some((account) => account.email === email)) {
    return { ok: false, error: 'Esse e-mail ja esta cadastrado.' };
  }

  const id = createId('cliente');
  const newClient = {
    id,
    role: 'client',
    name,
    email,
    password,
    businessType,
    approvalStatus: 'pending',
  };

  const nextState = {
    ...state,
    clientAccounts: [...state.clientAccounts, newClient],
    inventories: { ...state.inventories, [id]: [] },
    shoppingLists: { ...state.shoppingLists, [id]: [] },
    challenges: {
      ...state.challenges,
      [id]: baseClientChallenges(),
    },
  };

  return {
    ok: true,
    requiresApproval: true,
    message: 'Cadastro criado. Aguarde aprovacao do administrador para acessar o sistema.',
    nextState,
  };
}

export function registerConsumerAccount(state, form) {
  const { name, email, password, address } = form;

  if (!name || !email || !password || !address) {
    return { ok: false, error: 'Preencha nome, e-mail, endereco e senha para criar sua conta.' };
  }

  if ((state.consumerAccounts || []).some((account) => account.email === email)) {
    return { ok: false, error: 'Esse e-mail ja esta cadastrado.' };
  }

  const id = createId('consumidor');
  const newConsumer = {
    id,
    role: 'consumer',
    name,
    email,
    password,
    address,
  };

  return {
    ok: true,
    account: newConsumer,
    nextState: {
      ...state,
      consumerAccounts: [...(state.consumerAccounts || []), newConsumer],
    },
  };
}

export function createClientAccountByAdmin(state, form) {
  const { name, email, password, businessType } = form;

  if (!name || !email || !password) {
    return { ok: false, error: 'Preencha nome, e-mail e senha para cadastrar o cliente.' };
  }

  if (state.clientAccounts.some((account) => account.email === email)) {
    return { ok: false, error: 'Ja existe um cliente com esse e-mail.' };
  }

  if (state.adminAccounts.some((account) => account.email === email)) {
    return { ok: false, error: 'Esse e-mail ja esta em uso por um administrador.' };
  }

  const id = createId('cliente');
  const newClient = {
    id,
    role: 'client',
    name,
    email,
    password,
    businessType,
    approvalStatus: 'approved',
  };

  const nextState = {
    ...state,
    clientAccounts: [...state.clientAccounts, newClient],
    inventories: { ...state.inventories, [id]: [] },
    shoppingLists: { ...state.shoppingLists, [id]: [] },
    challenges: {
      ...state.challenges,
      [id]: baseClientChallenges(),
    },
  };

  return { ok: true, nextState, account: newClient };
}
