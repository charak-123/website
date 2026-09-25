import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Check, LogOut } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, DIAL_BY_COUNTRY, PRIORITY_COUNTRIES } from '../data/countries';
import { INDIA_STATES, INDIA_UNION_TERRITORIES } from '../data/indiaStates';

export default function Register() {
  const navigate = useNavigate();
  const { user, ready, isVerified, signOut } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'country') {
      const india = value === 'India';
      setForm({
        ...form,
        country: value,
        // A state picked from the Indian list means nothing once the country
        // changes, and vice versa.
        state: '',
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

  // Every required field is checked on its trimmed value. `required` alone is
  // not enough: a single space satisfies it, and the record would then be
  // rejected by the security rules with an opaque permission error.
  const validate = () => {
    const next = {};
    const name = form.name.trim();
    if (!name) next.name = 'Please enter your full name.';
    else if (name.length < 2) next.name = 'That name looks too short.';
    else if (name.length > 80) next.name = 'Please keep your name under 80 characters.';

    if (!form.phone.trim()) next.phone = 'Please enter your phone number.';
    else if (!phoneLooksValid) {
      next.phone = inIndia
        ? 'Please enter a valid 10-digit mobile number.'
        : 'Please enter a valid number, with its country calling code.';
    }

    if (!form.specialty) next.specialty = 'Please choose your specialty.';
    if (needsSpecialtyDetail) next.specialtyOther = 'Please tell us which specialisation you practise.';

    const city = form.city.trim();
    if (!city) next.city = 'Please enter the city you practise in.';
    else if (city.length > 100) next.city = 'Please use a shorter city name.';

    const state = form.state.trim();
    if (!state) next.state = 'Please enter your state or region.';
    else if (state.length > 100) next.state = 'Please use a shorter name.';

    // Optional, but if they type something it has to be a real number.
    const exp = form.experience.trim();
    if (exp && !/^\d{1,2}$/.test(exp)) next.experience = 'Enter years as a number, e.g. 8.';
    else if (exp && Number(exp) > 60) next.experience = 'Please enter 60 or fewer years.';

    if (!hasChannel) next.channels = 'Choose at least one channel.';
    if (!consent) next.consent = 'Please accept the Privacy Policy and Terms to continue.';
    return next;
  };

  // Maps a field to its input so the first problem can be focused and read out.
  const FIELD_TESTIDS = {
    name: 'doctor-full-name',
    phone: 'doctor-phone',
    specialty: 'doctor-specialty',
    specialtyOther: 'doctor-specialty-other',
    city: 'doctor-city',
    state: 'doctor-state',
    experience: 'doctor-experience',
    channels: 'channel-online',
    consent: 'doctor-consent'
  };

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
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            if (submitting) return;

            const found = validate();
            setErrors(found);
            const firstBad = Object.keys(found)[0];
            if (firstBad) {
              setError('');
              // Take them to the problem rather than leaving them to hunt.
              const el = document.querySelector(`[data-testid="${FIELD_TESTIDS[firstBad]}"]`);
              el?.focus();
              el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
            
              {errors.name && (
                <small className="field-error" role="alert">{errors.name}</small>
              )}
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
              {errors.phone ? (
                <small className="field-error" role="alert">{errors.phone}</small>
              ) : (
                <small className="field-hint">
                  {inIndia
                    ? '10-digit mobile number.'
                    : 'Enter the number without the leading zero, e.g. +971 50 123 4567.'}
                </small>
              )}
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
            
              {errors.specialty && (
                <small className="field-error" role="alert">{errors.specialty}</small>
              )}
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
              
              {errors.specialtyOther && (
                <small className="field-error" role="alert">{errors.specialtyOther}</small>
              )}
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
            
              {errors.city && (
                <small className="field-error" role="alert">{errors.city}</small>
              )}
              </label>

            <label>
              {inIndia ? 'State / Union Territory *' : 'State / Region *'}
              {inIndia ? (
                <select
                  name="state"
                  required
                  value={form.state}
                  onChange={update}
                  data-testid="doctor-state"
                >
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
                  required
                  placeholder="e.g., Dubai"
                  value={form.state}
                  onChange={update}
                  data-testid="doctor-state"
                />
              )}
              {errors.state && (
                <small className="field-error" role="alert">{errors.state}</small>
              )}
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
            
              {errors.experience && (
                <small className="field-error" role="alert">{errors.experience}</small>
              )}
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
            {errors.channels && (
              <small className="field-error" role="alert">{errors.channels}</small>
            )}
          </div>

          <label className="check-label consent">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (errors.consent) setErrors((prev) => ({ ...prev, consent: '' }));
              }}
              data-testid="doctor-consent"
            />{' '}
            I agree to the{' '}
            <Link to="/privacy">Privacy Policy</Link> and Terms and consent to Charak processing my data.
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
