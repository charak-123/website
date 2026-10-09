import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Reveal, SplitHeading, ease } from './motion';

/* Accordion used by both the families and the doctors landing pages. */
export default function Faq({ items, title = 'Questions?\n*Answered.*' }) {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="faq2 container">
      <div className="faq2-grid">
        <div>
          <SplitHeading text={title} />
          <Reveal as="p" className="faq2-lead">
            Anything else? <Link to="/contact">Write to us</Link>. A real person replies.
          </Reveal>
        </div>
        <div className="faq2-list">
          {items.map((item, k) => {
            const isOpen = open === k;
            return (
              <Reveal key={item.q} className={`faq2-item ${isOpen ? 'open' : ''}`} delay={k * 0.05}>
                <button
                  onClick={() => setOpen(isOpen ? null : k)}
                  aria-expanded={isOpen}
                  data-testid={`faq-question-${k}`}
                >
                  <span>{item.q}</span>
                  <motion.span
                    className="faq2-plus"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Plus size={20} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq2-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease }}
                    >
                      <p>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
