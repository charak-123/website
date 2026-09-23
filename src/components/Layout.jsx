import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, onWaitlist }) {
  const [open, setOpen] = useState(false);
  const { user, ready, signOut } = useAuth();
  const { pathname } = useLocation();
  // The auth page carries its own identity; a "Sign in" button on top of it
  // would just be noise.
  const onAuthPage = pathname === '/signin' || pathname === '/signup';

  return (
    <div className="site-shell">
      <header className="nav-wrap">
        <nav className="nav container" data-testid="site-navigation">
          <Link to="/" className="brand" aria-label="Charak" data-testid="brand-home-link">
            <img
              className="brand-mark"
              src="/images/charak-mark.png"
              alt=""
              width="34"
              height="39"
            />
            <span className="brand-word" lang="hi">चरक</span>
          </Link>
          <div className={`nav-links ${open ? 'is-open' : ''}`}>
            <a href="/#how-it-works" data-testid="nav-how-it-works" onClick={() => setOpen(false)}>
              How it works
            </a>
            <a href="/#for-doctors" data-testid="nav-for-doctors" onClick={() => setOpen(false)}>
              For Doctors
            </a>
            <a href="/#faq" data-testid="nav-faq" onClick={() => setOpen(false)}>
              FAQ
            </a>
            <Link to="/contact" data-testid="nav-contact" onClick={() => setOpen(false)}>
              Contact
            </Link>
            <Link
              className="nav-mobile-only"
              to="/register"
              onClick={() => setOpen(false)}
              data-testid="nav-mobile-register"
            >
              Register as Doctor
            </Link>
            {ready && user ? (
              <button
                className="text-btn nav-mobile-only"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                data-testid="nav-mobile-sign-out"
              >
                Sign out ({user.email})
              </button>
            ) : (
              <Link
                className="nav-mobile-only"
                to="/signin"
                onClick={() => setOpen(false)}
                data-testid="nav-mobile-sign-in"
              >
                Doctor sign in
              </Link>
            )}
          </div>
          <div className="nav-actions">
            <button className="text-btn" onClick={onWaitlist} data-testid="nav-patient-waitlist">
              Join patient waitlist
            </button>

            {ready && user ? (
              <span className="nav-account" data-testid="nav-account">
                <UserRound size={14} />
                <span className="nav-account-email">{user.email}</span>
                <button className="link-btn" onClick={() => signOut()} data-testid="nav-sign-out">
                  Sign out
                </button>
              </span>
            ) : (
              !onAuthPage && (
                <Link className="text-btn nav-signin" to="/signin" data-testid="nav-sign-in">
                  Doctor sign in
                </Link>
              )
            )}

            <Link
              className="button button-dark button-small"
              to="/register"
              data-testid="nav-register-doctor"
            >
              Register as Doctor <ArrowUpRight size={15} />
            </Link>
            <button
              className="menu-btn"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              data-testid="mobile-menu-button"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>

      {children}

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
              Verified doctors.
              <br />
              Online or at home.
            </p>
          </div>

          <div>
            <p className="footer-label">Explore</p>
            <a href="/#how-it-works" data-testid="footer-how-it-works">
              How it works
            </a>
            <a href="/#for-doctors" data-testid="footer-doctors">
              For Doctors
            </a>
            <a href="/#faq" data-testid="footer-faq">
              FAQ
            </a>
          </div>

          <div>
            <p className="footer-label">Legal &amp; support</p>
            <Link to="/privacy" data-testid="footer-privacy">
              Privacy Policy
            </Link>
            <Link to="/terms" data-testid="footer-terms">
              Terms of Service
            </Link>
            <Link to="/disclaimer" data-testid="footer-disclaimer">
              Medical Disclaimer
            </Link>
            <Link to="/contact" data-testid="footer-contact">
              Contact &amp; Grievance Officer
            </Link>
          </div>

          <div>
            <p className="footer-label">Get in touch</p>
            <a href="mailto:support@charak.health" data-testid="footer-email">
              support@charak.health
            </a>
            <span data-testid="footer-phone">+91-XXXXX XXXXX</span>
            <span data-testid="footer-address">[Registered Address — placeholder]</span>
          </div>
        </div>

        <div className="container footer-bottom">
          <span data-testid="footer-copyright">© 2026 Charak. All rights reserved.</span>
          <span>Designed for care that feels closer.</span>
          <span>Inspired by Maharishi Charak — the father of Indian medicine.</span>
        </div>
      </footer>
    </div>
  );
}
