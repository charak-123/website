import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  FileCheck2,
  House,
  IndianRupee,
  RefreshCcw,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
  Video
} from 'lucide-react';
import { Rangoli, Reveal, SplitHeading, VelocityMarquee, ease } from '../components/motion';
import Faq from '../components/Faq';
import '../styles/home.css';
import '../styles/doctors.css';

/* ---------------------------------------------------------------- content */

const requests = [
  { title: 'BP check', mode: 'Home visit', icon: House, meta: '1.8 km · 5:30 PM' },
  { title: 'Fever follow-up', mode: 'Video consult', icon: Video, meta: 'Today · 7:00 PM' },
  { title: 'Dressing after surgery', mode: 'Home visit', icon: House, meta: '3.2 km · Tomorrow, 9 AM' },
  { title: 'Knee physio session', mode: 'Home visit', icon: House, meta: '2.4 km · Tomorrow, 8 AM' },
  { title: 'Sugar report review', mode: 'Video consult', icon: Video, meta: 'Tomorrow · 6:30 PM' },
  { title: 'Morning yoga for back pain', mode: 'Online session', icon: Video, meta: 'Daily · 6:30 AM' }
];

const eligible = [
  'Doctors', 'Nurses', 'Physiotherapists', 'Yoga practitioners', 'MBBS', 'BAMS', 'BDS',
  'GNM', 'B.Sc Nursing', 'BPT', 'Specialists', 'Home visits', 'Online sessions'
];

const controls = [
  { icon: Video, title: 'Your channels', copy: 'Online, at home, or both. Change it any time.' },
  { icon: CalendarClock, title: 'Your schedule', copy: 'Set weekly recurring slots. Take a day off whenever you like.' },
  { icon: IndianRupee, title: 'Your rates', copy: 'You set your fee. Home-visit procedures are billed at your fixed rates.' },
  { icon: Check, title: 'Your call', copy: 'Every request waits for you. Accept what fits, decline what doesn’t.' }
];

const joinSteps = [
  {
    icon: UserRoundCheck,
    title: 'Register',
    time: 'A few minutes',
    copy: 'Sign in with Google or your mobile number. Tell us what you practise, your qualification and your registration number.'
  },
  {
    icon: FileCheck2,
    title: 'Get verified',
    time: 'Usually 24–48 hrs',
    copy: 'Upload your certificate. A person on our team checks it by hand, never a bot.'
  },
  {
    icon: Stethoscope,
    title: 'Go live',
    time: 'When we launch in your city',
    copy: 'Set your slots, radius and fees in the Charak app, and patients near you can book.'
  }
];

const promises = [
  { icon: ShieldCheck, title: 'Verified only', copy: 'No one is listed unchecked, which is why patients can trust everyone on Charak, including you.' },
  { icon: Stethoscope, title: 'Your judgement, not an algorithm', copy: 'Charak never triages or diagnoses. You read the patient’s need and decide.' },
  { icon: RefreshCcw, title: 'Fill it in once', copy: 'What you enter here carries over to the Charak app on the same number. No second upload once you’re verified.' }
];

const faqs = [
  {
    q: 'Who can register?',
    a: 'Doctors (MBBS, BDS, BAMS, BHMS and specialists), nurses, physiotherapists and other healthcare professionals with a valid council registration — and yoga practitioners with a recognised certification, such as from YCB.'
  },
  {
    q: 'Is there a fee to register?',
    a: 'No. Registration is free. Future commission/payout terms will be shared before you go live and updated in our Terms.'
  },
  {
    q: 'How long does verification take?',
    a: 'Usually 24–48 hours after you register. We may contact you for supporting documents if we need them to complete your verification.'
  },
  {
    q: 'What do I need to keep handy?',
    a: 'Your council registration number, and a scan or photo of your registration or degree certificate (PDF, JPG or PNG, up to 10MB). Yoga practitioners just need their yoga certificate.'
  },
  {
    q: 'Do I need to offer home visits?',
    a: 'No. Choose online only, home only, or both.'
  },
  {
    q: 'Will I have to fill this in again in the app?',
    a: 'No. When you sign in to the Charak app with the same phone number, your details are already there.'
  },
  {
    q: 'Is this for emergencies?',
    a: 'No. Charak is for scheduled consultations, visits and sessions. Not for emergency, ambulance, or triage services.'
  }
];

/* ------------------------------------------------------------------- hero */

/* A practitioner's inbox in the app, where new requests slide in from the top, the same
   motion the real app uses. */
