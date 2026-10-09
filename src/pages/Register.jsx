import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Check, LogOut, MessageSquare, Upload, FileText, X } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth, authMessage } from '../context/AuthContext';
import { COUNTRIES, DIAL_BY_COUNTRY, PRIORITY_COUNTRIES } from '../data/countries';
import { INDIA_STATES, INDIA_UNION_TERRITORIES } from '../data/indiaStates';

// Every type but yoga practises under a council registration, so the number
// is required of all of them; yoga has no statutory council, and is verified
// on the certificate alone, quoting a number only if the certificate has one.
const PRACTITIONER_TYPES = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'physiotherapist', label: 'Physiotherapist' },
  { value: 'yoga', label: 'Yoga practitioner' },
  { value: 'other', label: 'Other healthcare professional' }
];

const DOCTOR_SPECIALTIES = [
  'General Physician', 'Ayurveda', 'Homeopathy', 'Orthopedic', 'Cardiology',
  'Dermatology', 'Gynecology', 'Pediatrics', 'Dentistry'
];

const QUALIFICATION_HINTS = {
  doctor: 'e.g., MBBS, BAMS, MD',
  nurse: 'e.g., GNM, B.Sc Nursing',
  physiotherapist: 'e.g., BPT, MPT',
  yoga: 'e.g., Level 2 Yoga Wellness Instructor, RYT 200',
  other: 'e.g., Diploma in Dietetics'
};

// The register that sits above the state councils, named per type so the
// option reads as something the practitioner recognises.
const NATIONAL_REGISTER = {
  doctor: 'NMC, NCISM, NCH or DCI',
  nurse: 'Indian Nursing Council',
  physiotherapist: 'NCAHP',
  other: 'national council'
};

const YOGA_CERT_BODIES = ['Yoga Certification Board (YCB)', 'Yoga Alliance'];

const THIS_YEAR = new Date().getFullYear();

// Six characters with the look-alikes (0/O, 1/I/L) left out, so a reference
// read out over the phone is not misheard.
const REFERENCE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newReference = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `CHR-${Array.from(bytes, (b) => REFERENCE_ALPHABET[b % REFERENCE_ALPHABET.length]).join('')}`;
};

// The fields whose rules change with the practitioner type, so a stale
// message for one type is not left showing under another.
const VERIFICATION_ERRORS = {
  specialty: 1, specialtyOther: 1, qualification: 1, certBody: 1, certBodyOther: 1, college: 1,
  passingYear: 1, council: 1, licenceNumber: 1, registrationYear: 1, nuid: 1, hprId: 1
};

// Readable but path-safe: storage keys show up as-is in the console.
const slug = (text) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'practitioner';

