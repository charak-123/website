import React from 'react';
import { Link } from 'react-router-dom';

// TODO(legal): fill these in before launch — they are required by the DPDP Act 2023
// and the IT Rules 2021, and Google's OAuth verification checks for them.
const ENTITY = {
  name: '[Legal entity name, e.g. Charak Health Technologies Pvt. Ltd.]',
  address: '[Registered office address]',
  grievanceOfficer: '[Grievance Officer name]',
  email: 'upcharchikitsa@gmail.com',
  effectiveDate: '10 September 2026'
};

const P = (text) => ({ type: 'p', text });
const UL = (items) => ({ type: 'ul', items });

const privacy = {
  intro:
    'This policy explains what we collect when you join our waitlist or register as a doctor, why we collect it, and the control you have over it. We have tried to write it in plain language rather than legalese.',
  sections: [
    {
      h: 'Who is responsible for your data',
      body: [
        P(
          `${ENTITY.name} ("Charak", "we", "us") is the Data Fiduciary for the personal data described in this policy, as defined under India's Digital Personal Data Protection Act, 2023 ("DPDP Act").`
        ),
        P(`Registered office: ${ENTITY.address}`),
        P(`Questions or requests: ${ENTITY.email}`)
      ]
    },
    {
      h: 'What we collect',
      body: [
        P('We only collect what we actually need. Today that is:'),
        UL([
          'Waitlist: your email address and the time you joined.',
          'Doctor registration: your full name, phone number, email address, specialty or category, the country, state and city you practise in, years of experience (optional), and the consultation channels you prefer (online consult and/or home visit).',
          'Account details: if you register with an email and password, we store your email and an encrypted form of your password. If you continue with Google, we receive your name, email address, and Google account identifier — we never receive your Google password.',
          'Technical records: standard server logs and timestamps generated when you use the site.'
        ]),
        P(
          'We do not collect medical records, patient data, government ID documents, or payment information through this website.'
        )
      ]
    },
    {
      h: 'Why we collect it',
      body: [
        UL([
          'To verify that you are a qualified practitioner before listing you on the Charak network.',
          'To contact you about your registration status and about the launch of the Charak app.',
          'To pre-fill your profile in the Charak app so you do not have to enter the same details twice.',
          'To keep the service secure and to prevent fraudulent or duplicate registrations.'
        ]),
        P(
          'We do not use your data for advertising, and we do not build advertising profiles from it.'
        )
      ]
    },
    {
      h: 'Your consent, and how to withdraw it',
      body: [
        P(
          'We process your data on the basis of the consent you give when you tick the consent box on the registration form. That consent is specific, informed, and freely given, as the DPDP Act requires.'
        ),
        P(
          `You can withdraw your consent at any time by emailing ${ENTITY.email}. Withdrawing consent is as easy as giving it. Once you withdraw, we stop processing your data and delete it unless we are legally required to keep it, and we will not be able to continue your verification or listing.`
        )
      ]
    },
    {
      h: 'Website to app: how your data carries over',
      body: [
        P(
          'This is a point we want to be explicit about. The details you submit here are stored in the same structure the Charak app uses. When the app launches and you sign in with the same account you created here, your profile will already be filled in and you will not be asked to submit the same information or documents again.'
        ),
        P(
          'If you would prefer that your data not carry over, tell us and we will delete your website registration instead.'
        )
      ]
    },
    {
      h: 'Where your data is stored',
      body: [
        P(
          'Your registration data is stored in Google Cloud Firestore in Google\'s Mumbai (asia-south1) region, so it stays within India. Account and sign-in information is handled by Google Firebase Authentication, and parts of that authentication infrastructure may be operated by Google outside India.'
        ),
        P('We do not sell your data, and we do not transfer it to data brokers.')
      ]
    },
    {
      h: 'Who we share it with',
      body: [
        P('We share personal data only in these situations:'),
        UL([
          'With Google Firebase, which hosts our database and handles sign-in on our behalf as a data processor.',
          'With professional bodies or registries, strictly to verify the credentials you have given us.',
          'Where we are required to by law, a court order, or a lawful government request.'
        ]),
        P('We do not sell personal data to anyone, for any purpose.')
      ]
    },
    {
      h: 'How long we keep it',
      body: [
        P(
          'We keep your registration data for as long as you are part of the Charak network, or until you ask us to delete it. If your registration is rejected, or if you never complete it, we delete the record within 12 months. Waitlist emails are kept until launch or until you unsubscribe, whichever comes first.'
        )
      ]
    },
    {
      h: 'Your rights',
      body: [
        P('Under the DPDP Act you have the right to:'),
        UL([
          'Access the personal data we hold about you and know who we have shared it with.',
          'Correct anything that is inaccurate, or complete anything that is missing.',
          'Have your data erased.',
          'Withdraw your consent at any time.',
          'Nominate someone to exercise these rights on your behalf if you die or become incapacitated.',
          'Escalate a complaint to the Data Protection Board of India if we have not resolved it.'
        ]),
        P(
          `To exercise any of these, email ${ENTITY.email}. We respond to all requests within 30 days.`
        )
      ]
    },
    {
      h: 'Security',
      body: [
        P(
          'The site is served over HTTPS. Data is encrypted in transit and at rest by Google Cloud. Passwords are never stored in readable form. Access to registration data is limited to the members of our team who need it in order to run verification.'
        ),
        P(
          'No system is perfectly secure. If a breach occurs that affects your data, we will notify you and the Data Protection Board as the DPDP Act requires.'
        )
      ]
    },
    {
      h: 'Cookies and tracking',
      body: [
        P(
          'We do not use advertising or third-party tracking cookies. Firebase Authentication stores a session token in your browser so that you stay signed in — this is necessary for the site to work and cannot be turned off while you are signed in.'
        )
      ]
    },
    {
      h: 'Children',
      body: [
        P(
          'This site is meant for practising healthcare professionals and is not directed at anyone under 18. We do not knowingly collect data from children. If you believe a child has given us data, tell us and we will delete it.'
        )
      ]
    },
    {
      h: 'Grievance Officer',
      body: [
        P(
          'In line with the DPDP Act and the Information Technology (Intermediary Guidelines) Rules, 2021, you can reach our Grievance Officer at:'
        ),
        UL([
          `Name: ${ENTITY.grievanceOfficer}`,
          `Email: ${ENTITY.email}`,
          `Address: ${ENTITY.address}`,
          'We acknowledge complaints within 24 hours and resolve them within 30 days.'
        ])
      ]
    },
    {
      h: 'Changes to this policy',
      body: [
        P(
          `This policy is effective from ${ENTITY.effectiveDate}. If we make a material change, we will update this page and, where the change affects how we use data you have already given us, contact you directly.`
        )
      ]
    }
  ]
};

