import React from 'react';
import { Link } from 'react-router-dom';

// TODO(legal): fill these in before launch — they are required by the DPDP Act 2023
// and the IT Rules 2021, and Google's OAuth verification and the app stores check
// for them. The whole text still needs review by a lawyer before publication.
const ENTITY = {
  name: '[Legal entity name, e.g. Charak Health Technologies Pvt. Ltd.]',
  address: '[Registered office address]',
  grievanceOfficer: '[Grievance Officer name]',
  email: 'upcharchikitsa@gmail.com',
  jurisdiction: '[city of jurisdiction]',
  effectiveDate: '10 October 2026'
};

const P = (text) => ({ type: 'p', text });
const UL = (items) => ({ type: 'ul', items });

const grievanceSection = {
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
};

const privacy = {
  intro:
    'This policy explains what we collect through the Charak website, the Charak patient app and the Charak doctor app, why we collect it, and the control you have over it. We have tried to write it in plain language rather than legalese.',
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
        P('We only collect what we actually need to run the service:'),
        UL([
          'Your account: you sign in with your Google account, so we receive your name, email address and Google account identifier — never your Google password. We also store your mobile number once you give it to us, so the doctor or patient on a booking can reach you.',
          'If you are a patient: the addresses you save for home visits and their map location (used to check an address is inside a doctor\'s service area); the symptom information you share before a consultation — text, photos, video and voice notes, and the text transcript of those voice notes; and your bookings, payments, ratings and complaints.',
          'If you are a doctor or other practitioner: your name, specialty or qualification, licence or registration number, verification documents and certificates, years of experience, the area you serve and your base location, your prices and availability, the bank or UPI details we pay you to, and the ratings patients give you.',
          'Website registration and waitlist: what you enter on the registration form or the waitlist — your name, mobile number, what you practise and your specialty, where you practise, an optional email address and the consultation channels you prefer; and, to verify you, your qualification, college or institute, year of passing, the council you are registered with, your registration number and year, the name on your certificate if it differs, and your HPR ID or NUID if you choose to give them.',
          'Technical records: a device token so we can send you notifications, and standard server logs, IP addresses and timestamps generated when you use the website or the apps.'
        ]),
        P(
          'We do not receive or store your card or bank details when you pay — payments are handled entirely by our payment processor. We do not record video calls. We do not use advertising or third-party tracking tools in the apps or on the website.'
        )
      ]
    },
    {
      h: 'Why we collect it',
      body: [
        UL([
          'To create and run your account.',
          'To verify that doctors are qualified practitioners before they are listed.',
          'To match patients with doctors, and to run online consultations and home visits.',
          'To take payments, issue refunds and pay doctors.',
          'To turn a patient\'s voice notes into text so the doctor can read them before the consultation.',
          'To send you notifications about your bookings, and to handle complaints.',
          'To meet our legal, tax and medical-record obligations.',
          'To keep the service secure and to prevent fraud and duplicate accounts.'
        ]),
        P(
          'We do not use your data for advertising, and we do not build advertising profiles from it.'
        )
      ]
    },
    {
      h: 'Health information',
      body: [
        P(
          'The symptom information a patient shares is sensitive, and we treat it that way. It is shared only with the doctor on that booking and with the few members of our team who need it to run the service — for example, to investigate a complaint. It is never used for advertising or sold.'
        )
      ]
    },
    {
      h: 'Your consent, and how to withdraw it',
      body: [
        P(
          'We process your data on the basis of the consent you give when you register on the website or create an account in an app, and — for patients — the telemedicine consent you give before your first consultation. That consent is specific, informed, and freely given, as the DPDP Act requires.'
        ),
        P(
          `You can withdraw your consent at any time by deleting your account in the app (Profile → Delete account) or by emailing ${ENTITY.email}. Withdrawing consent is as easy as giving it. Once you withdraw, we stop processing your data and delete it except for the records we are legally required to keep, and we will not be able to continue providing the service to you.`
        )
      ]
    },
    {
      h: 'Website to app: how your data carries over',
      body: [
        P(
          'If you registered as a practitioner on this website, the details you submitted are carried over to the Charak doctor app. When you sign in to the app with the same account, your profile will already be filled in and you will not be asked to submit the same information or documents again.'
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
          'The apps\' data — accounts, bookings, symptom information and uploaded files — is stored in Mumbai, India, on Supabase (running on Amazon Web Services), and our servers run in Mumbai on Fly.io. Voice notes are transcribed by Google Cloud in its Mumbai region. Website registrations are stored in Google Cloud Firestore in Mumbai.'
        ),
        P(
          'Some providers operate parts of their infrastructure outside India: Google Firebase (sign-in and push notifications) and Agora (video calls, which pass through Agora\'s network but are not stored). Where data leaves India, it goes only to the providers named here, for the purposes described here.'
        ),
        P('We do not sell your data, and we do not transfer it to data brokers.')
      ]
    },
    {
      h: 'Who we share it with',
      body: [
        P('We share personal data only in these situations:'),
        UL([
          'Between the patient and the doctor on a booking — for example, the doctor sees the patient\'s symptom information, and for a home visit, the address once the visit is confirmed.',
          'With service providers that process data on our behalf, only as needed for the service: Supabase and Fly.io (hosting), Google Firebase (sign-in and notifications), Google Cloud (voice-note transcription), Agora (video calls) and Razorpay (payments, refunds and payouts).',
          'With professional bodies or registries, strictly to verify a practitioner\'s credentials.',
          'Where we are required to by law, a court order, or a lawful government request.'
        ]),
        P('We do not sell personal data to anyone, for any purpose.')
      ]
    },
    {
      h: 'How long we keep it',
      body: [
        P(
          'We keep your data for as long as you have an account, or until you ask us to delete it. When you delete your account in the app, your personal data is erased after a 30-day grace period, during which you can change your mind.'
        ),
        P(
          'Booking, payment, payout and consultation records must be kept for the period required by tax law and the applicable medical-record rules, even after an account is deleted. We keep them in de-identified form wherever we can. If a website registration is rejected, or never completed, we delete it within 12 months. Waitlist emails are kept until launch or until you unsubscribe, whichever comes first.'
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
          'Have your data erased — you can do this yourself in the app (Profile → Delete account).',
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
          'The website and the apps talk to our servers only over encrypted connections (HTTPS), and stored data is encrypted at rest by our hosting providers. On your phone, the apps keep your sign-in in the device\'s secure storage. Access to personal data is limited to the members of our team who need it to run the service.'
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
          'We do not use advertising or third-party tracking cookies. On the website, Firebase Authentication stores a session token in your browser so that you stay signed in — this is necessary for the site to work and cannot be turned off while you are signed in.'
        )
      ]
    },
    {
      h: 'Children',
      body: [
        P(
          'You must be 18 or older to create an account. A parent or guardian may book a consultation on behalf of a child, and is responsible for the information they share about that child. We do not knowingly collect data from children directly. If you believe a child has given us data, tell us and we will delete it.'
        )
      ]
    },
    grievanceSection,
    {
      h: 'Changes to this policy',
      body: [
        P(
          `This policy is effective from ${ENTITY.effectiveDate}. If we make a material change, we will update this page and ask you to accept the updated policy in the app; where the change affects how we use data you have already given us, we will also contact you directly.`
        )
      ]
    }
  ]
};

