import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { assertFirebaseReady, auth, createSecondaryAuthApp, db, disposeFirebaseApp } from './firebaseClient';
import { normalizeRole } from '../types/roles';

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
  if (code === 'auth/invalid-continue-uri' || code === 'auth/unauthorized-continue-uri') {
    return 'Falha ao enviar verificacao de e-mail. Revise os dominios autorizados no Firebase.';
  }

  return `Nao foi possivel concluir a autenticacao agora. (${code || 'erro-desconhecido'})`;
}

function toSessionAccount(uid, profile, emailVerified = false) {
  const normalizedRole = normalizeRole(profile.role);

  return {
    id: uid,
    role: normalizedRole || profile.role,
    name: profile.name || profile.email || 'Usuario',
    email: profile.email || '',
    businessType: profile.businessType || 'Operacao',
    approvalStatus: profile.approvalStatus || APPROVAL_STATUS.APPROVED,
    emailVerified,
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

async function createClientProfile(firestoreDb, uid, form, approvalStatus, metadata = {}) {
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

  await setDoc(doc(firestoreDb, 'users', uid), profile, { merge: true });

  return profile;
}

async function createConsumerProfile(firestoreDb, uid, form, metadata = {}) {
  const { name, email } = form;

  const profile = {
    role: 'consumer',
    name,
    email,
    createdAt: serverTimestamp(),
    ...metadata,
  };

  await setDoc(doc(firestoreDb, 'users', uid), profile, { merge: true });

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

    const normalizedRole = normalizeRole(profile.role);
    if (!normalizedRole) {
      await signOut(auth);
      return { ok: false, error: 'Perfil com role invalido. Contate o administrador.' };
    }

    if (mode === 'admin' && normalizedRole !== 'admin') {
      await signOut(auth);
      return { ok: false, error: 'Esta conta nao possui acesso administrativo.' };
    }

    if (mode === 'client' && normalizedRole !== 'client') {
      await signOut(auth);
      return { ok: false, error: 'Use o acesso de administrador para esta conta.' };
    }

    if (mode === 'consumer' && normalizedRole !== 'consumer') {
      await signOut(auth);
      return { ok: false, error: 'Esta conta nao possui acesso de consumidor.' };
    }

    if (mode === 'client') {
      await reload(credential.user);

      if (!credential.user.emailVerified) {
        await signOut(auth);
        return { ok: false, error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' };
      }

      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          emailVerified: true,
          emailVerifiedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const status = profile.approvalStatus || APPROVAL_STATUS.APPROVED;
      if (status !== APPROVAL_STATUS.APPROVED) {
        await signOut(auth);
        return { ok: false, error: approvalError(status) };
      }
    }

    if (mode === 'consumer') {
      await reload(credential.user);

      if (!credential.user.emailVerified) {
        await signOut(auth);
        return { ok: false, error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' };
      }

      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          emailVerified: true,
          emailVerifiedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return {
      ok: true,
      account: toSessionAccount(credential.user.uid, profile, credential.user.emailVerified),
    };
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
  let secondaryDb = null;
  let createdUser = null;

  const defaultPendingMessage =
    'Cadastro enviado. Confirme seu e-mail e aguarde a autorizacao de um administrador.';

  try {
    assertFirebaseReady();

    const secondaryContext = createSecondaryAuthApp(`public-register-${Date.now()}`);
    secondaryApp = secondaryContext.app;
    secondaryAuth = secondaryContext.auth;
    secondaryDb = secondaryContext.db;

    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    createdUser = credential.user;

    await sendEmailVerification(createdUser);

    await createClientProfile(
      secondaryDb,
      createdUser.uid,
      { name, email, businessType },
      APPROVAL_STATUS.PENDING,
      {
        requestedAt: serverTimestamp(),
        emailVerified: false,
        verificationEmailSentAt: serverTimestamp(),
      }
    );

    return {
      ok: true,
      requiresApproval: true,
      message: defaultPendingMessage,
    };
  } catch (error) {
    if (error?.code === 'auth/email-already-in-use' && secondaryAuth && secondaryDb) {
      try {
        const recovery = await signInWithEmailAndPassword(secondaryAuth, email, password);
        const recoveryUser = recovery.user;

        if (!recoveryUser.emailVerified) {
          await sendEmailVerification(recoveryUser);
        }

        const profileSnapshot = await getDoc(doc(secondaryDb, 'users', recoveryUser.uid));

        if (!profileSnapshot.exists()) {
          await createClientProfile(
            secondaryDb,
            recoveryUser.uid,
            { name, email, businessType },
            APPROVAL_STATUS.PENDING,
            {
              requestedAt: serverTimestamp(),
              emailVerified: Boolean(recoveryUser.emailVerified),
              verificationEmailSentAt: serverTimestamp(),
            }
          );
        } else {
          const existingProfile = profileSnapshot.data() || {};

          if (existingProfile.role !== 'client') {
            return { ok: false, error: 'Esse e-mail pertence a um administrador.' };
          }

          if (existingProfile.approvalStatus === APPROVAL_STATUS.APPROVED) {
            return { ok: false, error: 'Esse e-mail ja possui conta ativa. Use a tela de login.' };
          }

          await setDoc(
            doc(secondaryDb, 'users', recoveryUser.uid),
            {
              name,
              email,
              businessType,
              emailVerified: Boolean(recoveryUser.emailVerified),
              verificationEmailSentAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        return {
          ok: true,
          requiresApproval: true,
          message:
            'Encontramos um cadastro anterior com este e-mail. Reenviamos a verificacao e mantivemos seu cadastro em analise.',
        };
      } catch (recoveryError) {
        if (recoveryError?.code === 'auth/wrong-password' || recoveryError?.code === 'auth/invalid-credential') {
          return {
            ok: false,
            error:
              'Esse e-mail ja esta em uso. Se a conta for sua, use a senha original ou recupere o acesso antes de tentar novo cadastro.',
          };
        }
      }
    }

    if (createdUser) {
      try {
        await deleteUser(createdUser);
      } catch {
        // noop
      }
    }

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

export async function registerConsumerWithFirebase(form) {
  const { name, email, password } = form;

  if (!name || !email || !password) {
    return { ok: false, error: 'Preencha nome, e-mail e senha para criar sua conta.' };
  }

  let secondaryApp = null;
  let secondaryAuth = null;
  let secondaryDb = null;

  try {
    assertFirebaseReady();

    const secondaryContext = createSecondaryAuthApp(`public-consumer-${Date.now()}`);
    secondaryApp = secondaryContext.app;
    secondaryAuth = secondaryContext.auth;
    secondaryDb = secondaryContext.db;

    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);

    await sendEmailVerification(credential.user);

    await createConsumerProfile(
      secondaryDb,
      credential.user.uid,
      { name, email },
      {
        emailVerified: false,
        verificationEmailSentAt: serverTimestamp(),
      }
    );

    return {
      ok: true,
      message: 'Cadastro criado. Confirme seu e-mail para acessar a area do consumidor.',
    };
  } catch (error) {
    if (error?.code === 'auth/email-already-in-use' && secondaryAuth && secondaryDb) {
      try {
        const recovery = await signInWithEmailAndPassword(secondaryAuth, email, password);
        const recoveryUser = recovery.user;

        if (!recoveryUser.emailVerified) {
          await sendEmailVerification(recoveryUser);
        }

        const profileSnapshot = await getDoc(doc(secondaryDb, 'users', recoveryUser.uid));

        if (!profileSnapshot.exists()) {
          await createConsumerProfile(
            secondaryDb,
            recoveryUser.uid,
            { name, email },
            {
              emailVerified: Boolean(recoveryUser.emailVerified),
              verificationEmailSentAt: serverTimestamp(),
            }
          );
        } else {
          const existingProfile = profileSnapshot.data() || {};

          if (existingProfile.role && existingProfile.role !== 'consumer') {
            return { ok: false, error: 'Esse e-mail pertence a outro tipo de conta.' };
          }

          await setDoc(
            doc(secondaryDb, 'users', recoveryUser.uid),
            {
              name,
              email,
              emailVerified: Boolean(recoveryUser.emailVerified),
              verificationEmailSentAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        return {
          ok: true,
          message: 'Encontramos um cadastro anterior. Reenviamos a verificacao do e-mail.',
        };
      } catch (recoveryError) {
        if (recoveryError?.code === 'auth/wrong-password' || recoveryError?.code === 'auth/invalid-credential') {
          return {
            ok: false,
            error:
              'Esse e-mail ja esta em uso. Se a conta for sua, use a senha original ou recupere o acesso.',
          };
        }
      }
    }

    console.error('registerConsumerWithFirebase error:', error);
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

export async function sendPasswordResetWithFirebase(email) {
  if (!email) {
    return { ok: false, error: 'Informe o e-mail para recuperar a senha.' };
  }

  try {
    assertFirebaseReady();
    await sendPasswordResetEmail(auth, email);

    return {
      ok: true,
      message: 'Se existir uma conta com este e-mail, enviamos o link de redefinicao de senha.',
    };
  } catch (error) {
    if (error?.code === 'auth/user-not-found') {
      return {
        ok: true,
        message: 'Se existir uma conta com este e-mail, enviamos o link de redefinicao de senha.',
      };
    }

    return { ok: false, error: mapAuthError(error) };
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
      db,
      uid,
      { name, email, businessType },
      APPROVAL_STATUS.APPROVED,
      {
        approvedAt: serverTimestamp(),
        approvedBy: adminAccount.id,
        createdByAdminAt: serverTimestamp(),
        emailVerified: true,
      }
    );

    await signOut(secondaryAuth);
    await disposeFirebaseApp(secondaryApp);

    return {
      ok: true,
      account: toSessionAccount(
        uid,
        {
          role: 'client',
          name,
          email,
          businessType,
          approvalStatus: APPROVAL_STATUS.APPROVED,
        },
        true
      ),
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

      const normalizedRole = normalizeRole(profile.role);
      if (!normalizedRole) {
        await signOut(auth);
        onChange(null);
        return;
      }

      if (normalizedRole === 'client' || normalizedRole === 'consumer') {
        await reload(user);

        if (!user.emailVerified) {
          await signOut(auth);
          onChange(null);
          return;
        }

        if (normalizedRole === 'client' && profile.approvalStatus && profile.approvalStatus !== APPROVAL_STATUS.APPROVED) {
          await signOut(auth);
          onChange(null);
          return;
        }
      }

      onChange(toSessionAccount(user.uid, profile, user.emailVerified));
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