const terms = {
  intro:
    'These terms cover your use of the Charak website and the doctor registration process. By registering, you agree to them.',
  sections: [
    {
      h: 'Who can register',
      body: [
        P(
          'Registration is open to qualified healthcare practitioners who hold a valid licence or registration with the relevant Indian medical or paramedical council for their field, and who are at least 18 years old. You must be legally permitted to practise in the city you register in.'
        )
      ]
    },
    {
      h: 'Registering does not guarantee a listing',
      body: [
        P(
          'This is important, so we will be direct about it. Submitting the registration form places you in a queue for verification. It does not create a listing, an offer of work, an employment relationship, or a partnership with Charak. You become part of the network only after we have verified your credentials and confirmed it to you.'
        )
      ]
    },
    {
      h: 'Verification, and our right to decline',
      body: [
        P(
          'We verify credentials before listing anyone, and we aim to complete this within 24 to 48 hours of receiving a complete registration. We may ask you for supporting documents.'
        ),
        P(
          'We may decline or withdraw a registration if we cannot verify your credentials, if the information you gave us is inaccurate or incomplete, if your licence lapses or is suspended, or if your conduct puts patients at risk. Where we can, we will tell you why.'
        )
      ]
    },
    {
      h: 'No registration fee',
      body: [
        P(
          'Registering with Charak is free. We will never ask you to pay to be verified or listed. If anyone asks you for a payment in exchange for a Charak listing, it is not us — please report it to us.'
        ),
        P(
          'Commercial terms for consultations will be agreed separately and clearly before the app launches. Nothing in these terms commits you to any fee.'
        )
      ]
    },
    {
      h: 'Accurate information',
      body: [
        P(
          'You are responsible for the accuracy of what you submit, and for keeping your account credentials secure. Tell us promptly if your registration details or licence status change. Submitting false credentials ends your registration immediately and may be reported to the relevant council.'
        )
      ]
    },
    {
      h: 'Conduct',
      body: [
        P('While you are part of the Charak network, we ask that you:'),
        UL([
          'Practise within the limits of your qualifications, licence, and the applicable professional code of ethics.',
          'Treat patients and colleagues with dignity and without discrimination.',
          'Hold patient confidentiality to the standard your profession requires.',
          'Do not use Charak to solicit payments outside the platform once commercial terms are in place.'
        ])
      ]
    },
    {
      h: 'Our content',
      body: [
        P(
          'The Charak name, logo, site design, and content belong to us, and you may not copy or reuse them without written permission.'
        ),
        P(
          'The information you submit remains yours. You grant us permission to use it for verification, listing, and operating the service — the Privacy Policy sets out the full scope of that permission.'
        )
      ]
    },
    {
      h: 'The service is provided as it is',
      body: [
        P(
          'The website is provided on an "as is" basis while we build towards launch. We do not promise it will be uninterrupted or error-free, and we may change or withdraw features. We will give you reasonable notice of changes that materially affect your registration.'
        )
      ]
    },
    {
      h: 'Limitation of liability',
      body: [
        P(
          'To the extent Indian law allows, Charak is not liable for indirect or consequential losses, or for loss of profit, business, or goodwill arising from your use of this website. Nothing here limits liability for death or personal injury caused by our negligence, for fraud, or for anything else that cannot lawfully be limited.'
        ),
        P(
          'Charak is a platform that connects patients with practitioners. We are not responsible for the clinical care you provide, and you remain professionally and legally responsible for your own practice.'
        )
      ]
    },
    {
      h: 'Ending your registration',
      body: [
        P(
          `You can end your registration at any time by emailing ${ENTITY.email}. We may end it if you break these terms. On termination we handle your data as set out in the Privacy Policy.`
        )
      ]
    },
    {
      h: 'Governing law',
      body: [
        P(
          'These terms are governed by the laws of India, and the courts at [city of jurisdiction] have exclusive jurisdiction over any dispute arising from them.'
        ),
        P(`Effective from ${ENTITY.effectiveDate}.`)
      ]
    }
  ]
};

