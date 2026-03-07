import { createId } from '../utils/ids';

export function loginWithMode(state, mode, email, password) {
  const source = mode === 'admin' ? state.adminAccounts : state.clientAccounts;
  const account = source.find((item) => item.email === email && item.password === password);

  if (!account) {
    return { ok: false, error: 'Nao encontramos esse acesso. Confira e-mail e senha.' };
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
  };

  const nextState = {
    ...state,
    clientAccounts: [...state.clientAccounts, newClient],
    inventories: { ...state.inventories, [id]: [] },
    shoppingLists: { ...state.shoppingLists, [id]: [] },
    challenges: {
      ...state.challenges,
      [id]: {
        completed: [],
        current: [
          'Cadastrar os primeiros itens do estoque',
          'Montar a primeira lista de compras',
          'Revisar itens com validade mais proxima',
        ],
      },
    },
  };

  return { ok: true, account: newClient, nextState };
}