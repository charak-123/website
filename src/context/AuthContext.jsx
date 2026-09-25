import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase';

// Firebase error codes are not something a doctor should ever read.
export function authMessage(err) {
  switch (err?.code) {
    case 'auth/invalid-phone-number':
      return 'That phone number does not look valid. Check the country code and try again.';
    case 'auth/missing-phone-number':
      return 'Please enter your phone number.';
    case 'auth/invalid-verification-code':
      return 'That code is not right. Check the SMS and try again.';
    case 'auth/code-expired':
      return 'That code has expired. Please request a new one.';
    case 'auth/missing-verification-code':
      return 'Please enter the 6-digit code we sent you.';
    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Please wait a few minutes and try again.';
    case 'auth/quota-exceeded':
      return 'We cannot send any more codes right now. Please try again later.';
    case 'auth/captcha-check-failed':
      return 'The security check failed. Please reload the page and try again.';
    case 'auth/network-request-failed':
      return 'Network problem. Check your connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'Phone sign-in is not enabled for this project yet.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorised for sign-in yet. Please contact support.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the popup. Allow popups for this site and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'That email is already on a Charak account created another way.';
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

  useEffect(() => {
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setReady(true);
    });
  }, []);

  // Sending a code is how a doctor both signs up and signs back in: Firebase
  // creates the account on first confirmation and returns the existing one
  // afterwards, so there is no separate registration step to get out of sync.
  const sendCode = useCallback(async (e164, containerId) => {
    // reCAPTCHA is required for every SMS, and a verifier is single-use, so
    // build a fresh one per attempt and tear it down if the send fails.
    const verifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
    try {
      await verifier.render();
      return await signInWithPhoneNumber(auth, e164, verifier);
    } catch (err) {
      verifier.clear();
      throw err;
    }
  }, []);

  // Google hands us an address it has already verified, so those doctors skip
  // the SMS step entirely.
  const signInWithGoogle = useCallback(() => signInWithPopup(auth, new GoogleAuthProvider()), []);

  const confirmCode = useCallback(async (confirmation, code) => {
    const { user: signedIn } = await confirmation.confirm(code);
    return signedIn;
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      phone: user?.phoneNumber || '',
      sendCode,
      confirmCode,
      signInWithGoogle,
      signOut: () => signOut(auth)
    }),
    [user, ready, sendCode, confirmCode, signInWithGoogle]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
