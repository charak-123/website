import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Check, LogOut, MessageSquare } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth, authMessage } from '../context/AuthContext';
import { COUNTRIES, DIAL_BY_COUNTRY, PRIORITY_COUNTRIES } from '../data/countries';
import { INDIA_STATES, INDIA_UNION_TERRITORIES } from '../data/indiaStates';

export default function Register() {
  const navigate = useNavigate();
  const { user, ready, sendCode, confirmCode, signInWithGoogle, signOut } = useAuth();

  // Either route creates the account, so being signed in at all is what
  // clears step one — there is no separate sign-up.
  const verified = !!user;
  // Which identifier came back confirmed decides what step two still needs:
  // a Google account arrives with an address but no number, and vice versa.
  const viaPhone = !!user?.phoneNumber;
  const viaGoogle = !!user && !viaPhone;

  const [country, setCountry] = useState('India');
  const [dialCode, setDialCode] = useState('+91');
  const [phone, setPhone] = useState('');

  const [confirmation, setConfirmation] = useState(null);
  const [code, setCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [consent, setConsent] = useState(false);
  const [existing, setExisting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const [form, setForm] = useState({
    name: '',
    email: '',
    specialty: '',
    specialtyOther: '',
    city: '',
    state: '',
    pincode: '',
    experience: ''
  });
  const [channels, setChannels] = useState({ online: false, home: false });

  const inIndia = country === 'India';

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // A doctor who already registered should see their reference, not a blank
  // form. The rules only ever let someone read their own record.
  useEffect(() => {
    let cancelled = false;
    if (!verified) {
      setLoadingExisting(false);
      return undefined;
    }
    setLoadingExisting(true);
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'doctors', user.uid));
        if (!cancelled && snap.exists()) setExisting(true);
      } catch (err) {
        console.warn('Could not look up existing registration:', err.code);
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [verified, user]);

  const e164 = () => `+${dialCode.replace(/\D/g, '')}${phone.replace(/\D/g, '')}`;
  const phoneDigits = phone.replace(/\D/g, '');
  const dialDigits = dialCode.replace(/\D/g, '');
  const totalDigits = dialDigits.length + phoneDigits.length;
  // E.164: 7 digits minimum, 15 maximum, country code included.
  const phoneLooksValid = inIndia
    ? phoneDigits.length === 10
    : dialDigits.length >= 1 && totalDigits >= 7 && totalDigits <= 15;

  const changeCountry = (value) => {
    setCountry(value);
    setDialCode(`+${DIAL_BY_COUNTRY[value] || ''}`);
    // A state or PIN belonging to the old country means nothing now, and home
    // visits only exist where we have doctors on the ground.
    setForm((prev) => ({ ...prev, state: '', pincode: '' }));
    if (value !== 'India') setChannels({ online: true, home: false });
  };

  const continueWithGoogle = async () => {
    setOtpError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      // Closing the popup is a decision, not an error.
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.error('Google sign-in failed:', err.code, err.message);
        setOtpError(authMessage(err));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const requestCode = async () => {
    setOtpError('');
    if (!phoneLooksValid) {
      setOtpError(
        inIndia
          ? 'Please enter a valid 10-digit mobile number.'
          : 'Please enter a valid number, with its country calling code.'
      );
      return;
    }
    setSendingCode(true);
    try {
      const result = await sendCode(e164(), 'recaptcha-host');
      setConfirmation(result);
      setAttempts(0);
      setCooldown(30);
    } catch (err) {
      console.error('OTP send failed:', err.code, err.message);
      setOtpError(authMessage(err));
    } finally {
      setSendingCode(false);
    }
  };

  const submitCode = async () => {
    if (code.trim().length !== 6) {
      setOtpError('Please enter the 6-digit code we sent you.');
      return;
    }
    setCheckingCode(true);
    setOtpError('');
    try {
      await confirmCode(confirmation, code.trim());
      setConfirmation(null);
      setCode('');
    } catch (err) {
      console.error('OTP check failed:', err.code, err.message);
      const used = attempts + 1;
      setAttempts(used);
      // Three wrong codes and the confirmation is discarded, so a fresh SMS is
      // needed rather than letting someone sit and guess.
      if (used >= 3) {
        setConfirmation(null);
        setCode('');
        setOtpError('Too many incorrect attempts. Please request a new code.');
      } else {
        setOtpError(`${authMessage(err)} ${3 - used} attempt${used === 2 ? '' : 's'} left.`);
      }
    } finally {
      setCheckingCode(false);
    }
  };

  const update = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'specialty') {
      setForm({ ...form, specialty: value, specialtyOther: value === 'Other' ? form.specialtyOther : '' });
      return;
    }
    if (name === 'pincode' && inIndia) {
      setForm({ ...form, pincode: value.replace(/\D/g, '').slice(0, 6) });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const hasChannel = channels.online || channels.home;
  const needsSpecialtyDetail = form.specialty === 'Other' && !form.specialtyOther.trim();

  // Checked on trimmed values: `required` alone is satisfied by a single space.
  const validate = () => {
    const next = {};
    const name = form.name.trim();
    if (!name) next.name = 'Please enter your full name.';
    else if (name.length < 2) next.name = 'That name looks too short.';
    else if (name.length > 80) next.name = 'Please keep your name under 80 characters.';

    // Optional per the PRD, but it has to look like an address if given.
    const email = form.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      next.email = 'That does not look like a valid email address.';
    }

    // Phone-confirmed doctors already have a number on the account; Google
    // ones do not, and ops needs a way to reach them.
    if (viaGoogle) {
      if (!phone.trim()) next.phone = 'Please enter your mobile number.';
      else if (!phoneLooksValid) {
        next.phone = inIndia
          ? 'Please enter a valid 10-digit mobile number.'
          : 'Please enter a valid number, with its country calling code.';
      }
    }

    if (!form.specialty) next.specialty = 'Please choose your specialty.';
    if (needsSpecialtyDetail) next.specialtyOther = 'Please tell us which specialisation you practise.';

    const city = form.city.trim();
    if (!city) next.city = 'Please enter the city you practise in.';
    else if (city.length > 100) next.city = 'Please use a shorter city name.';

    const state = form.state.trim();
    if (!state) next.state = 'Please enter your state or region.';
    else if (state.length > 100) next.state = 'Please use a shorter name.';

    const pin = form.pincode.trim();
    if (inIndia) {
      if (!pin) next.pincode = 'Please enter your 6-digit PIN code.';
      else if (!/^[1-9][0-9]{5}$/.test(pin)) next.pincode = 'A PIN code is 6 digits, e.g. 411001.';
    } else if (pin.length > 12) {
      next.pincode = 'That postal code looks too long.';
    }

    const exp = form.experience.trim();
    if (exp && !/^\d{1,2}$/.test(exp)) next.experience = 'Enter years as a number, e.g. 8.';
    else if (exp && Number(exp) > 60) next.experience = 'Please enter 60 or fewer years.';

    if (!hasChannel) next.channels = 'Choose at least one channel.';
    if (!consent) next.consent = 'Please accept the Privacy Policy and Terms to continue.';
    return next;
  };

  const FIELD_TESTIDS = {
    name: 'doctor-full-name',
    email: 'doctor-email',
    phone: 'doctor-phone',
    specialty: 'doctor-specialty',
    specialtyOther: 'doctor-specialty-other',
    city: 'doctor-city',
    state: 'doctor-state',
    pincode: 'doctor-pincode',
    experience: 'doctor-experience',
    channels: 'channel-online',
    consent: 'doctor-consent'
  };

  if (!ready || (verified && loadingExisting)) {
    return (
      <div className="form-page container">
        <p className="auth-loading">Loading…</p>
      </div>
    );
  }

  if (existing) return <Navigate to="/register/success" replace />;

  const aside = (
    <div className="register-aside">
      <Link to="/" className="brand" aria-label="Charak" data-testid="register-brand-link">
        <img className="brand-mark" src="/images/charak-mark.png" alt="" width="34" height="39" />
        <span className="brand-word" lang="hi">चरक</span>
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
  );

  const steps = (
    <ol className="stepper" data-testid="stepper">
      <li className={verified ? 'is-done' : 'is-current'}>
        <span>{verified ? <Check size={12} /> : '1'}</span> Verify your number
      </li>
      <li className={verified ? 'is-current' : ''}>
        <span>2</span> Your details
      </li>
    </ol>
  );

  // ---- Stage 1: the number is the account -------------------------------
  if (!verified) {
    return (
      <div className="register-page">
        {aside}
        <div className="register-form-wrap">
          <div className="form-top">
            <span>STEP 1 OF 2</span>
            <Link to="/" data-testid="register-back-home">
              Back to home
            </Link>
          </div>
          {steps}

          <h2>Register as a Charak Doctor</h2>
          <p className="form-lead">
            Continue with Google, or confirm your mobile number. Either one becomes your login —
            there is no password to remember.
          </p>

          <div className="verify-card">
            {!confirmation && (
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
                <div className="account-divider"><span>or use your mobile</span></div>
              </>
            )}

            <label>
              Mobile number *
              <div className="phone-row">
                <input
                  className="dial-code"
                  type="tel"
                  inputMode="numeric"
                  value={dialCode}
                  disabled={!!confirmation}
                  onChange={(e) => setDialCode(`+${e.target.value.replace(/\D/g, '').slice(0, 4)}`)}
                  aria-label="Country calling code"
                  data-testid="doctor-dial-code"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder={inIndia ? 'XXXXXXXXXX' : 'Number without the country code'}
                  value={phone}
                  disabled={!!confirmation}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^\d\s-]/g, ''));
                    if (otpError) setOtpError('');
                  }}
                  data-testid="doctor-phone"
                />
              </div>
              <small className="field-hint">
                {inIndia ? '10-digit mobile number.' : 'Without the leading zero.'}
              </small>
            </label>

            {!confirmation ? (
              <button
                type="button"
                className="button button-dark full"
                onClick={requestCode}
                disabled={sendingCode || cooldown > 0}
                data-testid="send-otp"
              >
                <MessageSquare size={15} />
                {sendingCode ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send me a code'}
              </button>
            ) : (
              <div className="otp-box" data-testid="otp-box">
                <p className="otp-lead">
                  Enter the 6-digit code we sent to <b>{e164()}</b>.
                </p>
                <div className="otp-row">
                  <input
                    className="otp-input"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      if (otpError) setOtpError('');
                    }}
                    data-testid="otp-code"
                  />
                  <button
                    type="button"
                    className="button button-dark"
                    onClick={submitCode}
                    disabled={checkingCode}
                    data-testid="confirm-otp"
                  >
                    {checkingCode ? 'Checking…' : 'Confirm'}
                  </button>
                </div>
                <div className="otp-actions">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={requestCode}
                    disabled={cooldown > 0 || sendingCode}
                    data-testid="resend-otp"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Send a new code'}
                  </button>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setConfirmation(null);
                      setCode('');
                      setOtpError('');
                    }}
                    data-testid="change-number"
                  >
                    Change number
                  </button>
                </div>
              </div>
            )}

            {otpError && (
              <small className="field-error" role="alert" data-testid="otp-error">
                {otpError}
              </small>
            )}

            <div id="recaptcha-host" />

            <p className="verify-foot">
              Already registered? Signing in the same way brings up your registration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Stage 2: the details ---------------------------------------------
  return (
    <div className="register-page">
      {aside}
      <div className="register-form-wrap">
        <div className="form-top">
          <span>STEP 2 OF 2</span>
          <Link to="/" data-testid="register-back-home">
            Back to home
          </Link>
        </div>
        {steps}

        <div className="signed-in-bar" data-testid="signed-in-bar">
          <span className="account-badge">
            <Check size={13} /> {viaPhone ? 'Number confirmed' : 'Signed in with Google'}
          </span>
          <b>{user.phoneNumber || user.email}</b>
          <button type="button" className="link-btn" onClick={() => signOut()} data-testid="register-sign-out">
            <LogOut size={12} /> Sign out
          </button>
        </div>

        <h2>Your details</h2>
        <p className="form-lead">
          Takes ~2 minutes. This pre-fills your app profile when the app launches.
        </p>

        <form
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            if (submitting) return;
            const found = validate();
            setErrors(found);
            const firstBad = Object.keys(found)[0];
            if (firstBad) {
              setError('');
              const el = document.querySelector(`[data-testid="${FIELD_TESTIDS[firstBad]}"]`);
              el?.focus();
              el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
              return;
            }
            setSubmitting(true);
            setError('');
            try {
              const reference = `CHR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
              // Keyed by uid so one account cannot register twice. Field names
              // mirror the app's schema so launch is a status change, not a
              // migration (PRD §6.3, §8).
              await setDoc(doc(db, 'doctors', user.uid), {
                name: form.name.trim(),
                // For a phone account this is the number Firebase confirmed,
                // never what a field says; a Google account supplies its own.
                phone: user.phoneNumber || e164(),
                phoneVerified: viaPhone,
                email: user.email || form.email.trim(),
                emailVerified: viaGoogle,
                specialty: form.specialty,
                specialtyOther: form.specialty === 'Other' ? form.specialtyOther.trim() : '',
                country,
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim(),
                experience: form.experience.trim(),
                channels,
                verification_status: 'pending',
                source: 'website',
                consent_at: serverTimestamp(),
                authMethod: viaPhone ? 'phone' : 'google',
                reference,
                uid: user.uid,
                createdAt: serverTimestamp()
              });
              navigate('/register/success', {
                replace: true,
                state: { reference, name: form.name.trim() }
              });
            } catch (err) {
              console.error('Registration submit failed:', err.code, err.message);
              setError(
                err.code === 'permission-denied'
                  ? 'Your session needs a refresh. Please sign out, confirm your number again, and resubmit.'
                  : 'Could not submit registration. Please check your connection and try again.'
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="form-grid">
            <label>
              Country of practice *
              <select
                value={country}
                onChange={(e) => changeCountry(e.target.value)}
                data-testid="doctor-country"
              >
                {PRIORITY_COUNTRIES.map((name) => (
                  <option key={`top-${name}`} value={name}>
                    {name}
                  </option>
                ))}
                <option disabled>──────────</option>
                {COUNTRIES.map(({ name }) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Full name *
              <input
                name="name"
                placeholder="Dr. Full Name"
                value={form.name}
                onChange={update}
                data-testid="doctor-full-name"
              />
              {errors.name && <small className="field-error" role="alert">{errors.name}</small>}
            </label>

            {viaGoogle ? (
              <label>
                Mobile number *
                <div className="phone-row">
                  <input
                    className="dial-code"
                    type="tel"
                    inputMode="numeric"
                    value={dialCode}
                    onChange={(e) => setDialCode(`+${e.target.value.replace(/\D/g, '').slice(0, 4)}`)}
                    aria-label="Country calling code"
                    data-testid="doctor-dial-code"
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder={inIndia ? 'XXXXXXXXXX' : 'Number without the country code'}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/[^\d\s-]/g, ''));
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    data-testid="doctor-phone"
                  />
                </div>
                {errors.phone && <small className="field-error" role="alert">{errors.phone}</small>}
              </label>
            ) : (
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Optional, for updates"
                  value={form.email}
                  onChange={update}
                  data-testid="doctor-email"
                />
                {errors.email && <small className="field-error" role="alert">{errors.email}</small>}
              </label>
            )}

            <label>
              Specialty / Category *
              <select
                name="specialty"
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
              {errors.specialty && <small className="field-error" role="alert">{errors.specialty}</small>}
            </label>

            {form.specialty === 'Other' && (
              <label>
                Which specialisation? *
                <input
                  name="specialtyOther"
                  maxLength={80}
                  placeholder="e.g., Ophthalmology"
                  value={form.specialtyOther}
                  onChange={update}
                  data-testid="doctor-specialty-other"
                />
                {errors.specialtyOther && (
                  <small className="field-error" role="alert">{errors.specialtyOther}</small>
                )}
              </label>
            )}

            <label>
              City *
              <input
                name="city"
                placeholder="Your city"
                value={form.city}
                onChange={update}
                data-testid="doctor-city"
              />
              {errors.city && <small className="field-error" role="alert">{errors.city}</small>}
            </label>

            <label>
              {inIndia ? 'State / Union Territory *' : 'State / Region *'}
              {inIndia ? (
                <select name="state" value={form.state} onChange={update} data-testid="doctor-state">
                  <option value="">Select state</option>
                  <optgroup label="States">
                    {INDIA_STATES.map((st) => (
                      <option key={st}>{st}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Union Territories">
                    {INDIA_UNION_TERRITORIES.map((ut) => (
                      <option key={ut}>{ut}</option>
                    ))}
                  </optgroup>
                </select>
              ) : (
                <input
                  name="state"
                  placeholder="e.g., Dubai"
                  value={form.state}
                  onChange={update}
                  data-testid="doctor-state"
                />
              )}
              {errors.state && <small className="field-error" role="alert">{errors.state}</small>}
            </label>

            <label>
              {inIndia ? 'PIN code *' : 'Postal code'}
              <input
                name="pincode"
                inputMode="numeric"
                maxLength={inIndia ? 6 : 12}
                autoComplete="postal-code"
                placeholder={inIndia ? '411001' : 'Optional'}
                value={form.pincode}
                onChange={update}
                data-testid="doctor-pincode"
              />
              {errors.pincode && <small className="field-error" role="alert">{errors.pincode}</small>}
            </label>

            <label>
              Years of experience
              <input
                name="experience"
                inputMode="numeric"
                placeholder="e.g., 8"
                value={form.experience}
                onChange={update}
                data-testid="doctor-experience"
              />
              {errors.experience && <small className="field-error" role="alert">{errors.experience}</small>}
            </label>
          </div>

          <div className="channel-box">
            <b>Preferred channels *</b>
            <p>{inIndia ? 'Choose one or both' : 'Outside India we onboard doctors for online consultations only'}</p>
            <label className="check-label">
              <input
                type="checkbox"
                checked={channels.online}
                onChange={(e) => {
                  setChannels({ ...channels, online: e.target.checked });
                  if (errors.channels) setErrors((prev) => ({ ...prev, channels: '' }));
                }}
                data-testid="channel-online"
              />
              Online Consult
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={channels.home}
                disabled={!inIndia}
                onChange={(e) => {
                  setChannels({ ...channels, home: e.target.checked });
                  if (errors.channels) setErrors((prev) => ({ ...prev, channels: '' }));
                }}
                data-testid="channel-home"
              />
              Home Visit{!inIndia && ' (India only)'}
            </label>
            {errors.channels && <small className="field-error" role="alert">{errors.channels}</small>}
          </div>

          <label className="check-label consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (errors.consent) setErrors((prev) => ({ ...prev, consent: '' }));
              }}
              data-testid="doctor-consent"
            />{' '}
            I agree to the <Link to="/privacy">Privacy Policy</Link> and Terms and consent to Charak
            processing my data.
          </label>
          {errors.consent && (
            <small className="field-error consent-error" role="alert">{errors.consent}</small>
          )}

          <button
            className="button button-dark full submit-btn"
            type="submit"
            disabled={submitting}
            data-testid="submit-doctor-registration"
          >
            {submitting ? 'Submitting…' : <>Submit Registration <ArrowRight size={16} /></>}
          </button>

          {error && (
            <small className="account-error" role="alert" data-testid="account-error">
              {error}
            </small>
          )}
        </form>
      </div>
    </div>
  );
}
