import React, { useState } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

export default function WaitlistModal({ close }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" data-testid="patient-waitlist-modal">
        <button
          className="modal-close"
          onClick={close}
          aria-label="Close"
          data-testid="close-waitlist-modal"
        >
          <X />
        </button>

        {sent ? (
          <div className="modal-success">
            <span className="success-icon"><Check /></span>
            <p className="eyebrow">YOU'RE ON THE LIST</p>
            <h2>Care is coming closer.</h2>
            <p>We’ll let you know when Charak is ready in your city.</p>
            <button className="button button-dark" onClick={close} data-testid="waitlist-success-close">
              Back to Charak
            </button>
          </div>
        ) : (
          <div>
            <p className="eyebrow">EARLY ACCESS</p>
            <h2>Be first in line for better care.</h2>
            <p className="modal-copy">
              Get launch updates and be among the first to experience Charak.
            </p>
            <form onSubmit={handleSubmit}>
              <label>
                Email address
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="patient-waitlist-email"
                />
              </label>
              <button className="button button-dark full" type="submit" data-testid="patient-waitlist-submit">
                Join the waitlist <ArrowRight size={16} />
              </button>
            </form>
            <small>We’ll only send meaningful updates. No noise.</small>
          </div>
        )}
      </div>
    </div>
  );
}
