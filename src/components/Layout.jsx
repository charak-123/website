import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, UserRound } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { getLenis, useSmoothScroll } from './motion';

/* Tucks the nav away while reading down the page and brings it back on
   the way up. */
function useNavState() {
  const [state, setState] = useState({ scrolled: false, hidden: false });
  const last = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const down = y > last.current;
      last.current = y;
      setState({ scrolled: y > 12, hidden: down && y > 420 });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return state;
}

function FooterWordmark() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['40%', '0%']);
  return (
    <div className="footer-giant" ref={ref} aria-hidden="true" lang="hi">
      <motion.span style={{ y }}>चरक</motion.span>
    </div>
  );
}

const audienceLinks = {
  families: [
    { href: '/#apnapan', label: 'Why Charak', id: 'nav-why' },
    { href: '/#how-it-works', label: 'How it works', id: 'nav-how-it-works' },
    { href: '/#faq', label: 'FAQ', id: 'nav-faq' }
  ],
  doctors: [
    { href: '/doctors#why', label: 'Why Charak', id: 'nav-doctors-why' },
    { href: '/doctors#join', label: 'How joining works', id: 'nav-doctors-join' },
    { href: '/doctors#faq', label: 'FAQ', id: 'nav-doctors-faq' }
  ]
};

/* "Families | Practitioners" switch, the way Uber splits Ride and Drive. Each
   side has its own home page, nav and colour scheme. */
