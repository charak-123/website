import React from 'react';

const sectionHeadings = {
  privacy: [
    'Data Controller',
    'Data we collect',
    'Why we collect it',
    'Legal basis & consent',
    'How we store & how long',
    'Who we share with (no sale)',
    'Your rights (access/correction/deletion/withdraw)',
    'Security',
    'Cookies',
    "Children's data",
    'Data reuse (website → app pre-fill on same phone)',
    'Grievance Officer contact',
    'Effective date & changes'
  ],
  terms: [
    'Eligibility',
    'Registration ≠ guaranteed listing',
    'Verification & rejection rights',
    'No registration fee (V1)',
    'Code of conduct',
    'IP',
    'Limitation of liability',
    'Governing law (India)'
  ],
  disclaimer: [
    'Medical Disclaimer',
    'Platform role',
    'Emergency services',
    'Doctor-patient relationship'
  ]
};

const pageTitles = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  disclaimer: 'Medical Disclaimer'
};

export default function Legal({ type = 'privacy' }) {
  const title = pageTitles[type] || 'Legal Information';
  const headings = sectionHeadings[type] || sectionHeadings.privacy;

  return (
    <div className="legal-page container">
      <div className="eyebrow">
        CHARAK / <span style={{ display: 'contents' }}>{type.toUpperCase()}</span>
      </div>
      <h1>{title}</h1>
      <p className="legal-intro">
        A clear, human-first approach to building a trusted care network.
      </p>

      <div className="legal-body">
        {headings.map((heading, i) => (
          <section key={i}>
            <h3>{heading}</h3>
            <p>
              This section will contain Charak’s detailed policy language. We believe important information should be easy to understand, easy to find, and always written with people in mind.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
