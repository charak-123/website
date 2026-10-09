import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Footprints,
  HeartHandshake,
  House,
  IndianRupee,
  Leaf,
  MapPin,
  Plus,
  ShieldCheck,
  Siren,
  Smile,
  Stethoscope,
  Syringe,
  Thermometer,
  Video
} from 'lucide-react';
import { Parallax, Rangoli, Reveal, SplitHeading, VelocityMarquee, ease } from '../components/motion';
import Faq from '../components/Faq';
import '../styles/home.css';

const sageImage = '/images/charak-sage.jpeg';

/* ---------------------------------------------------------------- content */

// Family words from across India, so every visitor finds their own home here.
const forWhom = [
  'Amma’s monthly BP check.',
  'Baba’s knee physio.',
  'the little one’s fever, at 11 pm.',
  'Dadi’s sugar report.',
  'Appa’s dressing after surgery.',
  'you, too.'
];

const greetings = [
  { word: 'नमस्ते', lang: 'hi', cls: 'deva' },
  { word: 'வணக்கம்', lang: 'ta', cls: 'tamil' },
  { word: 'নমস্কার', lang: 'bn', cls: 'bengali' },
  { word: 'నమస్కారం', lang: 'te', cls: 'telugu' },
  { word: 'ನಮಸ್ಕಾರ', lang: 'kn', cls: 'kannada' },
  { word: 'നമസ്കാരം', lang: 'ml', cls: 'malayalam' },
  { word: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', lang: 'pa', cls: 'gurmukhi' },
  { word: 'નમસ્તે', lang: 'gu', cls: 'gujarati' }
];

const heroStory = [
  {
    tag: 'Requested',
    tone: 'requested',
    icon: House,
    title: 'BP check for Amma',
    meta: 'Home visit · Today, 5:30 PM'
  },
  {
    tag: 'Accepted',
    tone: 'accepted',
    icon: BadgeCheck,
    title: 'Your doctor said yes',
    meta: 'General Physician · Verified'
  },
  {
    tag: 'On the way',
    tone: 'confirmed',
    icon: Footprints,
    title: 'Doctor is on the way',
    meta: '12 minutes away'
  }
];

const scripts = [
  { word: 'सेवा', lang: 'hi', cls: 'deva' },
  { word: 'சேவை', lang: 'ta', cls: 'tamil' },
  { word: 'సేవ', lang: 'te', cls: 'telugu' },
  { word: 'ಸೇವೆ', lang: 'kn', cls: 'kannada' },
  { word: 'സേവ', lang: 'ml', cls: 'malayalam' },
  { word: 'সেবা', lang: 'bn', cls: 'bengali' },
  { word: 'સેવા', lang: 'gu', cls: 'gujarati' },
  { word: 'ਸੇਵਾ', lang: 'pa', cls: 'gurmukhi' }
];

const moments = [
  {
    time: '11:40 PM',
    who: 'Kutty',
    script: 'குட்டி',
    lang: 'ta',
    cls: 'tamil',
    line: 'The fever just won’t come down.',
    answer: 'An online consult with a verified doctor. No clinic queue at midnight.',
    icon: Thermometer,
    tone: 'blue'
  },
  {
    time: '7:00 AM',
    who: 'Dadi',
    script: 'दादी',
    lang: 'hi',
    cls: 'deva',
    line: 'Her monthly BP check.',
    answer: 'The doctor comes home. Dadi doesn’t have to go anywhere.',
    icon: House,
    tone: 'chandan'
  },
  {
    time: '6:15 PM',
    who: 'Baba',
    script: 'বাবা',
    lang: 'bn',
    cls: 'bengali',
    line: 'Physio after his knee surgery.',
    answer: 'A physiotherapist at your door, on Baba’s schedule.',
    icon: Footprints,
    tone: 'sage'
  },
  {
    time: '2:00 PM',
    who: 'Amma',
    script: 'അമ്മ',
    lang: 'ml',
    cls: 'malayalam',
    line: 'Her sugar report needs explaining.',
    answer: 'A straight conversation with a real doctor, on video.',
    icon: Stethoscope,
    tone: 'ink'
  },
  {
    time: 'Anytime',
    who: 'You',
    script: 'તમે',
    lang: 'gu',
    cls: 'gujarati',
    line: 'Looking after yourself matters too.',
    answer: 'Ayurveda, nursing, physio and general care. All in one place.',
    icon: HeartHandshake,
    tone: 'marigold'
  }
];

const pillars = [
  { deva: 'भिषक्', roman: 'Bhishak', en: 'The physician', now: 'Every doctor on Charak is manually verified before they appear.' },
  { deva: 'द्रव्य', roman: 'Dravya', en: 'The remedy', now: 'Treatment decided by the doctor, never by an algorithm.' },
  { deva: 'उपस्थाता', roman: 'Upasthata', en: 'The caregiver', now: 'Nurses, physios and family, all part of the care.' },
  { deva: 'रोगी', roman: 'Rogi', en: 'The patient', now: 'You, at home, at the centre of it all.' }
];

const steps = [
  {
    n: '01',
    title: 'Tell us what’s wrong',
    copy: 'Pick what you need: a doctor, a nurse, a physio, Ayurveda. Online or at home.',
    icon: Smile
  },
  {
    n: '02',
    title: 'Choose a verified doctor',
    copy: 'See who is near you, their verification, and the fee up front. No surprises later.',
    icon: ShieldCheck
  },
  {
    n: '03',
    title: 'Care comes to you',
    copy: 'A video consult from your sofa, or a home visit at the time you picked.',
    icon: House
  }
];

const careKinds = [
  { icon: Stethoscope, name: 'General physician', note: 'Fever, BP, sugar, checkups', tone: 'blue' },
  { icon: Leaf, name: 'Ayurveda', note: 'Rooted in tradition', tone: 'chandan' },
  { icon: Syringe, name: 'Nursing care', note: 'Dressings, injections, elder care', tone: 'sage' },
  { icon: Footprints, name: 'Physiotherapy', note: 'Back on your feet, at home', tone: 'clay' },
  { icon: Smile, name: 'Dentistry', note: 'Consults and follow-ups', tone: 'ink' },
  { icon: Video, name: 'Online consults', note: 'Care, wherever you are', tone: 'sky' }
];

const faqs = [
  {
    q: 'When can I book a doctor?',
    a: 'Charak isn’t live yet. Join the waitlist and we’ll tell you as soon as it reaches your city.'
  },
  {
    q: 'Are the doctors really verified?',
    a: 'Yes. Our team checks every doctor’s registration and certificates by hand before they can appear on Charak. No anonymous listings.'
  },
  {
    q: 'Home visit or online, which one do I get?',
    a: 'You choose. Many doctors offer both, so you can pick a video consult or a visit at home when you book.'
  },
  {
    q: 'How much will it cost?',
    a: 'Each doctor sets their own fee, and you see it before you book. Procedures during a home visit are billed at the doctor’s fixed rates, so there are no surprises.'
  },
  {
    q: 'Does Charak diagnose me?',
    a: 'No. Charak never diagnoses or triages, and there is no AI deciding anything. Your doctor reads your concern and advises you directly.'
  },
  {
    q: 'Is this for emergencies?',
    a: 'No. Charak is for scheduled consultations and visits. In an emergency, please call 112 or go to the nearest hospital.'
  }
];

/* ------------------------------------------------------------------- hero */

function RotatingLine() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % forWhom.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="rotator" aria-live="off">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={i}
          className="rotator-item"
          initial={reduce ? { opacity: 0 } : { y: '100%', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={reduce ? { opacity: 0 } : { y: '-100%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.55, ease }}
        >
          {forWhom[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function StoryCard() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % heroStory.length), 2800);
    return () => clearInterval(t);
  }, []);
  const s = heroStory[step];
  const Icon = s.icon;

  return (
    <motion.div
      className="story-card"
      initial={{ opacity: 0, y: 40, rotate: -4 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ delay: 0.9, duration: 1, ease }}
    >
      <div className="story-top">
        <span className="story-label">App preview</span>
        <div className="story-progress" aria-hidden="true">
          {heroStory.map((_, k) => (
            <span key={k} className={k <= step ? 'on' : ''} />
          ))}
        </div>
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={step}
          className="story-body"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.97 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className={`story-icon tone-${s.tone}`}>
            <Icon size={20} />
          </span>
          <span className="story-text">
            <b>{s.title}</b>
            <small>{s.meta}</small>
          </span>
          <span className={`status-chip tone-${s.tone}`}>{s.tag}</span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function Greeting() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % greetings.length), 2200);
    return () => clearInterval(t);
  }, []);
  const g = greetings[i];
  return (
    <span className="hx-pill-deva">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={g.lang}
          lang={g.lang}
          className={`script-${g.cls}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease }}
        >
          {g.word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Hero({ onWaitlist }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const artY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const copyY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  return (
    <section className="hx" ref={ref}>
      <div className="container hx-grid">
        <motion.div className="hx-copy" style={{ y: copyY, opacity: fade }}>
          <motion.div
            className="hx-pill"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="pulse-dot" />
            Launching soon in India
            <Greeting />
          </motion.div>

          <SplitHeading as="h1" className="hx-title" text={'Healthcare,\n*ghar tak.*'} onMount delay={0.15} underline />

          <motion.p
            className="hx-for"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <span className="hx-for-label">For</span> <RotatingLine />
          </motion.p>

          <motion.p
            className="hx-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.8, ease }}
          >
            Verified doctors, nurses and physios who come to your home when you need them,
            and on video when you don’t. Care that feels like family.
          </motion.p>

          <motion.div
            className="hx-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8, ease }}
          >
            <button className="button button-dark" onClick={onWaitlist} data-testid="hero-patient-waitlist">
              Join the waitlist <ArrowRight size={18} />
            </button>
            <Link to="/doctors" className="hx-doc-link" data-testid="hero-register-doctor">
              <Stethoscope size={17} /> I’m a doctor
            </Link>
          </motion.div>

          <motion.a
            href="#apnapan"
            className="hx-scroll"
            data-testid="hero-how-it-works"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <span className="hx-scroll-line" />
            Meet the families
          </motion.a>
        </motion.div>

        <motion.div className="hx-art" style={{ y: artY }}>
          <Rangoli className="hx-rangoli" stroke="var(--chandan-400)" />
          <motion.div
            className="arch"
            initial={{ clipPath: 'inset(100% 0 0 0 round 200px 200px 26px 26px)' }}
            animate={{ clipPath: 'inset(0% 0 0 0 round 200px 200px 26px 26px)' }}
            transition={{ duration: 1.3, ease, delay: 0.2 }}
          >
            <div className="arch-sun" />
            <motion.div
              role="img"
              aria-label="Charak emblem: the sage Charaka with a staff, serpent and leaves"
              className="arch-logo"
              data-testid="hero-doctor-image"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 1.1, ease }}
            />
            <svg className="arch-hills" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 80 C 60 40, 120 40, 180 70 S 300 110, 400 60 L400 120 L0 120Z" fill="var(--sage-300)" opacity=".55" />
              <path d="M0 100 C 80 70, 160 80, 220 95 S 340 110, 400 90 L400 120 L0 120Z" fill="var(--sage-500)" opacity=".7" />
            </svg>
          </motion.div>

          <StoryCard />

          <motion.div
            className="float-chip chip-verified"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, type: 'spring', stiffness: 260, damping: 16 }}
          >
            <ShieldCheck size={16} /> Manually verified
          </motion.div>
          <motion.div
            className="float-chip chip-radius"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 16 }}
          >
            <MapPin size={16} /> Within 2 km
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- sections */

function ScriptBand() {
  return (
    <section className="band" aria-label="Seva, in the languages of India">
      <VelocityMarquee className="band-row" baseVelocity={-2}>
        {scripts.map((s) => (
          <span key={s.lang} className="band-item">
            <span lang={s.lang} className={`script-${s.cls}`}>{s.word}</span>
            <span className="band-star" aria-hidden="true">✺</span>
          </span>
        ))}
      </VelocityMarquee>
      <VelocityMarquee className="band-row band-row-sub" baseVelocity={1.5}>
        {['Verified doctors', 'Care at home', 'Online consults', 'No AI diagnosis', 'Fees up front', 'Like family'].map((t) => (
          <span key={t} className="band-item band-item-sub">
            {t}
            <Plus size={16} aria-hidden="true" />
          </span>
        ))}
      </VelocityMarquee>
    </section>
  );
}

function Moments() {
  const wrap = useRef(null);
  const track = useRef(null);
  const [distance, setDistance] = useState(0);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return;
      const pad = window.innerWidth < 700 ? 16 : 48;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + pad));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] });
  const x = useSpring(useTransform(scrollYProgress, [0, 1], [0, -distance]), { stiffness: 120, damping: 30, mass: 0.4 });
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const pinned = distance > 0 && !reduce;

  return (
    <section
      id="apnapan"
      className={`moments ${pinned ? 'is-pinned' : ''}`}
      ref={wrap}
      style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}
    >
      <div className="moments-sticky">
        <div className="container moments-head">
          <div>
            <SplitHeading text={'Every home has\n*its own story.*'} />
          </div>
          <Reveal as="p" className="moments-lead" delay={0.2}>
            Every family has someone who needs looking after. Charak is built for those
            everyday moments, not just emergencies.
          </Reveal>
        </div>

        <motion.div className="moments-track" ref={track} style={pinned ? { x } : undefined}>
          {moments.map((m, k) => {
            const Icon = m.icon;
            return (
              <motion.article
                key={m.who}
                className={`moment tone-${m.tone}`}
                initial={{ opacity: 0, y: 50, rotate: k % 2 ? 2 : -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: k % 2 ? 1 : -1 }}
                whileHover={{ rotate: 0, y: -8 }}
                viewport={{ once: true, margin: '0px -5% 0px 0px' }}
                transition={{ duration: 0.8, ease, delay: k * 0.08 }}
              >
                <div className="moment-top">
                  <span className="moment-time">{m.time}</span>
                  <span className="moment-icon"><Icon size={22} /></span>
                </div>
                <div className="moment-who">
                  {m.who}
                  <span lang={m.lang} className={`moment-script script-${m.cls}`}>{m.script}</span>
                </div>
                <h3 className="moment-line">“{m.line}”</h3>
                <p className="moment-answer">
                  <Check size={16} /> {m.answer}
                </p>
              </motion.article>
            );
          })}
        </motion.div>

        {pinned && (
          <div className="container moments-progress" aria-hidden="true">
            <motion.span style={{ width: bar }} />
          </div>
        )}
      </div>
    </section>
  );
}

function Heritage() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const giantX = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['12%', '-28%']);

  return (
    <section className="heritage2" ref={ref}>
      <motion.div className="heritage2-giant" style={{ x: giantX }} aria-hidden="true" lang="hi">
        चरक संहिता
      </motion.div>

      <div className="container heritage2-grid">
        <Parallax className="heritage2-art" offset={40}>
          <div className="heritage2-frame">
            <img
              src={sageImage}
              alt="Painting of the sage Charaka treating a patient's eyes"
              data-testid="doctor-team-image"
            />
          </div>
          <div className="heritage2-seal" lang="hi">
            <span>चरक</span>
            <small>Father of Ayurveda</small>
          </div>
        </Parallax>

        <div className="heritage2-copy">
          <SplitHeading text={'Two thousand years ago,\n*the vaidya came home.*'} />
          <Reveal as="p" className="large-copy">
            Charaka, the physician behind the Charaka Samhita, wrote that healing stands on
            four feet. We took that idea, and built a modern, verified network around it.
          </Reveal>
        </div>
      </div>

      <div className="container">
        <Reveal className="pillars-head">
          <span lang="sa" className="pillars-deva">चिकित्सा चतुष्पाद</span>
          <span>The four feet of healing</span>
        </Reveal>
        <div className="pillars">
          {pillars.map((p, k) => (
            <Reveal key={p.roman} className="pillar" delay={k * 0.1}>
              <span className="pillar-n">0{k + 1}</span>
              <span className="pillar-deva" lang="hi">{p.deva}</span>
              <b>{p.roman} <small>· {p.en}</small></b>
              <p>{p.now}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const draw = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="how-it-works" className="how" ref={ref}>
      <div className="container">
        <div className="how-head">
          <SplitHeading text={'Three steps.\n*That’s it.*'} />
          <Reveal as="p" className="how-lead" delay={0.15}>
            From “something feels off” to a doctor at your side.
          </Reveal>
        </div>

        <div className="how-steps">
          <svg className="how-path" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M20 120 C 180 20, 300 200, 500 110 S 820 10, 980 100"
              stroke="var(--chandan-200)"
              strokeWidth="2"
              strokeDasharray="2 10"
              strokeLinecap="round"
              fill="none"
            />
            <motion.path
              d="M20 120 C 180 20, 300 200, 500 110 S 820 10, 980 100"
              stroke="var(--chandan-400)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              style={{ pathLength: draw }}
            />
          </svg>

          {steps.map((s, k) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.n} className="how-step" delay={k * 0.15}>
                <motion.span
                  className="how-icon"
                  whileHover={{ rotate: -10, scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                >
                  <Icon size={26} />
                </motion.span>
                <span className="how-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CareKinds() {
  return (
    <section className="kinds container">
      <div className="kinds-head">
        <div>
          <SplitHeading text={'One network.\n*Every kind of care.*'} />
        </div>
        <Reveal as="p" delay={0.2}>
          Different traditions, one human approach to helping people feel better.
        </Reveal>
      </div>
      <div className="kinds-grid">
        {careKinds.map((c, k) => {
          const Icon = c.icon;
          return (
          <motion.div
            key={c.name}
            className={`kind tone-${c.tone}`}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 0.7, ease, delay: (k % 3) * 0.08 }}
          >
            <span className="kind-glyph"><Icon size={30} strokeWidth={1.75} /></span>
            <div>
              <b>{c.name}</b>
              <small>{c.note}</small>
            </div>
            <ArrowUpRight className="kind-arrow" size={22} />
          </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* Crossover to the doctors' side, the way Uber's rider page points to
   "Drive" or Airbnb's to "Become a host". */
function DoctorBridge() {
  return (
    <section className="bridge container">
      <Reveal className="bridge-card">
        <div className="bridge-copy">
          <span className="bridge-tag"><Stethoscope size={15} /> For practitioners</span>
          <h2>Doctor, nurse, physio or yoga practitioner? <em>Bring your practice home.</em></h2>
          <p>Home visits and online sessions, on your schedule and at your rates. Free to register.</p>
          <Link to="/doctors" className="button button-dark" data-testid="bridge-doctors">
            See Charak for practitioners <ArrowRight size={18} />
          </Link>
        </div>
        <div className="bridge-preview" aria-hidden="true">
          <div className="bridge-req">
            <span className="bridge-req-top">
              <b>New request</b>
              <span className="status-chip tone-requested">1.8 km</span>
            </span>
            <span className="bridge-req-title">BP check at home</span>
            <span className="bridge-req-meta">Today · 5:30 PM</span>
            <span className="bridge-req-actions">
              <i className="yes">Accept</i>
              <i>Decline</i>
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Trust() {
  const items = [
    { icon: BadgeCheck, title: 'Every doctor verified', copy: 'Every license is checked by a person before anyone can book.' },
    { icon: Stethoscope, title: 'No AI diagnosis', copy: 'Your doctor reads your concern directly. Charak never triages or diagnoses.' },
    { icon: IndianRupee, title: 'Fees up front', copy: 'You see the fee before you book. Home procedures at fixed rates, nothing hidden.' },
    { icon: Siren, title: 'Not for emergencies', copy: 'For anything urgent, please call 112 or go to the nearest hospital.' }
  ];
  return (
    <section className="trust2 container">
      <div className="trust2-head">
        <SplitHeading text={'Old wisdom.\n*New trust.*'} />
      </div>
      <div className="trust2-grid">
        {items.map((t, k) => {
          const Icon = t.icon;
          return (
            <Reveal key={t.title} className="trust2-item" delay={k * 0.08}>
              <Icon size={24} />
              <b>{t.title}</b>
              <p>{t.copy}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function FinalCta({ onWaitlist }) {
  return (
    <section className="cta2">
      <div className="container cta2-inner">
        <Rangoli className="cta2-rangoli" stroke="var(--chandan-200)" petals={[10, 14, 20, 28]} spin={90} />
        <div className="cta2-copy">
          <SplitHeading text={'Coming soon\n*to your city.*'} />
          <Reveal as="p" delay={0.1}>
            Join the early list and we’ll tell you the day Charak reaches your city.
            One message. No spam, promise.
          </Reveal>
          <Reveal className="cta2-actions" delay={0.2}>
            <button className="button button-dark" onClick={onWaitlist} data-testid="bottom-patient-waitlist">
              Notify me <ArrowRight size={18} />
            </button>
            <Link to="/doctors" className="cta2-link" data-testid="intro-patient-waitlist">
              <Leaf size={16} /> Are you a doctor? See Charak for doctors
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Home({ onWaitlist }) {
  return (
    <main className="home2">
      <Hero onWaitlist={onWaitlist} />
      <ScriptBand />
      <Moments />
      <Heritage />
      <HowItWorks />
      <CareKinds />
      <Trust />
      <DoctorBridge />
      <Faq items={faqs} />
      <FinalCta onWaitlist={onWaitlist} />
    </main>
  );
}
