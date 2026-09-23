import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase';

// Where Firebase sends people after they click a link in one of our emails.
// The domain has to be listed under Authentication -> Settings -> Authorized
// domains; window.location.origin keeps the link on localhost during dev.
const actionSettings = () => ({
  url: `${window.location.origin}/register`,
  handleCodeInApp: false
});

// Firebase error codes are not something a doctor should ever read.
export function authMessage(err) {
  switch (err?.code) {
    case 'auth/email-already-in-use':
      return 'That email already has an account. Sign in instead.';
    case 'auth/invalid-email':
      return 'That does not look like a valid email address.';
    case 'auth/weak-password':
      return 'Please use a password of at least 6 characters.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    // Newer projects collapse wrong-password / no-such-user into one code so
    // the form cannot be used to discover who has an account.
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect. Try again, or reset your password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network problem. Check your connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'That sign-in method is not enabled for this project yet.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the popup. Allow popups for this site and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'This email already has a password login. Sign in with your password instead.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorised for sign-in yet. Please contact support.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `ready` stays false until Firebase has restored any existing session, so
  // pages never flash "signed out" at someone who is actually signed in.
  const [ready, setReady] = useState(false);
  // reload() mutates the same User object in place, so a counter is what
  // actually tells React that emailVerified changed.
  const [stamp, setStamp] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setReady(true);
    });
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { user: created } = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(created, actionSettings());
    return created;
  }, []);

  const signIn = useCallback((email, password) => signInWithEmailAndPassword(auth, email, password), []);

  const resendVerification = useCallback(() => sendEmailVerification(auth.currentUser, actionSettings()), []);

  const resetPassword = useCallback((email) => sendPasswordResetEmail(auth, email, actionSettings()), []);

  // Google hands us an already-verified address, so these accounts skip the
  // confirmation step entirely.
  const signInWithGoogle = useCallback(() => signInWithPopup(auth, new GoogleAuthProvider()), []);

  // Called after someone clicks the confirmation link in another tab.
  // emailVerified lives in the ID token, so the token has to be refreshed or
  // the Firestore rules keep seeing the stale `false`.
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    setStamp((n) => n + 1);
    return auth.currentUser.emailVerified;
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isVerified: !!user?.emailVerified,
      signUp,
      signIn,
      signOut: () => signOut(auth),
      resendVerification,
      resetPassword,
      signInWithGoogle,
      refreshUser
    }),
    // `stamp` is here so a reload() that flips emailVerified re-renders
    // consumers; every helper below it is stable.
    [user, ready, stamp, signUp, signIn, resendVerification, resetPassword, signInWithGoogle, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
