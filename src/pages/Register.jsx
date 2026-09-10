import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Register() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    specialty: '',
    city: '',
    experience: ''
  });
  const [channels, setChannels] = useState({
    online: false,
    home: false
  });

  const createAccount = async () => {
    if (!form.email || !password) return;
    setAccountError('');
    setCreatingAccount(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, password);
      await sendEmailVerification(cred.user);
      setAuthMethod('email');
      setVerified(true);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setAccountError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setAccountError('Password should be at least 6 characters.');
      } else {
        setAccountError('Could not create account. Please try again.');
      }
    } finally {
      setCreatingAccount(false);
    }
  };

  const continueWithGoogle = async () => {
    setAccountError('');
    setGoogleLoading(true);
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
      setForm((prev) => ({
        ...prev,
        email: user.email || prev.email,
        name: prev.name || user.displayName || ''
      }));
      setAuthMethod('google');
      setVerified(true);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setAccountError('');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setAccountError('This email is already registered with a password. Use email sign-up instead.');
      } else {
        setAccountError('Could not sign in with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const update = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  const hasChannel = channels.online || channels.home;
  const displayName = (form.name || 'there').replace(/^dr\.?\s*/i, '');

  if (sent) {
    return (
      <div className="form-page container">
        <div className="form-success">
          <span className="success-icon">
            <Check />
          </span>
          <div className="eyebrow">REGISTRATION RECEIVED</div>
          <h1>
            Welcome to the
            <br />
            <em>Charak network.</em>
          </h1>
          <p>
            Thank you, Dr. <span>{displayName}</span>. Your reference ID is{' '}
            <b>CHR-24A81F</b>. Our team will verify your documents within 24–48 hours and contact you on the same number.
          </p>
          <button
            className="button button-dark"
            onClick={() => navigate('/')}
            data-testid="registration-success-home"
          >
            Back to Home <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-aside">
        <Link to="/" className="brand" data-testid="register-brand-link">
          <span className="brand-mark">
            <HeartPulse size={18} />
          </span>
          CHARAK
        </Link>
        <div>
          <div className="eyebrow">DOCTOR ONBOARDING</div>
          <div className="aside-script">सेवा से जुड़ें</div>
          <h1>
            Make care
            <br />
            <em>more human.</em>
          </h1>
          <p>Join a verified network built around the way you practice.</p>
        </div>
        <span className="aside-note">
          <ShieldCheck size={16} /> Your information is handled with care
        </span>
      </div>

      <div className="register-form-wrap">
        <div className="form-top">
          <span>01 / YOUR DETAILS</span>
          <Link to="/" data-testid="register-back-home">
            Back to home
          </Link>
        </div>
        <h2>Register as a Charak Doctor</h2>
        <p className="form-lead">
          Takes ~3 minutes. Your data will pre-fill your app profile when the app launches.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!(verified && hasChannel) || submitting) return;
            setSubmitting(true);
            try {
              await addDoc(collection(db, 'doctors'), {
                ...form,
                channels,
                authMethod,
                uid: auth.currentUser?.uid || null,
                createdAt: serverTimestamp()
              });
              setSent(true);
            } catch (err) {
              setAccountError('Could not submit registration. Please try again.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="form-grid">
            <label>
              Full name *
              <input
                name="name"
                required
                placeholder="Dr. Full Name"
                value={form.name}
                onChange={update}
                data-testid="doctor-full-name"
              />
            </label>

            <label>
              Phone number *
              <div className="phone-row">
                <span>+91</span>
                <input
                  name="phone"
                  required
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={update}
                  data-testid="doctor-phone"
                />
              </div>
            </label>

            <label>
              Specialty / Category *
              <select
                name="specialty"
                required
                value={form.specialty}
                onChange={update}
                data-testid="doctor-specialty"
              >
                <option value="">Select specialty</option>
                <option>General Physician</option>
                <option>Ayurveda</option>
                <option>Orthopedic</option>
                <option>Cardiology</option>
                <option>Dermatology</option>
                <option>Gynecology</option>
                <option>Pediatrics</option>
                <option>Dentistry</option>
                <option>Physiotherapy</option>
                <option>Nurse</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              City *
              <input
                name="city"
                required
                placeholder="Your city"
                value={form.city}
                onChange={update}
                data-testid="doctor-city"
              />
            </label>

            <label>
              Years of experience
              <input
                name="experience"
                placeholder="e.g., 8"
                value={form.experience}
                onChange={update}
                data-testid="doctor-experience"
              />
            </label>
          </div>

          <div className={`account-box ${verified ? 'is-done' : ''}`}>
            <div className="account-box-head">
              <span className="eyebrow">02 / ACCOUNT ACCESS</span>
              {verified && (
                <span className="account-badge" data-testid="create-account-button">
                  <Check size={13} /> {authMethod === 'google' ? 'Signed in with Google' : 'Account created'}
                </span>
              )}
            </div>
            <p className="account-lead">
              {verified
                ? authMethod === 'google'
                  ? 'Signed in with Google. You can finish your registration below.'
                  : 'We’ve sent a verification link to your email. You can finish your registration below.'
                : 'Create your login so you can access your Charak profile when the app launches.'}
            </p>

            {!verified && (
              <>
                <button
                  type="button"
                  className="google-btn"
                  onClick={continueWithGoogle}
                  disabled={googleLoading}
                  data-testid="google-signin-button"
                >
                  <svg viewBox="0 0 18 18" width="17" height="17" aria-hidden="true">
                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
                    <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
                  </svg>
                  {googleLoading ? 'Opening Google…' : 'Continue with Google'}
                </button>
                <div className="account-divider"><span>or use your email</span></div>
              </>
            )}

            <div className="account-fields">
              <label>
                Email address *
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@hospital.com"
                  value={form.email}
                  onChange={update}
                  disabled={verified}
                  data-testid="doctor-email"
                />
              </label>

              {authMethod !== 'google' && (
                <label>
                  Create password *
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={verified}
                    data-testid="doctor-password"
                  />
                </label>
              )}
            </div>

            {!verified && (
              <button
                type="button"
                className="button button-light account-btn"
                onClick={createAccount}
                disabled={!form.email || !password || creatingAccount}
                data-testid="create-account-button"
              >
                {creatingAccount ? 'Creating your account…' : <>Create account <ArrowRight size={15} /></>}
              </button>
            )}

            {accountError && (
              <small className="account-error" data-testid="account-error">
                {accountError}
              </small>
            )}
          </div>

          <div className="channel-box">
            <b>Preferred channels *</b>
            <p>Choose one or both</p>
            <label className="check-label">
              <input
                type="checkbox"
                checked={channels.online}
                onChange={(e) =>
                  setChannels({
                    ...channels,
                    online: e.target.checked
                  })
                }
                data-testid="channel-online"
              />
              Online Consult
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={channels.home}
                onChange={(e) =>
                  setChannels({
                    ...channels,
                    home: e.target.checked
                  })
                }
                data-testid="channel-home"
              />
              Home Visit
            </label>
          </div>

          <label className="check-label consent">
            <input type="checkbox" required data-testid="doctor-consent" /> I agree to the{' '}
            <Link to="/privacy">Privacy Policy</Link> and Terms and consent to Charak processing my data.
          </label>

          <button
            className="button button-dark full submit-btn"
            type="submit"
            disabled={!(verified && hasChannel) || submitting}
            data-testid="submit-doctor-registration"
          >
            {submitting ? 'Submitting…' : <>Submit Registration <ArrowRight size={16} /></>}
          </button>

          {!verified && (
            <small className="submit-hint" data-testid="phone-verification-hint">
              Create your account above to enable submission.
            </small>
          )}
        </form>
      </div>
    </div>
  );
}
