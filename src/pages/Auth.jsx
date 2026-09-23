import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, MailCheck, ShieldCheck } from 'lucide-react';
import { useAuth, authMessage } from '../context/AuthContext';

// Only same-site paths are honoured, so a crafted ?next= cannot bounce
// someone off to another domain after they sign in.
// Google sign-in stays hidden until the custom domain is live and OAuth
// branding is verified — until then the consent screen shows a raw
// firebaseapp.com domain with no Charak branding. The flow below works;
// flip this to true once the domain is verified.
const GOOGLE_SIGN_IN_ENABLED = false;

const safeNext = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/register');

export default function Auth({ mode: initialMode = 'signin' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    ready,
    isVerified,
    signIn,
    signUp,
    signOut,
    resendVerification,
    resetPassword,
    signInWithGoogle,
    refreshUser
  } = useAuth();

  const next = safeNext(new URLSearchParams(location.search).get('next'));

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Signed in and confirmed — nothing to do on this page.
  useEffect(() => {
    if (ready && user && isVerified) navigate(next, { replace: true });
  }, [ready, user, isVerified, next, navigate]);

  // Someone may land here from the confirmation link in a tab that still
  // holds the old, unverified token. Ask Firebase once on mount.
  useEffect(() => {
    if (ready && user && !isVerified) refreshUser().catch(() => {});
  }, [ready, user, isVerified, refreshUser]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'reset') {
        await resetPassword(email.trim());
        setNotice(`If an account exists for ${email.trim()}, a reset link is on its way.`);
      } else if (mode === 'signup') {
        await signUp(email.trim(), password);
      } else {
        // The verify panel takes over on its own if the address is unconfirmed.
        await signIn(email.trim(), password);
      }
    } catch (err) {
      console.error(`${mode} failed:`, err.code, err.message);
      setError(authMessage(err));
      // Point people at the door they actually need instead of a dead end.
      if (err.code === 'auth/email-already-in-use') setMode('signin');
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="auth-page">
        <div className="auth-card" data-testid="auth-loading">
          <p className="auth-loading">Checking your session…</p>
        </div>
      </div>
    );
  }

  // Signed in, email not confirmed yet.
  if (user && !isVerified) {
    return (
      <div className="auth-page">
        <div className="auth-card" data-testid="auth-verify-panel">
          <span className="auth-icon"><MailCheck size={20} /></span>
          <p className="eyebrow">ONE LAST STEP</p>
          <h1>Confirm your email</h1>
          <p className="auth-lead">
            We sent a confirmation link to <b>{user.email}</b>. Open it, then come back and continue.
          </p>

          <p className="spam-notice">
            <strong>Not in your inbox?</strong> Check spam or promotions — the email comes from{' '}
            <code>noreply@charak-website.firebaseapp.com</code>. Marking it “not spam” helps our later
            emails reach you.
          </p>

          <button
            className="button button-dark full"
            disabled={busy}
            data-testid="auth-check-verification"
            onClick={async () => {
              setBusy(true);
              setError('');
              setNotice('');
              try {
                const ok = await refreshUser();
                if (!ok) setError('Not confirmed yet. Open the link in the email, then try again.');
              } catch (err) {
                setError(authMessage(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Checking…' : <>I&rsquo;ve confirmed my email <ArrowRight size={16} /></>}
          </button>

          <div className="auth-alt-row">
            <button
              type="button"
              className="link-btn"
              data-testid="auth-resend-verification"
              onClick={async () => {
                setError('');
                try {
                  await resendVerification();
                  setNotice('Sent again — it can take a minute to arrive.');
                } catch (err) {
                  setError(authMessage(err));
                }
              }}
            >
              Resend the email
            </button>
            <button
              type="button"
              className="link-btn"
              data-testid="auth-sign-out"
              onClick={() => signOut()}
            >
              Use a different email
            </button>
          </div>

          {notice && <p className="auth-notice" role="status" data-testid="auth-notice">{notice}</p>}
          {error && <p className="auth-error" role="alert" data-testid="auth-error">{error}</p>}
        </div>
      </div>
    );
  }

  const isReset = mode === 'reset';
  const isSignup = mode === 'signup';

  return (
    <div className="auth-page">
      <div className="auth-card" data-testid="auth-card">
        <Link to="/" className="brand auth-brand" aria-label="Charak">
          <img className="brand-mark" src="/images/charak-mark.png" alt="" width="30" height="34" />
          <span className="brand-word" lang="hi">चरक</span>
        </Link>

        {isReset ? (
          <>
            <p className="eyebrow">PASSWORD RESET</p>
            <h1>Reset your password</h1>
            <p className="auth-lead">
              Enter the email you registered with and we&rsquo;ll send you a link to set a new password.
            </p>
          </>
        ) : (
          <>
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                className={!isSignup ? 'is-active' : ''}
                onClick={() => switchMode('signin')}
                data-testid="auth-tab-signin"
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                className={isSignup ? 'is-active' : ''}
                onClick={() => switchMode('signup')}
                data-testid="auth-tab-signup"
              >
                Create account
              </button>
            </div>
            <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
            <p className="auth-lead">
              {isSignup
                ? 'One login for your Charak doctor profile. It takes a minute.'
                : 'Sign in to continue your doctor registration or update your details.'}
            </p>
          </>
        )}

        {GOOGLE_SIGN_IN_ENABLED && !isReset && (
          <>
            <button
              type="button"
              className="google-btn"
              disabled={busy}
              data-testid="auth-google"
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  await signInWithGoogle();
                } catch (err) {
                  // Closing the popup is a decision, not an error.
                  if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                    console.error('Google sign-in failed:', err.code, err.message);
                    setError(authMessage(err));
                  }
                } finally {
                  setBusy(false);
                }
              }}
            >
              <svg viewBox="0 0 18 18" width="17" height="17" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
              </svg>
              Continue with Google
            </button>
            <div className="account-divider"><span>or use your email</span></div>
          </>
        )}

        <form onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="name@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="auth-email"
            />
          </label>

          {!isReset && (
            <label>
              {isSignup ? 'Create a password' : 'Password'}
              <span className="auth-password">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="auth-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-testid="auth-toggle-password"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
          )}

          <button
            className="button button-dark full"
            type="submit"
            disabled={busy}
            data-testid="auth-submit"
          >
            {busy
              ? 'Please wait…'
              : isReset
                ? <>Send reset link <ArrowRight size={16} /></>
                : isSignup
                  ? <>Create account <ArrowRight size={16} /></>
                  : <>Sign in <ArrowRight size={16} /></>}
          </button>
        </form>

        {notice && <p className="auth-notice" role="status" data-testid="auth-notice">{notice}</p>}
        {error && <p className="auth-error" role="alert" data-testid="auth-error">{error}</p>}

        <div className="auth-foot">
          {isReset ? (
            <button type="button" className="link-btn" onClick={() => switchMode('signin')}>
              Back to sign in
            </button>
          ) : isSignup ? (
            <span>
              Already registered?{' '}
              <button type="button" className="link-btn" onClick={() => switchMode('signin')} data-testid="auth-go-signin">
                Sign in
              </button>
            </span>
          ) : (
            <>
              <button type="button" className="link-btn" onClick={() => switchMode('reset')} data-testid="auth-forgot">
                Forgot your password?
              </button>
              <span>
                New here?{' '}
                <button type="button" className="link-btn" onClick={() => switchMode('signup')} data-testid="auth-go-signup">
                  Create an account
                </button>
              </span>
            </>
          )}
        </div>

        <p className="auth-note">
          <ShieldCheck size={14} /> Your details are handled per our{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