function RequestFeed() {
  const [head, setHead] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHead((h) => (h + 1) % requests.length), 2600);
    return () => clearInterval(t);
  }, []);
  const visible = [0, 1, 2].map((k) => ({ ...requests[(head + k) % requests.length], key: head + k }));

  return (
    <motion.div
      className="feed"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1, ease }}
    >
      <div className="feed-top">
        <span>
          <small>App preview</small>
          <b>Requests near you</b>
        </span>
        <span className="feed-live"><i /> Live</span>
      </div>
      <div className="feed-list">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((r, k) => {
            const Icon = r.icon;
            return (
              <motion.div
                layout
                key={r.key}
                className={`feed-item ${k === 0 ? 'is-new' : ''}`}
                initial={{ opacity: 0, y: -40, scale: 0.96 }}
                animate={{ opacity: 1 - k * 0.22, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.96 }}
                transition={{ duration: 0.55, ease }}
              >
                <span className="feed-icon"><Icon size={18} /></span>
                <span className="feed-text">
                  <b>{r.title}</b>
                  <small>{r.mode} · {r.meta}</small>
                </span>
                {k === 0 ? <span className="feed-accept">Accept</span> : <span className="feed-pending">Pending</span>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DocHero() {
  return (
    <section className="dh">
      <Rangoli className="dh-rangoli" stroke="var(--chandan-200)" petals={[12, 18, 26]} spin={200} />
      <div className="container dh-grid">
        <div className="dh-copy">
          <motion.div
            className="dh-pill"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <Stethoscope size={15} /> For practitioners <span>Free to register</span>
          </motion.div>
          <SplitHeading as="h1" className="dh-title" text={'Your practice,\n*beyond the clinic.*'} onMount delay={0.15} underline />
          <motion.p
            className="dh-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8, ease }}
          >
            Doctors, nurses, physiotherapists and yoga practitioners: see patients at
            home and online, around the hours you already keep. You pick the radius,
            the slots and the fees. We handle the verification and the bookings.
          </motion.p>
          <motion.div
            className="dh-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.8, ease }}
          >
            <Link to="/register" className="button button-dark" data-testid="doctors-hero-register">
              Register now <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="dh-signin" data-testid="doctors-hero-signin">
              Already registered? Sign in
            </Link>
          </motion.div>
          <motion.ul
            className="dh-proof"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <li><Check size={15} /> No fee to join</li>
            <li><Check size={15} /> Verified in 24–48 hrs</li>
            <li><Check size={15} /> No AI between you and patients</li>
          </motion.ul>
        </div>
        <div className="dh-art">
          <RequestFeed />
        </div>
      </div>
    </section>
  );
}

/* Homes scattered around the practitioner; the ring shows who's in reach. */
const homes = Array.from({ length: 46 }, (_, k) => {
  const a = k * 2.399963; // golden angle keeps them evenly spread
  const r = 14 + Math.sqrt(k / 46) * 132;
  return { x: 160 + Math.cos(a) * r, y: 160 + Math.sin(a) * r, d: r };
});
const radii = [
  { km: 2, r: 62 },
  { km: 3, r: 95 },
  { km: 5, r: 146 }
];

function RadiusPicker() {
  const [pick, setPick] = useState(0);
  const { km, r } = radii[pick];
  const inReach = homes.filter((h) => h.d <= r).length;

  return (
    <div className="radius">
      <div className="radius-tabs" role="tablist" aria-label="Home-visit radius">
        {radii.map((o, k) => (
          <button
            key={o.km}
            role="tab"
            aria-selected={pick === k}
            className={pick === k ? 'on' : ''}
            onClick={() => setPick(k)}
          >
            {pick === k && <motion.span layoutId="radius-pill" className="radius-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span>{o.km} km</span>
          </button>
        ))}
      </div>
      <svg viewBox="0 0 320 320" className="radius-map" aria-hidden="true">
        <defs>
          <radialGradient id="rg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--blue-400)" stopOpacity=".28" />
            <stop offset="100%" stopColor="var(--blue-400)" stopOpacity=".04" />
          </radialGradient>
        </defs>
        {[40, 80, 120, 160, 200, 240, 280].map((v) => (
          <g key={v} stroke="var(--ink-100)" strokeWidth=".8">
            <line x1={v} y1="0" x2={v} y2="320" />
            <line x1="0" y1={v} x2="320" y2={v} />
          </g>
        ))}
        <motion.circle
          cx="160" cy="160" r={62}
          fill="url(#rg)"
          stroke="var(--blue-300)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          initial={{ r: 62 }}
          animate={{ r }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        />
        {homes.map((h, k) => (
          <motion.rect
            key={k}
            x={h.x - 3} y={h.y - 3} width="6" height="6" rx="1.5"
            initial={false}
            animate={{ fill: h.d <= r ? '#F4B228' : '#CDD1D8' }}
            transition={{ duration: 0.35, delay: h.d / 600 }}
          />
        ))}
        <circle cx="160" cy="160" r="14" fill="var(--blue-500)" />
        <motion.circle
          cx="160" cy="160" r="14" fill="none" stroke="var(--blue-300)" strokeWidth="2"
          initial={{ r: 14, opacity: 0.8 }}
          animate={{ r: [14, 30], opacity: [0.8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
        <path d="M155 160 h10 M160 155 v10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <p className="radius-caption">
        Within <b>{km} km</b>, you’d reach <motion.b key={inReach} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{inReach}</motion.b> of these homes.
        <small>Illustration. You pick a 2, 3 or 5 km home-visit radius in the app.</small>
      </p>
    </div>
  );
}


function Eligible() {
  return (
    <section className="elig" aria-label="Who can join">
      <VelocityMarquee className="elig-row" baseVelocity={-1.6}>
        {eligible.map((e) => (
          <span key={e} className="elig-item">
            {e}
            <span className="band-star" aria-hidden="true">✺</span>
          </span>
        ))}
      </VelocityMarquee>
    </section>
  );
}

function Controls() {
  return (
    <section id="why" className="docs docs-flat">
      <div className="container docs-grid">
        <div className="docs-copy">
          <SplitHeading text={'You set\n*the rules.*'} />
          <Reveal as="p" className="docs-lead" delay={0.1}>
            More control, less friction. Charak fits around how you already practise,
            not the other way round.
          </Reveal>
          <div className="docs-features">
            {controls.map((f, k) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} className="docs-feature" delay={0.1 + k * 0.08}>
                  <span className="docs-icon"><Icon size={20} /></span>
                  <span>
                    <b>{f.title}</b>
                    <small>{f.copy}</small>
                  </span>
                </Reveal>
              );
            })}
          </div>
        </div>
        <Reveal className="docs-art" delay={0.15}>
          <RadiusPicker />
        </Reveal>
      </div>
    </section>
  );
}

function Bhishak() {
  return (
    <section className="bhishak container">
      <Reveal className="bhishak-inner">
        <span className="bhishak-deva" lang="sa">चतुष्पाद</span>
        <p>
          In the Charaka Samhita, healing stands on four feet: the physician, the remedy,
          the <em>caregiver</em> and the patient. Two of them are you. We built Charak
          around the people who heal.
        </p>
      </Reveal>
    </section>
  );
}

function JoinSteps() {
  return (
    <section id="join" className="join container">
      <div className="join-head">
        <SplitHeading text={'Three steps\n*to go live.*'} />
      </div>
      <div className="join-grid">
        {joinSteps.map((s, k) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.title} className="join-step" delay={k * 0.12}>
              <span className="join-n">0{k + 1}</span>
              <span className="join-icon"><Icon size={24} /></span>
              <h3>{s.title}</h3>
              <span className="join-time">{s.time}</span>
              <p>{s.copy}</p>
            </Reveal>
          );
        })}
      </div>
      <Reveal className="join-keep" delay={0.2}>
        <b>Keep these handy</b>
        <span><BadgeCheck size={16} /> Your council registration number</span>
        <span><FileCheck2 size={16} /> Registration or degree certificate, or your yoga certificate (PDF, JPG or PNG, up to 10MB)</span>
      </Reveal>
    </section>
  );
}

function Promises() {
  return (
    <section className="promises container">
      <div className="promises-grid">
        {promises.map((p, k) => {
          const Icon = p.icon;
          return (
            <Reveal key={p.title} className="promise" delay={k * 0.08}>
              <Icon size={24} />
              <b>{p.title}</b>
              <p>{p.copy}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function DocCta() {
  return (
    <section className="cta2 cta2-doc">
      <div className="container cta2-inner">
        <Rangoli className="cta2-rangoli" stroke="var(--chandan-300)" petals={[10, 14, 20, 28]} spin={90} />
        <div className="cta2-copy">
          <SplitHeading text={'Register in minutes.\n*It’s free.*'} />
          <Reveal as="p" delay={0.1}>
            Get verified now, and be among the first practitioners patients see when
            Charak launches in your city.
          </Reveal>
          <Reveal className="cta2-actions" delay={0.2}>
            <Link to="/register" className="button button-dark" data-testid="doctors-register-link">
              Register now <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Doctors() {
  return (
    <main className="home2 doc2">
      <DocHero />
      <Eligible />
      <Controls />
      <Bhishak />
      <JoinSteps />
      <Promises />
      <Faq items={faqs} title={'You ask.\n*We answer.*'} />
      <DocCta />
    </main>
  );
}
