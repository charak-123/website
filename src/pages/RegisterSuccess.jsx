import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function RegisterSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, ready, isVerified } = useAuth();

  // Set by the form on submit; absent when someone returns to this URL later,
  // in which case we read their record back instead.
  const justSubmitted = location.state?.reference;
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(!justSubmitted);

  // The confirmation page carries a reference ID and is not an entry point —
  // it stays out of search results (PRD §9).
  useEffect(() => {
    const tag = document.createElement('meta');
    tag.name = 'robots';
    tag.content = 'noindex';
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (justSubmitted || !user || !isVerified) return undefined;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'doctors', user.uid));
        if (!cancelled && snap.exists()) setRecord(snap.data());
      } catch (err) {
        console.warn('Could not load registration:', err.code);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [justSubmitted, user, isVerified]);

  if (!ready || loading) {
    return (
      <div className="form-page container">
        <p className="auth-loading">Loading your registration…</p>
      </div>
    );
  }

  if (!user || !isVerified) return <Navigate to="/signin?next=/register" replace />;
  // Nothing submitted and nothing on file — send them to the form.
  if (!justSubmitted && !record) return <Navigate to="/register" replace />;

  const reference = justSubmitted || record?.reference || '—';
  const name = (location.state?.name || record?.name || 'there').replace(/^dr\.?\s*/i, '');

  return (
    <div className="form-page container">
      <div className="form-success">
        <span className="success-icon">
          <Check />
        </span>
        <div className="eyebrow">
          {justSubmitted ? 'REGISTRATION RECEIVED' : 'YOUR REGISTRATION IS WITH US'}
        </div>
        <h1>
          Welcome to the
          <br />
          <em>Charak network.</em>
        </h1>
        <p>
          Thank you, Dr. <span>{name}</span>. Your reference ID is{' '}
          <b data-testid="registration-reference">{reference}</b>.{' '}
          {justSubmitted
            ? 'Our team verifies credentials manually and typically completes this within 24–48 hours. We will contact you on the email and phone number you gave us.'
            : 'We already have your details and our team is reviewing them. Verification typically takes 24–48 hours.'}{' '}
          Please quote this reference ID if you get in touch.
        </p>
        <p className="success-note">
          Registering places you in the verification queue — it is not yet a listing. We will confirm
          once your credentials are verified, and we may ask you for supporting documents.
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