function AudienceSwitch({ audience, onPick }) {
  return (
    <div className="aud" role="tablist" aria-label="Who is Charak for">
      {[
        { key: 'families', to: '/', label: 'Families' },
        { key: 'doctors', to: '/doctors', label: 'Practitioners' }
      ].map((o) => (
        <Link
          key={o.key}
          to={o.to}
          role="tab"
          aria-selected={audience === o.key}
          className={audience === o.key ? 'on' : ''}
          onClick={onPick}
          data-testid={`audience-${o.key}`}
        >
          {audience === o.key && (
            <motion.span layoutId="aud-pill" className="aud-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
          )}
          <span>{o.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default function Layout({ children, onWaitlist }) {
  const [open, setOpen] = useState(false);
  const { user, ready, signOut } = useAuth();
  const { pathname } = useLocation();
  // The register page opens with the sign-in step, so a second prompt to sign
  // in would just be noise on top of it.
  const onAuthPage = pathname.startsWith('/register');
  const audience = pathname.startsWith('/doctors') || onAuthPage ? 'doctors' : 'families';
  const doctorSide = pathname.startsWith('/doctors') || onAuthPage;
  const nav = useNavState();
  useSmoothScroll();

  useEffect(() => {
    setOpen(false);
    if (window.location.hash) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  const close = () => setOpen(false);
  const account = ready && user;

  return (
    <div className={`site-shell${doctorSide ? ' theme-doc' : ''}`} data-audience={audience}>
      <header className={`nav-wrap${nav.scrolled ? ' is-scrolled' : ''}${nav.hidden && !open ? ' is-hidden' : ''}`}>
        <nav className="nav container" data-testid="site-navigation">
          <Link to={audience === 'doctors' ? '/doctors' : '/'} className="brand" aria-label="Charak" data-testid="brand-home-link">
            <img
              className="brand-mark"
              src="/images/charak-mark.png"
              alt=""
              width="34"
              height="39"
            />
            <span className="brand-word" lang="hi">चरक</span>
          </Link>

          <AudienceSwitch audience={audience} onPick={close} />

          <div className={`nav-links ${open ? 'is-open' : ''}`}>
            {audienceLinks[audience].map((l) => (
              <a key={l.id} href={l.href} data-testid={l.id} onClick={close}>
                {l.label}
              </a>
            ))}
            <Link to="/contact" data-testid="nav-contact" onClick={close}>
              Contact
            </Link>
            {audience === 'families' ? (
              <button
                className="text-btn nav-mobile-only nav-mobile-cta"
                onClick={() => {
                  close();
                  onWaitlist();
                }}
                data-testid="nav-mobile-waitlist"
              >
                Join the waitlist
              </button>
            ) : (
              <>
                <Link className="nav-mobile-only nav-mobile-cta" to="/register" onClick={close} data-testid="nav-mobile-register">
                  Register as a practitioner
                </Link>
                {account ? (
                  <button
                    className="text-btn nav-mobile-only"
                    onClick={() => {
                      close();
                      signOut();
                    }}
                    data-testid="nav-mobile-sign-out"
                  >
                    Sign out ({user.phoneNumber})
                  </button>
                ) : (
                  <Link className="nav-mobile-only" to="/register" onClick={close} data-testid="nav-mobile-sign-in">
                    Practitioner sign in
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="nav-actions">
            {/* A signed-in doctor can sign out from either side of the site. */}
            {account && (
              <span className="nav-account" data-testid="nav-account">
                <UserRound size={14} />
                <span className="nav-account-email">{user.phoneNumber}</span>
                <button className="link-btn" onClick={() => signOut()} data-testid="nav-sign-out">
                  Sign out
                </button>
              </span>
            )}
            {audience === 'families' ? (
              <button className="button button-dark button-small" onClick={onWaitlist} data-testid="nav-patient-waitlist">
                Join the waitlist <ArrowUpRight size={15} />
              </button>
            ) : (
              <>
                {!account && (
                  !onAuthPage && (
                    <Link className="text-btn nav-signin" to="/register" data-testid="nav-sign-in">
                      Sign in
                    </Link>
                  )
                )}
                {!onAuthPage && (
                  <Link className="button button-dark button-small" to="/register" data-testid="nav-register-doctor">
                    Register <ArrowUpRight size={15} />
                  </Link>
                )}
              </>
            )}
            <button
              className="menu-btn"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
              data-testid="mobile-menu-button"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>

      <motion.div
        key={audience}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Link to="/" className="brand footer-brand" aria-label="Charak" data-testid="footer-brand-link">
              <span className="brand-mark brand-mark-chip">
                <img src="/images/charak-mark.png" alt="" width="26" height="30" />
              </span>
              <span className="brand-word" lang="hi">चरक</span>
            </Link>
            <p className="footer-tag">
              Verified care.
              <br />
              <em>Online, or at home.</em>
            </p>
          </div>

          <div>
            <p className="footer-label">For families</p>
            <a href="/#how-it-works" data-testid="footer-how-it-works">How it works</a>
            <a href="/#faq" data-testid="footer-faq">FAQ</a>
            <button className="footer-link-btn" onClick={onWaitlist} data-testid="footer-waitlist">
              Join the waitlist
            </button>
          </div>

          <div>
            <p className="footer-label">For practitioners</p>
            <Link to="/doctors" data-testid="footer-doctors">Why Charak</Link>
            <Link to="/register" data-testid="footer-register">Register</Link>
            <Link to="/register" data-testid="footer-signin">Sign in</Link>
            <a href="/doctors#faq" data-testid="footer-doctors-faq">Practitioner FAQ</a>
          </div>

          <div>
            <p className="footer-label">Legal &amp; support</p>
            <Link to="/privacy" data-testid="footer-privacy">Privacy Policy</Link>
            <Link to="/terms" data-testid="footer-terms">Terms of Service</Link>
            <Link to="/telemedicine" data-testid="footer-telemedicine">Telemedicine consent</Link>
            <Link to="/disclaimer" data-testid="footer-disclaimer">Medical Disclaimer</Link>
            <Link to="/contact" data-testid="footer-contact">Contact &amp; Grievance Officer</Link>
          </div>

          <div>
            <p className="footer-label">Get in touch</p>
            <a href="mailto:upcharchikitsa@gmail.com" data-testid="footer-email">
              upcharchikitsa@gmail.com
            </a>
            <a href="tel:+918655044414" data-testid="footer-phone">
              +91 86550 44414
            </a>
            <span data-testid="footer-address">[Registered Address — placeholder]</span>
          </div>
        </div>

        <FooterWordmark />

        <div className="container footer-bottom">
          <span data-testid="footer-copyright">© 2026 Charak. All rights reserved.</span>
          <span>Made with apnapan in India.</span>
          <span>Inspired by Maharishi Charak — the father of Indian medicine.</span>
        </div>
      </footer>
    </div>
  );
}
