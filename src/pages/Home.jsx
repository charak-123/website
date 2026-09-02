import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  House,
  Stethoscope,
  Check,
  HeartPulse,
  Sparkles,
  Video,
  Clock,
  ChevronDown
} from 'lucide-react';

const doctorImage = '/images/stethoscope.jpg';
const charakSageImage = '/images/charak-sage.jpeg';
const teamImage = '/images/care-team.jpg';

const indiaScripts = [
  { word: 'सेवा',  lang: 'Hindi',     family: "'Noto Sans Devanagari', sans-serif" },
  { word: 'சேவை', lang: 'Tamil',     family: "'Noto Sans Tamil', sans-serif" },
  { word: 'సేవ',   lang: 'Telugu',    family: "'Noto Sans Telugu', sans-serif" },
  { word: 'ಸೇವೆ',  lang: 'Kannada',   family: "'Noto Sans Kannada', sans-serif" },
  { word: 'സേവ',  lang: 'Malayalam', family: "'Noto Sans Malayalam', sans-serif" },
  { word: 'সেবা',  lang: 'Bengali',   family: "'Noto Sans Bengali', sans-serif" },
  { word: 'સેવા',  lang: 'Gujarati',  family: "'Noto Sans Gujarati', sans-serif" },
];

const faqs = [
  {
    q: 'Who can register?',
    a: 'MBBS/BDS/BAMS and specialists with a valid registration/license number.'
  },
  {
    q: 'Is there a fee to register?',
    a: 'No. Registration is free. Future commission/payout terms will be shared before you go live and updated in our Terms.'
  },
  {
    q: 'How long does verification take?',
    a: 'Usually 24–48 hours after you submit your certificate.'
  },
  {
    q: 'Do I need to offer home visits?',
    a: 'No. Choose online only, home only, or both.'
  },
  {
    q: 'Is this for emergencies?',
    a: 'No. Charak is for scheduled consultations and visits. Not for emergency, ambulance, or triage services.'
  }
];