const LICENCE_COPY = {
  doctor: {
    label: 'Medical registration number',
    placeholder: 'e.g., MH/12345/2011',
    hint: 'As printed on your council registration.',
    missing: 'Please enter your medical registration number.'
  },
  nurse: {
    label: 'Nursing council registration number',
    placeholder: 'As on your registration',
    hint: 'As printed on your State Nursing Council registration.',
    missing: 'Please enter your nursing council registration number.'
  },
  physiotherapist: {
    label: 'Registration number',
    placeholder: 'As on your registration',
    hint: 'From the council you are registered with.',
    missing: 'Please enter your registration number.'
  },
  yoga: {
    label: 'Certificate number',
    placeholder: 'Optional',
    hint: 'If your certificate has one, e.g. from YCB.',
    missing: ''
  },
  other: {
    label: 'Registration or licence number',
    placeholder: 'As on your registration',
    hint: 'From the council you are registered with.',
    missing: 'Please enter your registration or licence number.'
  }
};

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
  // Errors are worked out from the form on every render; these decide which
  // of them to show. A field's message appears once the person has left it
  // (or picked something, for selects and boxes), and every message appears
  // after a submit attempt, so nobody is told off for a field not reached yet.
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const touch = (key) => setTouched((t) => (t[key] ? t : { ...t, [key]: true }));
  const untouch = (keys) =>
    setTouched((t) => {
      const next = { ...t };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  // A rejected file never reaches state, so its reason is held on its own.
  const [fileError, setFileError] = useState('');
  const [consent, setConsent] = useState(false);
  const [existing, setExisting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const [form, setForm] = useState({
    name: '',
    email: '',
    practitionerType: '',
    specialty: '',
    qualification: '',
    specialtyOther: '',
    college: '',
    passingYear: '',
    council: '',
    registrationYear: '',
    nuid: '',
    hprId: '',
    registeredName: '',
    certBody: '',
    certBodyOther: '',
    city: '',
    state: '',
    pincode: '',
    experience: '',
    licenceNumber: ''
  });
  const [channels, setChannels] = useState({ online: false, home: false });
  // The verification certificate: held in memory until the form is submitted,
  // so an abandoned registration leaves nothing behind in storage.
  const [certificate, setCertificate] = useState(null);
  const [uploading, setUploading] = useState(false);
  // One reference for the whole visit: it names the uploaded file, so a retry
  // after a failed submit overwrites that file instead of leaving a stray one.
  const referenceRef = useRef(null);

  const CERT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];
  const CERT_MAX_BYTES = 10 * 1024 * 1024;

  const chooseCertificate = (file) => {
    if (!file) return;
    touch('certificate');
    if (!CERT_TYPES.includes(file.type)) {
      setFileError('Please upload a PDF, JPG or PNG.');
      return;
    }
    if (file.size > CERT_MAX_BYTES) {
      setFileError('That file is over 10MB. Please upload a smaller scan.');
      return;
    }
    setFileError('');
    setCertificate(file);
  };

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
    // The council is a state pick in India and free text elsewhere.
    setForm((prev) => ({ ...prev, state: '', pincode: '', council: '' }));
    untouch(['state', 'pincode', 'council']);
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

  const submitCode = async (typed) => {
    const entered = (typeof typed === 'string' ? typed : code).trim();
    if (entered.length !== 6) {
      setOtpError('Please enter the 6-digit code we sent you.');
      return;
    }
    setCheckingCode(true);
    setOtpError('');
    try {
      await confirmCode(confirmation, entered);
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

  // Android Chrome can hand us the code straight out of the SMS, so the doctor
  // never leaves the page to go read it. It only fires when the message ends
  // with "@www.charak.care #123456", and Firebase's template puts the code
  // first and the domain last, so today this never resolves and the field
  // stays manual — it is waiting on us sending our own SMS, not broken.
  // Everywhere else (iOS, desktop) the API is absent and this is a no-op.
  useEffect(() => {
    if (!confirmation) return undefined;
    if (typeof window === 'undefined' || !('OTPCredential' in window)) return undefined;
    const abort = new AbortController();
    navigator.credentials
      .get({ otp: { transport: ['sms'] }, signal: abort.signal })
      .then((cred) => {
        const sms = cred?.code?.replace(/\D/g, '').slice(0, 6);
        if (!sms || sms.length !== 6) return;
        setCode(sms);
        setOtpError('');
        submitCode(sms);
      })
      .catch(() => {
        // Aborted, dismissed, or unsupported: the typed code still works.
      });
    return () => abort.abort();
    // Re-armed whenever a fresh code is on its way.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmation]);

  const update = (e) => {
    const { name, value } = e.target;
    if (name === 'practitionerType') {
      // A specialty or qualification typed for one kind of practitioner does
      // not carry over to another.
      setForm({
        ...form,
        practitionerType: value,
        specialty: '',
        specialtyOther: '',
        qualification: '',
        certBody: '',
        certBodyOther: ''
      });
      // The fields below change with the type, so they start fresh.
      untouch(Object.keys(VERIFICATION_ERRORS));
      return;
    }
    if (name === 'specialty') {
      setForm({ ...form, specialty: value, specialtyOther: value === 'Other' ? form.specialtyOther : '' });
      return;
    }
    if (name === 'certBody') {
      setForm({ ...form, certBody: value, certBodyOther: value === 'Other' ? form.certBodyOther : '' });
      return;
    }
    if (name === 'passingYear' || name === 'registrationYear') {
      setForm({ ...form, [name]: value.replace(/\D/g, '').slice(0, 4) });
      return;
    }
    if (name === 'pincode' && inIndia) {
      setForm({ ...form, pincode: value.replace(/\D/g, '').slice(0, 6) });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const hasChannel = channels.online || channels.home;
  const isDoctor = form.practitionerType === 'doctor';
  const isYoga = form.practitionerType === 'yoga';
  // Until a type is chosen the field reads as the general case: required.
  const licenceCopy = LICENCE_COPY[form.practitionerType] || LICENCE_COPY.other;
  const typeLabel = PRACTITIONER_TYPES.find((t) => t.value === form.practitionerType)?.label || '';
  const needsSpecialtyDetail = isDoctor && form.specialty === 'Other' && !form.specialtyOther.trim();

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

    if (!form.practitionerType) next.practitionerType = 'Please tell us what you practise.';
    if (isDoctor) {
      if (!form.specialty) next.specialty = 'Please choose your specialty.';
      if (needsSpecialtyDetail) next.specialtyOther = 'Please tell us which specialisation you practise.';
    } else if (form.practitionerType === 'other' && !form.specialtyOther.trim()) {
      next.specialtyOther = 'Please tell us what you practise.';
    }
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

    // Verification details, checked in the order they sit on the form so the
    // first error found is the first one on screen.
    if (form.practitionerType) {
      const qual = form.qualification.trim();
      if (!qual) next.qualification = isYoga ? 'Please enter your certification and level.' : 'Please enter your qualification.';
      else if (qual.length > 120) next.qualification = 'Please keep this under 120 characters.';

      if (isYoga) {
        if (!form.certBody) next.certBody = 'Please tell us who certified you.';
        else if (form.certBody === 'Other' && !form.certBodyOther.trim()) {
          next.certBodyOther = 'Please name the school or body.';
        }
      } else if (!form.college.trim()) {
        next.college = 'Please enter the college or institute you studied at.';
      }

      const passing = form.passingYear;
      if (!passing && !isYoga) next.passingYear = 'Please enter the year you passed.';
      else if (passing && (passing.length !== 4 || passing < 1950 || passing > THIS_YEAR)) {
        next.passingYear = `Enter a year between 1950 and ${THIS_YEAR}.`;
      }

      if (!isYoga && !form.council.trim()) next.council = 'Please tell us which council you are registered with.';

      // Required of everyone but yoga practitioners, and a number that is
      // given still has to look like one.
      const licence = form.licenceNumber.trim();
      if (!licence && !isYoga) next.licenceNumber = licenceCopy.missing;
      else if (licence && !/^[A-Za-z0-9/\-. ]{5,30}$/.test(licence)) {
        next.licenceNumber = 'Use 5–30 letters, digits or / - . only.';
      }

      if (!isYoga) {
        const reg = form.registrationYear;
        if (!reg) next.registrationYear = 'Please enter the year you registered.';
        else if (reg.length !== 4 || reg < 1950 || reg > THIS_YEAR) {
          next.registrationYear = `Enter a year between 1950 and ${THIS_YEAR}.`;
        }
      }

      // Only checked while the field is on screen: a value typed under one
      // type and hidden by switching would otherwise block an unseen error.
      const nuid = form.nuid.trim();
      if (form.practitionerType === 'nurse' && nuid && !/^[A-Za-z0-9-]{4,30}$/.test(nuid)) {
        next.nuid = 'Use letters and digits only.';
      }

      const hpr = form.hprId.replace(/\D/g, '');
      if (!isYoga && form.hprId.trim() && hpr.length !== 14) next.hprId = 'An HPR ID is 14 digits.';
    }

    if (!certificate) {
      next.certificate = isYoga
        ? 'Please upload your yoga certificate.'
        : 'Please upload your registration or degree certificate.';
    }

    if (!hasChannel) next.channels = 'Choose at least one channel.';
    if (!consent) next.consent = 'Please accept the Privacy Policy and Terms to continue.';
    return next;
  };

  const FIELD_TESTIDS = {
    name: 'doctor-full-name',
    email: 'doctor-email',
    phone: 'doctor-phone',
    practitionerType: 'doctor-practitioner-type',
    specialty: 'doctor-specialty',
    specialtyOther: 'doctor-specialty-other',
    city: 'doctor-city',
    state: 'doctor-state',
    pincode: 'doctor-pincode',
    experience: 'doctor-experience',
    qualification: 'doctor-qualification',
    certBody: 'doctor-cert-body',
    certBodyOther: 'doctor-cert-body-other',
    college: 'doctor-college',
    passingYear: 'doctor-passing-year',
    council: 'doctor-council',
    licenceNumber: 'doctor-licence',
    registrationYear: 'doctor-registration-year',
    nuid: 'doctor-nuid',
    hprId: 'doctor-hpr-id',
    registeredName: 'doctor-registered-name',
    certificate: 'doctor-certificate',
    channels: 'channel-online',
    consent: 'doctor-consent'
  };

  // Back from a field's test id to its error key, so one blur handler on the
  // form can mark whichever field was just left.
  const FIELD_BY_TESTID = {
    ...Object.fromEntries(Object.entries(FIELD_TESTIDS).map(([k, id]) => [id, k])),
    'doctor-dial-code': 'phone',
    'channel-home': 'channels'
  };
  const fieldOf = (el) => FIELD_BY_TESTID[el?.dataset?.testid];

  const allErrors = validate();
  const errors = Object.fromEntries(
    Object.entries(allErrors).filter(([k]) => submitted || touched[k])
  );
  if (fileError) errors.certificate = fileError;
  const errorCount = Object.keys(errors).length;

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
        <div className="eyebrow">PRACTITIONER ONBOARDING</div>
        <div className="aside-script">सेवा से जुड़ें</div>
        <h1>
          Make care
          <br />
          <em>more human.</em>
        </h1>
        <p>
          Doctors, nurses, physiotherapists and yoga practitioners: join a verified network
          built around the way you practise.
        </p>
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

          <h2>Register as a Charak practitioner</h2>
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
                      const next = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCode(next);
                      if (otpError) setOtpError('');
                      // The iOS keyboard's one-time-code suggestion, and a paste,
                      // both land all six at once: confirm without a second tap.
                      if (next.length === 6 && code.length < 6 && !checkingCode) submitCode(next);
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

  // ---- Stage 2: the details, as a popup over the verified step ----------
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
      </div>

      <div className="modal-backdrop" role="presentation" data-lenis-prevent>
      <div className="modal modal-wide" role="dialog" aria-modal="true" data-testid="doctor-details-modal">
        <button
          className="modal-close"
          onClick={() => signOut()}
          aria-label="Close and sign out"
          data-testid="close-doctor-details-modal"
        >
          <X />
        </button>

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
          onBlur={(e) => {
            const key = fieldOf(e.target);
            if (key) touch(key);
          }}
          onChange={(e) => {
            // A pick is a finished answer; typing is not, until the field is left.
            const key = fieldOf(e.target);
            if (key && /^(select|checkbox|file)/.test(e.target.type)) touch(key);
          }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (submitting) return;
            setSubmitted(true);
            const found = { ...validate(), ...(fileError ? { certificate: fileError } : {}) };
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
              // The document goes up first: a registration without its
              // certificate is not one our team can act on, so a failed
              // upload has to stop the whole submission.
              setUploading(true);
              if (!referenceRef.current) referenceRef.current = newReference();
              const reference = referenceRef.current;
              // The folder has to be the uid, which is what the storage rules
              // check; the file name is what makes it findable: reference,
              // name and type, e.g. CHR-K3P9QX_priya-sharma_nurse.pdf.
              const ext = (certificate.name.match(/\.([A-Za-z0-9]{1,5})$/)?.[1] || 'bin').toLowerCase();
              const fileName = `${reference}_${slug(form.name.trim().replace(/^dr\.?\s+/i, ''))}_${form.practitionerType}.${ext}`;
              const certRef = ref(storage, `verification_docs/${user.uid}/${fileName}`);
              await uploadBytes(certRef, certificate, {
                contentType: certificate.type,
                // Shown alongside the file in the Firebase console.
                customMetadata: {
                  reference,
                  name: form.name.trim(),
                  practitionerType: form.practitionerType,
                  originalName: certificate.name.slice(-120)
                }
              });
              const verificationDocUrl = await getDownloadURL(certRef);
              setUploading(false);

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
                practitionerType: form.practitionerType,
                // Non-doctors have no specialty list, so their type stands in
                // for it and the app's category still has something to read.
                specialty: isDoctor ? form.specialty : typeLabel,
                specialtyOther:
                  (isDoctor && form.specialty === 'Other') || form.practitionerType === 'other'
                    ? form.specialtyOther.trim()
                    : '',
                qualification: form.qualification.trim(),
                college: isYoga ? '' : form.college.trim(),
                passingYear: form.passingYear,
                council: isYoga ? '' : form.council.trim(),
                registrationYear: isYoga ? '' : form.registrationYear,
                nuid: form.practitionerType === 'nurse' ? form.nuid.trim() : '',
                hprId: isYoga ? '' : form.hprId.replace(/\D/g, ''),
                registeredName: form.registeredName.trim(),
                certBody: isYoga ? (form.certBody === 'Other' ? form.certBodyOther.trim() : form.certBody) : '',
                country,
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim(),
                experience: form.experience.trim(),
                licenceNumber: form.licenceNumber.trim(),
                verification_doc_url: verificationDocUrl,
                verification_doc_path: certRef.fullPath,
                verification_doc_name: certificate.name,
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
                state: { reference, name: form.name.trim(), practitionerType: form.practitionerType }
              });
            } catch (err) {
              console.error('Registration submit failed:', err.code, err.message);
              if (err.code && err.code.startsWith('storage/')) {
                setError(
                  err.code === 'storage/unauthorized'
                    ? 'That file was refused. Please upload a PDF, JPG or PNG under 10MB.'
                    : 'Could not upload your certificate. Please check your connection and try again.'
                );
                return;
              }
              setError(
                err.code === 'permission-denied'
                  ? 'Your session needs a refresh. Please sign out, confirm your number again, and resubmit.'
                  : 'Could not submit registration. Please check your connection and try again.'
              );
            } finally {
              setUploading(false);
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
                placeholder={isDoctor ? 'Dr. Full Name' : 'Full Name'}
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
              You are a *
              <select
                name="practitionerType"
                value={form.practitionerType}
                onChange={update}
                data-testid="doctor-practitioner-type"
              >
                <option value="">Select one</option>
                {PRACTITIONER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.practitionerType && (
                <small className="field-error" role="alert">{errors.practitionerType}</small>
              )}
            </label>

            {isDoctor && (
              <label>
                Specialty *
                <select
                  name="specialty"
                  value={form.specialty}
                  onChange={update}
                  data-testid="doctor-specialty"
                >
                  <option value="">Select specialty</option>
                  {DOCTOR_SPECIALTIES.map((sp) => (
                    <option key={sp}>{sp}</option>
                  ))}
                  <option>Other</option>
                </select>
                {errors.specialty && <small className="field-error" role="alert">{errors.specialty}</small>}
              </label>
            )}

            {((isDoctor && form.specialty === 'Other') || form.practitionerType === 'other') && (
              <label>
                {isDoctor ? 'Which specialisation? *' : 'What do you practise? *'}
                <input
                  name="specialtyOther"
                  maxLength={80}
                  placeholder={isDoctor ? 'e.g., Ophthalmology' : 'e.g., Dietitian'}
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

          {form.practitionerType && (
            <>
              <div className="form-section">
                <b>Verification details</b>
                <p>
                  {isYoga
                    ? 'What our team needs to check your certification.'
                    : 'What our team needs to find you on your council’s register. Please enter them exactly as on your certificate.'}
                </p>
              </div>
              <div className="form-grid">
                <label>
                  {isDoctor ? 'Highest qualification *' : isYoga ? 'Certification and level *' : 'Qualification *'}
                  <input
                    name="qualification"
                    maxLength={120}
                    placeholder={QUALIFICATION_HINTS[form.practitionerType]}
                    value={form.qualification}
                    onChange={update}
                    data-testid="doctor-qualification"
                  />
                  {errors.qualification && (
                    <small className="field-error" role="alert">{errors.qualification}</small>
                  )}
                </label>

                {isYoga && (
                  <label>
                    Certified by *
                    <select name="certBody" value={form.certBody} onChange={update} data-testid="doctor-cert-body">
                      <option value="">Select one</option>
                      {YOGA_CERT_BODIES.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                      <option>Other</option>
                    </select>
                    {errors.certBody && <small className="field-error" role="alert">{errors.certBody}</small>}
                  </label>
                )}

                {isYoga && form.certBody === 'Other' && (
                  <label>
                    Which school or body? *
                    <input
                      name="certBodyOther"
                      maxLength={120}
                      placeholder="e.g., Bihar School of Yoga"
                      value={form.certBodyOther}
                      onChange={update}
                      data-testid="doctor-cert-body-other"
                    />
                    {errors.certBodyOther && (
                      <small className="field-error" role="alert">{errors.certBodyOther}</small>
                    )}
                  </label>
                )}

                {!isYoga && (
                  <label>
                    College or institute *
                    <input
                      name="college"
                      maxLength={150}
                      placeholder={isDoctor ? 'e.g., B.J. Medical College, Pune' : 'Where you earned this qualification'}
                      value={form.college}
                      onChange={update}
                      data-testid="doctor-college"
                    />
                    {errors.college && <small className="field-error" role="alert">{errors.college}</small>}
                  </label>
                )}

                <label>
                  {isYoga ? 'Year certified' : 'Year of passing *'}
                  <input
                    name="passingYear"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder={isYoga ? 'Optional, e.g. 2021' : 'e.g., 2014'}
                    value={form.passingYear}
                    onChange={update}
                    data-testid="doctor-passing-year"
                  />
                  {errors.passingYear && <small className="field-error" role="alert">{errors.passingYear}</small>}
                </label>

                {!isYoga && (
                  <label>
                    Registered with *
                    {inIndia ? (
                      <select name="council" value={form.council} onChange={update} data-testid="doctor-council">
                        <option value="">Select your council</option>
                        <option value="National">National register ({NATIONAL_REGISTER[form.practitionerType]})</option>
                        <optgroup label="State council">
                          {[...INDIA_STATES, ...INDIA_UNION_TERRITORIES].map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    ) : (
                      <input
                        name="council"
                        maxLength={120}
                        placeholder="Your registering body"
                        value={form.council}
                        onChange={update}
                        data-testid="doctor-council"
                      />
                    )}
                    <small className="field-hint">The council that issued your registration.</small>
                    {errors.council && <small className="field-error" role="alert">{errors.council}</small>}
                  </label>
                )}

                <label>
                  {licenceCopy.label}{!isYoga && ' *'}
                  <input
                    name="licenceNumber"
                    maxLength={30}
                    placeholder={licenceCopy.placeholder}
                    value={form.licenceNumber}
                    onChange={update}
                    data-testid="doctor-licence"
                  />
                  <small className="field-hint">{licenceCopy.hint}</small>
                  {errors.licenceNumber && (
                    <small className="field-error" role="alert">{errors.licenceNumber}</small>
                  )}
                </label>

                {!isYoga && (
                  <label>
                    Year of registration *
                    <input
                      name="registrationYear"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="e.g., 2015"
                      value={form.registrationYear}
                      onChange={update}
                      data-testid="doctor-registration-year"
                    />
                    {errors.registrationYear && (
                      <small className="field-error" role="alert">{errors.registrationYear}</small>
                    )}
                  </label>
                )}

                {form.practitionerType === 'nurse' && (
                  <label>
                    NUID
                    <input
                      name="nuid"
                      maxLength={30}
                      placeholder="Optional"
                      value={form.nuid}
                      onChange={update}
                      data-testid="doctor-nuid"
                    />
                    <small className="field-hint">Your Indian Nursing Council unique ID, if you have one.</small>
                    {errors.nuid && <small className="field-error" role="alert">{errors.nuid}</small>}
                  </label>
                )}

                {!isYoga && (
                  <label>
                    HPR ID
                    <input
                      name="hprId"
                      inputMode="numeric"
                      maxLength={20}
                      placeholder="Optional, 14 digits"
                      value={form.hprId}
                      onChange={update}
                      data-testid="doctor-hpr-id"
                    />
                    <small className="field-hint">Your ABDM Healthcare Professional ID. It speeds up verification.</small>
                    {errors.hprId && <small className="field-error" role="alert">{errors.hprId}</small>}
                  </label>
                )}

                <label>
                  Name on your certificate
                  <input
                    name="registeredName"
                    maxLength={120}
                    placeholder="Only if different from above"
                    value={form.registeredName}
                    onChange={update}
                    data-testid="doctor-registered-name"
                  />
                  <small className="field-hint">For example, a maiden name.</small>
                  {errors.registeredName && (
                    <small className="field-error" role="alert">{errors.registeredName}</small>
                  )}
                </label>
              </div>
            </>
          )}

          <div className="upload-box">
            <b>{isYoga ? 'Yoga certificate *' : 'Registration or degree certificate *'}</b>
            <p>
              {isYoga
                ? 'One file — your certificate from YCB or the school you trained with.'
                : 'One file — your council registration or degree certificate.'}{' '}
              PDF, JPG or PNG, up to 10MB. Only our verification team sees it.
            </p>
            {certificate ? (
              <div className="upload-chosen" data-testid="certificate-chosen">
                <FileText size={15} />
                <span className="upload-name">{certificate.name}</span>
                <small>{(certificate.size / (1024 * 1024)).toFixed(1)} MB</small>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setCertificate(null)}
                  aria-label="Remove the selected file"
                  data-testid="certificate-remove"
                >
                  <X size={13} /> Remove
                </button>
              </div>
            ) : (
              <label className="upload-drop">
                <Upload size={15} />
                <span>Choose a file</span>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/heic,image/heif"
                  onChange={(e) => {
                    chooseCertificate(e.target.files?.[0]);
                    // So picking the same file again after a removal still fires.
                    e.target.value = '';
                  }}
                  data-testid="doctor-certificate"
                />
              </label>
            )}
            {errors.certificate && (
              <small className="field-error" role="alert">{errors.certificate}</small>
            )}
          </div>

          <div className="channel-box">
            <b>Preferred channels *</b>
            <p>{inIndia ? 'Choose one or both' : 'Outside India we onboard practitioners for online sessions only'}</p>
            <label className="check-label">
              <input
                type="checkbox"
                checked={channels.online}
                onChange={(e) => {
                  setChannels({ ...channels, online: e.target.checked });
                }}
                data-testid="channel-online"
              />
              {isDoctor || !form.practitionerType ? 'Online Consult' : 'Online Session'}
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={channels.home}
                disabled={!inIndia}
                onChange={(e) => {
                  setChannels({ ...channels, home: e.target.checked });
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
              }}
              data-testid="doctor-consent"
            />{' '}
            I agree to the <Link to="/privacy">Privacy Policy</Link> and Terms and consent to Charak
            processing my data.
          </label>
          {errors.consent && (
            <small className="field-error consent-error" role="alert">{errors.consent}</small>
          )}

          {submitted && errorCount > 0 && (
            <small className="form-hint" role="status" data-testid="form-error-count">
              {errorCount === 1
                ? '1 field above needs your attention.'
                : `${errorCount} fields above need your attention.`}
            </small>
          )}

          <button
            className="button button-dark full submit-btn"
            type="submit"
            disabled={submitting}
            data-testid="submit-doctor-registration"
          >
            {uploading
              ? 'Uploading certificate…'
              : submitting
                ? 'Submitting…'
                : <>Submit Registration <ArrowRight size={16} /></>}
          </button>

          {error && (
            <small className="account-error" role="alert" data-testid="account-error">
              {error}
            </small>
          )}
        </form>
      </div>
      </div>
    </div>
  );
}
