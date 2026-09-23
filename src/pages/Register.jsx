import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Check, LogOut } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, DIAL_BY_COUNTRY, PRIORITY_COUNTRIES } from '../data/countries';

export default function Register() {
  const navigate = useNavigate();
  const { user, ready, isVerified, signOut } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  // A doctor who forgot whether they already registered should be told, not
  // left guessing. Rules only let someone read their own record.
  const [existing, setExisting] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [form, setForm] = useState({
    name: '',
    dialCode: '+91',
    phone: '',
    specialty: '',
    specialtyOther: '',
    country: 'India',
    city: '',
    state: '',
    experience: ''
  });
  const [channels, setChannels] = useState({ online: false, home: false });

  useEffect(() => {
    let cancelled = false;
    if (!user || !isVerified) {
      setLoadingExisting(false);
      return undefined;
    }
    // Auth resolves after the first render, so the lookup starts late — go
    // back to loading rather than flashing an empty form at someone who has
    // already registered.
    setLoadingExisting(true);
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'doctors', user.uid));
        if (!cancelled && snap.exists()) setExisting(true);
      } catch (err) {
        // Older rule sets deny reads outright; that is not a reason to block
        // a fresh registration, so fail quiet.
        console.warn('Could not look up existing registration:', err.code);
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isVerified]);

  const update = (e) => {
    const { name, value } = e.target;
    if (name === 'country') {
      const india = value === 'India';
      setForm({
        ...form,
        country: value,
        // The dial code follows the country the doctor practises in; they can
        // still override it below for a number registered elsewhere.
        dialCode: `+${DIAL_BY_COUNTRY[value] || ''}`
      });
      // Home visits only exist where we have doctors on the ground.
      if (!india) setChannels({ online: true, home: false });
      return;
    }
    if (name === 'specialty') {
      // Clear the free-text detail when they move off "Other".
      setForm({ ...form, specialty: value, specialtyOther: value === 'Other' ? form.specialtyOther : '' });
      return;
    }
    if (name === 'dialCode') {
      // Allow a leading + and digits only.
      setForm({ ...form, dialCode: `+${value.replace(/\D/g, '').slice(0, 4)}` });
      return;
    }
    if (name === 'phone') {
      setForm({ ...form, phone: value.replace(/[^\d\s-]/g, '') });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const inIndia = form.country === 'India';
  const hasChannel = channels.online || channels.home;

  // Phone is the join key between this site and the app (PRD §8): the app
  // logs doctors in by phone OTP and pre-fills the profile from this record,
  // so it has to be stored in one canonical E.164 form.
  const e164 = () => {
    const dial = `+${form.dialCode.replace(/\D/g, '')}`;
    return `${dial}${form.phone.replace(/\D/g, '')}`;
  };
  const phoneDigits = form.phone.replace(/\D/g, '');
  const dialDigits = form.dialCode.replace(/\D/g, '');
  // E.164 allows at most 15 digits in total, country code included.
  // E.164: 7 digits minimum, 15 maximum, country code included. The security
  // rules enforce the same bounds, so keep the two in step or a short number
  // fails server-side with an opaque permission error.
  const totalDigits = dialDigits.length + phoneDigits.length;
  const phoneLooksValid = inIndia
    ? phoneDigits.length === 10
    : dialDigits.length >= 1 && totalDigits >= 7 && totalDigits <= 15;
  const needsSpecialtyDetail = form.specialty === 'Other' && !form.specialtyOther.trim();

  // Not signed in, or the address is not confirmed yet — the account step is
  // its own page now.
  if (ready && (!user || !isVerified)) return <Navigate to="/signin?next=/register" replace />;

  // Already on file — the confirmation page shows them their reference ID
  // rather than a blank form they would fill in a second time.
  if (existing) return <Navigate to="/register/success" replace />;

  if (!ready || loadingExisting) {
    return (
      <div className="form-page container">
        <p className="auth-loading">Loading your registration…</p>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-aside">
        <Link to="/" className="brand" aria-label="Charak" data-testid="register-brand-link">
          <img
            className="brand-mark"
            src="/images/charak-mark.png"
            alt=""
            width="34"
            height="39"
          />
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

      <div className="register-form-wrap">
        <div className="form-top">
          <span>YOUR DETAILS</span>
          <Link to="/" data-testid="register-back-home">
            Back to home
          </Link>
        </div>

        <div className="signed-in-bar" data-testid="signed-in-bar">
          <span className="account-badge">
            <Check size={13} /> Signed in
          </span>
          <b>{user.email}</b>
          <button type="button" className="link-btn" onClick={() => signOut()} data-testid="register-sign-out">
            <LogOut size={12} /> Sign out
          </button>
        </div>

        <h2>Register as a Charak Doctor</h2>
        <p className="form-lead">
          Takes ~3 minutes. Your data will pre-fill your app profile when the app launches.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!hasChannel || !consent || submitting) return;
            if (needsSpecialtyDetail) {
              setError('Please tell us which specialisation you practise.');
              return;
            }
            if (!phoneLooksValid) {
              setError(
                inIndia
                  ? 'Please enter a valid 10-digit mobile number.'
                  : 'Please enter a valid phone number with its country code.'
              );
              return;
            }
            setSubmitting(true);
            setError('');
            try {
              const reference = `CHR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
              // One record per account, keyed by uid — a second submission from
              // the same login cannot create a duplicate.
              // Field names mirror the app's own schema so launch is a status
              // change, not a migration (PRD §6.3, §8).
              await setDoc(doc(db, 'doctors', user.uid), {
                name: form.name.trim(),
                phone: e164(),
                phoneLocal: form.phone.trim(),
                dialCode: form.dialCode,
                email: user.email,
                specialty: form.specialty,
                // "Other" keeps the canonical value and carries the doctor's
                // own wording alongside it, so ops can fold it into the
                // category list later without losing what they typed.
                specialtyOther: form.specialty === 'Other' ? form.specialtyOther.trim() : '',
                country: form.country,
                city: form.city.trim(),
                state: form.state.trim(),
                experience: form.experience.trim(),
                channels,
                verification_status: 'pending',
                source: 'website',
                consent_at: serverTimestamp(),
                authMethod: user.providerData[0]?.providerId || 'password',
                reference,
                emailVerified: true,
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
                  ? 'Your session needs a refresh. Please sign out, sign in again, and resubmit.'
                  : 'Could not submit registration. Please check your connection and try again.'
              );
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
                <input
                  className="dial-code"
                  name="dialCode"
                  required
                  type="tel"
                  inputMode="numeric"
                  placeholder="+91"
                  value={form.dialCode}
                  onChange={update}
                  aria-label="Country calling code"
                  data-testid="doctor-dial-code"
                />
                <input
                  name="phone"
                  required
                  type="tel"
                  inputMode="numeric"
                  placeholder={inIndia ? 'XXXXXXXXXX' : 'Number without the country code'}
                  value={form.phone}
                  onChange={update}
                  data-testid="doctor-phone"
                />
              </div>
              <small className="field-hint">
                {inIndia
                  ? '10-digit mobile number.'
                  : 'Enter the number without the leading zero, e.g. +971 50 123 4567.'}
              </small>
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

            {form.specialty === 'Other' && (
              <label>
                Which specialisation? *
                <input
                  name="specialtyOther"
                  required
                  maxLength={80}
                  placeholder="e.g., Ophthalmology"
                  value={form.specialtyOther}
                  onChange={update}
                  data-testid="doctor-specialty-other"
                />
              </label>
            )}

            <label>
              Country of practice *
              <select
                name="country"
                required
                value={form.country}
                onChange={update}
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
              State / Region *
              <input
                name="state"
                required
                placeholder={inIndia ? 'e.g., Maharashtra' : 'e.g., Dubai'}
                value={form.state}
                onChange={update}
                data-testid="doctor-state"
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

          <div className="channel-box">
            <b>Preferred channels *</b>
            <p>{inIndia ? 'Choose one or both' : 'Outside India we onboard doctors for online consultations only'}</p>
            <label className="check-label">
              <input
                type="checkbox"
                checked={channels.online}
                onChange={(e) => setChannels({ ...channels, online: e.target.checked })}
                data-testid="channel-online"
              />
              Online Consult
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={channels.home}
                disabled={!inIndia}
                onChange={(e) => setChannels({ ...channels, home: e.target.checked })}
                data-testid="channel-home"
              />
              Home Visit{!inIndia && ' (India only)'}
            </label>
          </div>

          <label className="check-label consent">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              data-testid="doctor-consent"
            />{' '}
            I agree to the{' '}
            <Link to="/privacy">Privacy Policy</Link> and Terms and consent to Charak processing my data.
          </label>

          <button
            className="button button-dark full submit-btn"
            type="submit"
            disabled={!hasChannel || !consent || needsSpecialtyDetail || submitting}
            data-testid="submit-doctor-registration"
          >
            {submitting ? 'Submitting…' : <>Submit Registration <ArrowRight size={16} /></>}
          </button>

          {(!hasChannel || !consent || needsSpecialtyDetail) && (
            <small className="submit-hint" data-testid="submit-hint">
              {!hasChannel
                ? 'Pick at least one channel to enable submission.'
                : needsSpecialtyDetail
                  ? 'Tell us which specialisation you practise to enable submission.'
                  : 'Tick the consent box to enable submission.'}
            </small>
          )}

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