export default function Home({ onWaitlist }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <main>
      {/* HERO */}
      <section className="hero container">
        <div className="hero-copy">
          <div className="scripts-row fade-up">
            <div className="scripts-words">
              {indiaScripts.map((s, i) => (
                <React.Fragment key={s.lang}>
                  <span style={{ fontFamily: s.family }} title={s.lang}>{s.word}</span>
                  {i < indiaScripts.length - 1 && <span className="script-sep" aria-hidden="true">·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          <h1 className="fade-up delay-2">
            Healthcare,
            <br />
            <em>ghar tak.</em>
          </h1>
          <p className="hero-sub fade-up delay-2">
            Verified doctors who come to you — at home when you need it, online when you don't. Real care, on your schedule.
          </p>
          <div className="hero-actions fade-up delay-3">
            <Link to="/register" className="button button-dark" data-testid="hero-register-doctor">
              Register as Doctor <ArrowUpRight size={17} />
            </Link>
            <a href="#how-it-works" className="under-link" data-testid="hero-how-it-works">
              See how it works <ArrowRight size={16} />
            </a>
          </div>
          <div className="trust-line fade-up delay-4">
            <ShieldCheck size={16} />
            <span>Manual license verification</span>
            <i />
            <span>No AI diagnosis</span>
            <i />
            <span>Home visits + online consults</span>
          </div>
        </div>

        <div className="hero-art">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="hero-photo" style={{ background: '#fff' }}>
            <img src={doctorImage} alt="Stethoscope and medical equipment on a warm background" data-testid="hero-doctor-image" style={{ objectPosition: 'center 20%' }} />
            <div className="photo-stamp">
              <ShieldCheck size={16} />
              <span>
                Verified
                <br />
                <b>by Charak</b>
              </span>
            </div>
          </div>
          <div className="floating-card floating-card-top">
            <span className="live-dot" />
            Built around real humans
          </div>
          <div className="floating-card floating-card-bottom">
            <span className="mini-icon">
              <House size={16} />
            </span>
            <span>
              <b>Care, at home</b>
              <small>When you need it most</small>
            </span>
          </div>
          <div className="journey-line" aria-hidden="true"><span /><span /><span /></div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="marquee" aria-label="Charak care highlights">
        <div className="marquee-track">
          {[0, 1].map((copyIndex) => (
            <div
              className="marquee-content"
              aria-hidden={copyIndex === 1 ? 'true' : undefined}
              key={copyIndex}
            >
              {['VERIFIED CARE', 'SEVA, REIMAGINED', 'ONLINE OR AT HOME', 'VERIFIED CARE', 'SEVA, REIMAGINED'].map((item, itemIndex) => (
                <React.Fragment key={`${copyIndex}-${itemIndex}`}>
                  {item} <span>✳</span>{' '}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* INTRO PROMISE */}
      <section className="section container intro">
        <div className="section-kicker">01 / THE CHARAK PROMISE</div>
        <div className="intro-grid">
          <h2>
            Care shouldn’t
            <br />
            <em>feel complicated.</em>
          </h2>
          <div>
            <p className="large-copy">
              Charaka, the ancient Indian physician, believed care should travel to people — not the other way around. Charak is built on that same belief: verified doctors and care professionals, online or at your door.
            </p>
            <button className="button button-light" onClick={onWaitlist} data-testid="intro-patient-waitlist">
              Join the patient waitlist <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="heritage-note">
          <span className="heritage-glyph">*</span>
          <div>
            <b>Rooted in parampara.</b>
            <small>Inspired by tradition. Designed for today.</small>
          </div>
          <span className="heritage-script">चरक</span>
        </div>
      </section>

      {/* HERITAGE */}
      <section className="heritage-section">
        <div className="container heritage-grid">
          <div className="heritage-art">
            <img
              src={charakSageImage}
              alt="Maharishi Charak, ancient Indian physician performing eye treatment, painting"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top center',
                filter: 'sepia(0.12) brightness(0.95)',
              }}
            />
            <div className="heritage-stamp">
              चरक
              <small>CARE THAT TRAVELS</small>
            </div>
          </div>
          <div className="heritage-copy">
            <div className="section-kicker">02 / NAMED AFTER CHARAKA</div>
            <h2>
              Care used to
              <br />
              <em>come to you.</em>
            </h2>
            <p className="large-copy">
              Before waiting rooms and crowded corridors, doctors travelled to where people lived. Charak brings that human idea into a modern, verified network - so care can feel closer, calmer, and more personal.
            </p>
            <div className="heritage-quote">Charaka held that the physician who travels to the patient carries more healing than one who waits to be found.</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section section-blue">
        <div className="container" style={{ position: 'relative' }}>
          <div className="section-kicker">03 / A SIMPLE START</div>
          <div className="section-heading">
            <h2>How care finds you</h2>
            <p>Three steps from your need to the right human support.</p>
          </div>
          <div className="steps">
            <div className="step-card">
              <span>01</span>
              <div className="step-visual visual-register">
                <div className="visual-line short" />
                <div className="visual-line" />
                <div className="visual-line" />
                <div className="visual-pill">3 min</div>
              </div>
              <div className="step-icon">
                <Stethoscope />
              </div>
              <h3>Share your need</h3>
              <p>Tell us what kind of support feels right for you and your family.</p>
            </div>

            <div className="step-card">
              <span>02</span>
              <div className="step-visual visual-verify">
                <div className="pulse-ring">
                  <ShieldCheck size={21} />
                </div>
                <div className="verified-chip">
                  <Check size={11} /> Care team checked
                </div>
              </div>
              <div className="step-icon">
                <ShieldCheck />
              </div>
              <h3>Meet the right person</h3>
              <p>Choose from verified doctors, Ayurveda practitioners, nurses, and therapists.</p>
            </div>

            <div className="step-card">
              <span>03</span>
              <div className="step-visual visual-live">
                <div className="live-profile">
                  <span className="live-avatar">
                    <HeartPulse size={15} />
                  </span>
                  <span>
                    <b>Care at your door</b>
                    <small>Online or home visit</small>
                  </span>
                  <i />
                </div>
                <div className="live-bars">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="step-icon">
                <Sparkles />
              </div>
              <h3>Care comes closer</h3>
              <p>Receive a thoughtful online consultation or a home visit on your schedule.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section care-forms container">
        <div className="section-kicker">04 / MANY WAYS TO CARE</div>
        <div className="care-forms-heading">
          <h2>
            One network.
            <br />
            <em>Many kinds of care.</em>
          </h2>
          <p>Different traditions, one human approach to helping people feel better.</p>
        </div>
        <div className="care-grid">
          <div className="care-tile care-ayurveda"><span className="care-symbol">आ</span><b>Ayurveda</b><small>Rooted in wisdom</small></div>
          <div className="care-tile care-nurse"><span className="care-symbol">+</span><b>Nursing care</b><small>Support at home</small></div>
          <div className="care-tile care-physio"><span className="care-symbol">↗</span><b>Physiotherapy</b><small>Move with confidence</small></div>
          <div className="care-tile care-online"><span className="care-symbol">⌁</span><b>Online consults</b><small>Care, wherever you are</small></div>
        </div>
      </section>

      {/* FOR DOCTORS */}
      <section id="for-doctors" className="section container doctors">
        <div className="doctor-image">
          <img src={teamImage} alt="Physiotherapist providing back treatment" data-testid="doctor-team-image" />
          <div className="image-caption">
            <span>
              For the people
              <br />
              <em>who care.</em>
            </span>
            <ArrowUpRight />
          </div>
        </div>

        <div className="doctor-content">
          <div className="section-kicker">05 / FOR DOCTORS</div>
          <h2>
            Built for how
            <br />
            <em>you actually practice.</em>
          </h2>
          <p>More control. Less friction. A platform that respects the way good doctors, nurses, and care professionals work.</p>

          <div className="feature-list">
            <div>
              <Video />
              <span>
                <b>Your channels, your choice</b>
                <small>Offer online consults, home visits, or both.</small>
              </span>
            </div>
            <div>
              <Clock />
              <span>
                <b>Your schedule, your radius</b>
                <small>Weekly recurring slots. Pick a 2/3/5 km home-visit radius.</small>
              </span>
            </div>
            <div>
              <ShieldCheck />
              <span>
                <b>Verification that means something</b>
                <small>Every doctor is manually verified. No anonymous listings.</small>
              </span>
            </div>
          </div>

          <Link to="/register" className="under-link" data-testid="doctors-register-link">
            Register as a doctor <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* TRUST */}
      <section className="trust-section">
        <div className="container trust-inner">
          <div>
            <div className="section-kicker">06 / TRUST, BY DESIGN</div>
            <h2>
              Old wisdom.
              <br />
              <em>New access.</em>
            </h2>
          </div>
          <div>
            <p className="large-copy">
              Charak never substitutes triage or AI diagnosis. Patient intake is reviewed by the doctor directly. Every listing shows verification status, and every home-visit procedure bill is at your fixed rates - nothing hidden.
            </p>
            <div className="trust-badges">
              <span>
                <ShieldCheck size={16} /> Manually verified
              </span>
              <span>
                <HeartPulse size={16} /> Doctor-led care
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section container faq">
        <div className="section-kicker">07 / QUESTIONS, ANSWERED</div>
        <div className="faq-grid">
          <h2>
            Good to
            <br />
            <em>know.</em>
          </h2>
          <div>
            {faqs.map((item, index) => (
              <div
                key={index}
                className={`faq-item ${activeFaq === index ? 'active' : ''}`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  data-testid={`faq-question-${index}`}
                >
                  <span>{item.q}</span>
                  <ChevronDown size={18} />
                </button>
                {activeFaq === index && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <div className="eyebrow">FOR PATIENTS &amp; FAMILIES</div>
            <h2>
              Care that
              <br />
              <em>comes to you.</em>
            </h2>
          </div>
          <div>
            <p>Join the early access list and we’ll tell you when Charak launches in your city.</p>
            <button className="button button-dark" onClick={onWaitlist} data-testid="bottom-patient-waitlist">
              Join launch updates <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
