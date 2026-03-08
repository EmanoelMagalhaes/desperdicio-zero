import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { assertFirebaseReady, auth, createSecondaryAuthApp, db, disposeFirebaseApp } from './firebaseClient';

const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

function mapAuthError(error) {
  const code = error?.code || '';

  if (code === 'auth/invalid-credential') {
    return 'E-mail ou senha invalidos.';
  }
  if (code === 'auth/invalid-email') {
    return 'E-mail invalido.';
  }
  if (code === 'auth/user-not-found') {
    return 'Conta nao encontrada.';
  }
  if (code === 'auth/wrong-password') {
    return 'Senha incorreta.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'Esse e-mail ja esta em uso.';
  }
  if (code === 'auth/weak-password') {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Login por e-mail/senha nao esta habilitado no Firebase Authentication.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Dominio nao autorizado no Firebase Authentication. Adicione o dominio do site em Authorized domains.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Falha de rede ao falar com o Firebase. Verifique sua conexao e tente novamente.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
  }
  if (code === 'permission-denied') {
    return 'Permissao negada no Firestore. Revise as regras do banco.';
  }
  if (code === 'failed-precondition') {
    return 'O Firestore nao esta configurado corretamente para essa operacao.';
  }
  if (code === 'auth/invalid-api-key') {
    return 'Chave da API invalida. Revise os Secrets/Variaveis do deploy.';
  }

  return `Nao foi possivel concluir a autenticacao agora. (${code || 'erro-desconhecido'})`;
}

function toSessionAccount(uid, profile) {
  return {
    id: uid,
    role: profile.role,
    name: profile.name || profile.email || 'Usuario',
    email: profile.email || '',
    businessType: profile.businessType || 'Operacao',
    approvalStatus: profile.approvalStatus || APPROVAL_STATUS.APPROVED,
  };
}

function approvalError(status) {
  if (status === APPROVAL_STATUS.PENDING) {
    return 'Seu cadastro esta pendente de aprovacao do administrador.';
  }

  if (status === APPROVAL_STATUS.REJECTED) {
    return 'Seu cadastro foi reprovado. Entre em contato com o administrador.';
  }

  return 'Sua conta de cliente ainda nao foi aprovada.';
}

async function getProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) return null;
  return snapshot.data();
}

async function createClientProfile(uid, form, approvalStatus, metadata = {}) {
  const { name, email, businessType } = form;

  const profile = {
    role: 'client',
    name,
    email,
    businessType,
    approvalStatus,
    createdAt: serverTimestamp(),
    ...metadata,
  };

  await setDoc(doc(db, 'users', uid), profile, { merge: true });

  return profile;
}

export async function loginWithFirebase(mode, email, password) {
  if (!email || !password) {
    return { ok: false, error: 'Preencha e-mail e senha.' };
  }

  try {
    assertFirebaseReady();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getProfile(credential.user.uid);

    if (!profile) {
      await signOut(auth);
      return { ok: false, error: 'Perfil nao encontrado no banco. Verifique o cadastro.' };
    }

    if (mode === 'admin' && profile.role !== 'admin') {
      await signOut(auth);
      return { ok: false, error: 'Esta conta nao possui acesso administrativo.' };
    }

    if (mode === 'client' && profile.role !== 'client') {
      await signOut(auth);
      return { ok: false, error: 'Use o acesso de administrador para esta conta.' };
    }

    if (mode === 'client') {
      const status = profile.approvalStatus || APPROVAL_STATUS.APPROVED;
      if (status !== APPROVAL_STATUS.APPROVED) {
        await signOut(auth);
        return { ok: false, error: approvalError(status) };
      }
    }

    return { ok: true, account: toSessionAccount(credential.user.uid, profile) };
  } catch (error) {
    console.error('loginWithFirebase error:', error);
    return { ok: false, error: mapAuthError(error) };
  }
}

export async function registerClientWithFirebase(form) {
  const { name, email, password, businessType } = form;

  if (!name || !email || !password) {
    return { ok: false, error: 'Preencha nome, e-mail e senha para criar sua conta.' };
  }

  let secondaryApp = null;
  let secondaryAuth = null;

  try {
    assertFirebaseReady();

    const secondaryContext = createSecondaryAuthApp(`public-register-${Date.now()}`);
    secondaryApp = secondaryContext.app;
    secondaryAuth = secondaryContext.auth;

    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = credential.user.uid;

    await createClientProfile(
      uid,
      { name, email, businessType },
      APPROVAL_STATUS.PENDING,
      { requestedAt: serverTimestamp() }
    );

    return {
      ok: true,
      requiresApproval: true,
      message: 'Cadastro enviado para analise. Seu acesso ficara pendente ate autorizacao de um administrador.',
    };
  } catch (error) {
    console.error('registerClientWithFirebase error:', error);
    return { ok: false, error: mapAuthError(error) };
  } finally {
    if (secondaryAuth) {
      signOut(secondaryAuth).catch(() => null);
    }

    if (secondaryApp) {
      disposeFirebaseApp(secondaryApp).catch(() => null);
    }
  }
}

export async function createClientByAdminWithFirebase(form, adminAccount) {
  const { name, email, password, businessType } = form;

  if (!adminAccount || adminAccount.role !== 'admin') {
    return { ok: false, error: 'Apenas administradores podem cadastrar clientes.' };
  }

  if (!name || !email || !password) {
    return { ok: false, error: 'Preencha nome, e-mail e senha para cadastrar o cliente.' };
  }

  let secondaryApp = null;
  let secondaryAuth = null;

  try {
    assertFirebaseReady();

    const secondaryContext = createSecondaryAuthApp();
    secondaryApp = secondaryContext.app;
    secondaryAuth = secondaryContext.auth;

    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = credential.user.uid;

    await createClientProfile(
      uid,
      { name, email, businessType },
      APPROVAL_STATUS.APPROVED,
      {
        approvedAt: serverTimestamp(),
        approvedBy: adminAccount.id,
        createdByAdminAt: serverTimestamp(),
      }
    );

    await signOut(secondaryAuth);
    await disposeFirebaseApp(secondaryApp);

    return {
      ok: true,
      account: toSessionAccount(uid, {
        role: 'client',
        name,
        email,
        businessType,
        approvalStatus: APPROVAL_STATUS.APPROVED,
      }),
    };
  } catch (error) {
    console.error('createClientByAdminWithFirebase error:', error);

    if (secondaryAuth) {
      try {
        await signOut(secondaryAuth);
      } catch {
        // noop
      }
    }

    if (secondaryApp) {
      try {
        await disposeFirebaseApp(secondaryApp);
      } catch {
        // noop
      }
    }

    return { ok: false, error: mapAuthError(error) };
  }
}

export function subscribeAuthSession(onChange) {
  assertFirebaseReady();

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      onChange(null);
      return;
    }

    try {
      const profile = await getProfile(user.uid);
      if (!profile) {
        onChange(null);
        return;
      }

      if (profile.role === 'client' && profile.approvalStatus && profile.approvalStatus !== APPROVAL_STATUS.APPROVED) {
        await signOut(auth);
        onChange(null);
        return;
      }

      onChange(toSessionAccount(user.uid, profile));
    } catch {
      onChange(null);
    }
  });
}

export async function logoutFirebase() {
  assertFirebaseReady();
  await signOut(auth);
}

export { APPROVAL_STATUS };