const terms = {
  intro:
    'These terms cover your use of the Charak website, the Charak patient app and the Charak doctor app. By creating an account or registering, you agree to them.',
  sections: [
    {
      h: 'What Charak is — and is not',
      body: [
        P(
          'Charak is a technology platform that connects patients with independent, registered healthcare practitioners for online consultations and home visits. Charak does not provide medical care, does not employ the doctors on the platform, and does not make clinical decisions — those rest solely with the treating doctor.'
        ),
        P(
          'Charak is not for medical emergencies. If you or someone else needs urgent care, call your local emergency number or go to the nearest hospital.'
        )
      ]
    },
    {
      h: 'Your account',
      body: [
        P(
          'You must be at least 18 years old to create an account, and a parent or guardian must act for anyone younger. You sign in with your Google account. You are responsible for keeping the information you give us accurate, and for activity on your account.'
        )
      ]
    },
    {
      h: 'Doctors: registration and verification',
      body: [
        P(
          'Registration is open to qualified healthcare practitioners who hold a valid licence or registration with the relevant Indian medical, nursing or allied healthcare council for their field, and who are legally permitted to practise where they offer care. Yoga practitioners, for whom there is no statutory council, register with a recognised yoga certification instead, and offer wellness sessions rather than medical care.'
        ),
        P(
          'Registering places you in a queue for verification. It does not create a listing, an offer of work, an employment relationship, or a partnership with Charak. You can take bookings only after we have verified your credentials. We aim to complete verification within 24 to 48 hours of receiving a complete registration, and we may ask for supporting documents.'
        ),
        P(
          'We may decline, suspend or withdraw a listing if we cannot verify your credentials, if the information you gave us is inaccurate, if your licence lapses or is suspended, or if your conduct puts patients at risk. Where we can, we will tell you why. Registering and being verified is free — we will never ask you to pay to be listed.'
        )
      ]
    },
    {
      h: 'Doctors: how you practise on Charak',
      body: [
        P('While you are on Charak, you agree to:'),
        UL([
          'Practise within the limits of your qualifications, licence, and the applicable professional code of ethics.',
          'Follow the Telemedicine Practice Guidelines, 2020 for online consultations, including deciding whether a case is suitable for teleconsultation.',
          'Treat patients with dignity and without discrimination, and hold their information to the standard of confidentiality your profession requires.',
          'Keep your licence, prices and availability up to date.',
          'Take payment for consultations booked through Charak only through Charak.'
        ]),
        P(
          'You remain professionally and legally responsible for the care you provide.'
        )
      ]
    },
    {
      h: 'Bookings, fees and payments',
      body: [
        P(
          'The fee for a consultation or home visit is shown before you pay. Payments are collected by our payment processor, Razorpay. A slot is held for a short window while you pay; if payment is not completed in that window, the slot is released. Any additional procedure charges for a home visit are shown to you as a bill in the app before you pay them.'
        ),
        P(
          'Charak keeps a platform commission from each paid consultation and procedure, and pays the balance to the doctor.'
        )
      ]
    },
    {
      h: 'Cancellations and refunds',
      body: [
        P(
          'You can cancel a booking in the app before it is completed. If a paid booking is cancelled — by the patient or by the doctor — the full amount is refunded to the original payment method. Refunds are usually credited within 5 to 7 working days, depending on your bank. How missed appointments are handled is shown in the app.'
        )
      ]
    },
    {
      h: 'Acceptable use',
      body: [
        P('You must not:'),
        UL([
          'Impersonate anyone, or give false information or credentials.',
          'Upload anything unlawful, abusive, or that you do not have the right to share.',
          'Harass or abuse patients, doctors, or our team.',
          'Try to break, overload or get around the security of the website or the apps.'
        ]),
        P(
          'Submitting false credentials ends your account immediately and may be reported to the relevant council.'
        )
      ]
    },
    {
      h: 'Content and ownership',
      body: [
        P(
          'The Charak name, logo, design, and content belong to us, and you may not copy or reuse them without written permission.'
        ),
        P(
          'What you submit — your profile, documents, symptom information — remains yours. You give us permission to use it only to verify, list, and run the service. The Privacy Policy sets out the full scope of that permission.'
        )
      ]
    },
    {
      h: 'The service is provided as it is',
      body: [
        P(
          'We work to keep Charak available and accurate, but we do not promise it will be uninterrupted or error-free, and we may change or withdraw features. We will give you reasonable notice of changes that materially affect you.'
        )
      ]
    },
    {
      h: 'Limitation of liability',
      body: [
        P(
          'To the extent Indian law allows, Charak is not liable for the acts or omissions of the practitioners on the platform, or for indirect or consequential losses, or for loss of profit, business, or goodwill arising from your use of the service. Nothing here limits liability for death or personal injury caused by our negligence, for fraud, or for anything else that cannot lawfully be limited.'
        )
      ]
    },
    {
      h: 'Ending your account',
      body: [
        P(
          `You can delete your account at any time in the app (Profile → Delete account), or by emailing ${ENTITY.email}. We may suspend or close an account that breaks these terms. On closure we handle your data as set out in the Privacy Policy.`
        )
      ]
    },
    grievanceSection,
    {
      h: 'Governing law and changes',
      body: [
        P(
          `These terms are governed by the laws of India, and the courts at ${ENTITY.jurisdiction} have exclusive jurisdiction over any dispute arising from them.`
        ),
        P(
          `Effective from ${ENTITY.effectiveDate}. If we make a material change, we will update this page and ask you to accept the new terms in the app.`
        )
      ]
    }
  ]
};

