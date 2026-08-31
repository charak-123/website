import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, ShieldCheck, ArrowRight, Check } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [sent, setSent] = useState(false);
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
          onSubmit={(e) => {
            e.preventDefault();
            if (verified && hasChannel) setSent(true);
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
              <button
                type="button"
                className={`verify-btn ${verified ? 'verified' : ''}`}
                onClick={() => setVerified(!verified)}
                data-testid="verify-phone-button"
              >
                {verified ? <><Check size={14} /> Verified</> : 'Send OTP'}
              </button>
            </label>

            <label>
              Email (optional)
              <input
                name="email"
                type="email"
                placeholder="name@hospital.com"
                value={form.email}
                onChange={update}
                data-testid="doctor-email"
              />
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
            disabled={!(verified && hasChannel)}
            data-testid="submit-doctor-registration"
          >
            Submit Registration <ArrowRight size={16} />
          </button>

          {!verified && (
            <small className="form-hint" data-testid="phone-verification-hint">
              Verify your phone number to enable submission.
            </small>
          )}
        </form>
      </div>
    </div>
  );
}