const disclaimer = {
  intro:
    'Charak is a platform that helps people find and reach healthcare practitioners. It is not a provider of medical care, and nothing on this site is medical advice.',
  sections: [
    {
      h: 'This is not medical advice',
      body: [
        P(
          'Content on the Charak website is for general information only. It is not a diagnosis, a treatment recommendation, or a substitute for consulting a qualified doctor. Never ignore professional medical advice, or delay getting it, because of something you read here.'
        )
      ]
    },
    {
      h: 'In an emergency, do not use Charak',
      body: [
        P(
          'Charak is not an emergency service. If you or someone else is having a medical emergency, call your local emergency number or go to the nearest hospital immediately. Do not wait for a response through this website or the Charak app.'
        )
      ]
    },
    {
      h: 'What our role is',
      body: [
        P(
          'We verify that the practitioners in our network hold the credentials they claim. That is where our role ends. We do not practise medicine, we do not supervise or direct clinical decisions, and we are not a party to the consultation between a practitioner and a patient.'
        ),
        P(
          'Verification confirms credentials. It is not a guarantee of the outcome of any consultation or treatment.'
        )
      ]
    },
    {
      h: 'The doctor–patient relationship',
      body: [
        P(
          'The doctor–patient relationship is between you and the practitioner, and it begins when the consultation begins — not when you browse this site or create an account. The practitioner is solely responsible for the care they provide, for their clinical judgement, and for meeting the standards of their profession.'
        )
      ]
    },
    {
      h: 'Questions',
      body: [P(`If anything here is unclear, write to us at ${ENTITY.email}.`)]
    }
  ]
};

const content = { privacy, terms, disclaimer };

const pageTitles = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  disclaimer: 'Medical Disclaimer'
};

export default function Legal({ type = 'privacy' }) {
  const title = pageTitles[type] || 'Legal Information';
  const doc = content[type] || content.privacy;

  return (
    <div className="legal-page container">
      <div className="eyebrow">
        CHARAK / <span style={{ display: 'contents' }}>{type.toUpperCase()}</span>
      </div>
      <h1>{title}</h1>
      <p className="legal-intro">{doc.intro}</p>
      <p className="legal-updated">Last updated {ENTITY.effectiveDate}</p>

      <div className="legal-body">
        {doc.sections.map((section, i) => (
          <section key={i}>
            <h3>{section.h}</h3>
            {section.body.map((block, j) =>
              block.type === 'ul' ? (
                <ul key={j} className="legal-list">
                  {block.items.map((item, k) => (
                    <li key={k}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={j}>{block.text}</p>
              )
            )}
          </section>
        ))}
      </div>

      <div className="legal-footer-links">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
        <Link to="/disclaimer">Medical Disclaimer</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </div>
  );
}