const telemedicine = {
  intro:
    'Patients are asked to accept this consent before their first consultation on Charak. It follows the Telemedicine Practice Guidelines, 2020 issued in India.',
  sections: [
    {
      h: 'Please read before consulting',
      body: [
        UL([
          'An online consultation happens remotely — by video or voice call, together with the symptom information you share. It is not a substitute for an in-person examination, and it has limits: the doctor may ask you to visit in person or to get tests done.',
          'The doctor decides whether your condition is suitable for an online consultation, and may decline or refer you elsewhere.',
          'A prescription, if one is given, is at the doctor\'s professional discretion and follows the applicable rules. Some medicines cannot be prescribed remotely.',
          'In an emergency, do not use Charak. Call your local emergency number or go to the nearest hospital.'
        ])
      ]
    },
    {
      h: 'What you consent to',
      body: [
        UL([
          'Consulting a registered practitioner through Charak, remotely or through a home visit.',
          'Sharing the symptom information you provide — including photos, video and voice notes — with that practitioner, and Charak processing it, including turning voice notes into text, so the consultation can take place and be recorded.',
          'Charak and the practitioner keeping consultation records for as long as the law requires.'
        ])
      ]
    },
    {
      h: 'What you confirm',
      body: [
        UL([
          'The information you give is accurate and complete to the best of your knowledge.',
          'You understand the limits of remote care described above.',
          'If you are booking for someone else, such as a child, you are their parent, guardian or authorised representative.'
        ])
      ]
    },
    {
      h: 'Withdrawing consent',
      body: [
        P(
          `You can withdraw this consent and stop at any time, by cancelling your booking or deleting your account in the app, or by emailing ${ENTITY.email}. Withdrawing does not affect care you have already received.`
        ),
        P(
          `By tapping "I agree" in the app, you confirm you have read and accept this consent, together with the Charak Privacy Policy and Terms of Service. Effective from ${ENTITY.effectiveDate}.`
        )
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

const content = { privacy, terms, telemedicine, disclaimer };

const pageTitles = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  telemedicine: 'Telemedicine Consent',
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
        <Link to="/telemedicine">Telemedicine Consent</Link>
        <Link to="/disclaimer">Medical Disclaimer</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </div>
  );
}
