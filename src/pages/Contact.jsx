import React from 'react';

export default function Contact() {
  return (
    <div className="contact-page container">
      <div className="eyebrow">CHARAK / SUPPORT</div>
      <h1>
        We’re here to
        <br />
        <em>help.</em>
      </h1>

      <div className="contact-grid">
        <p className="large-copy">
          For support, data requests, or grievances, reach out to our team. For verification status, include your reference ID.
        </p>

        <div className="contact-card">
          <span>Email</span>
          <a href="mailto:grievance@charak.health" data-testid="grievance-email">
            grievance@charak.health
          </a>

          <span>Phone</span>
          <p data-testid="contact-phone">+91-XXXXX XXXXX</p>

          <span>Response SLA</span>
          <p>30 days</p>
        </div>
      </div>
    </div>
  );
}
