import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { assertFirebaseReady, auth, db } from './firebaseClient';

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

  return 'Nao foi possivel concluir a autenticacao agora.';
}

function toSessionAccount(uid, profile) {
  return {
    id: uid,
    role: profile.role,
    name: profile.name || profile.email || 'Usuario',
    email: profile.email || '',
    businessType: profile.businessType || 'Operacao',
  };
}

async function getProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) return null;
  return snapshot.data();
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

    return { ok: true, account: toSessionAccount(credential.user.uid, profile) };
  } catch (error) {
    return { ok: false, error: mapAuthError(error) };
  }
}

export async function registerClientWithFirebase(form) {
  const { name, email, password, businessType } = form;

  if (!name || !email || !password) {
    return { ok: false, error: 'Preencha nome, e-mail e senha para criar sua conta.' };
  }

  try {
    assertFirebaseReady();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    const profile = {
      role: 'client',
      name,
      email,
      businessType,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', uid), profile, { merge: true });

    return {
      ok: true,
      account: toSessionAccount(uid, {
        role: 'client',
        name,
        email,
        businessType,
      }),
    };
  } catch (error) {
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
