import React, { useEffect, useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity
} from 'motion/react';
import Lenis from 'lenis';

export const ease = [0.22, 1, 0.36, 1];

let lenis = null;
export const getLenis = () => lenis;

/* Smooth wheel scrolling. Skipped for people who ask for less motion. */
export function useSmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return undefined;
    lenis = new Lenis({ lerp: 0.11, anchors: { offset: -72 } });
    let id;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      lenis = null;
    };
  }, [reduce]);
}

/* Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ children, delay = 0, y = 28, as = 'div', className, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, ease, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* Headline that rises word by word out of a mask. Lines are split on "\n";
   wrap a word in *asterisks* to give it the accent colour. */
export function SplitHeading({ text, as = 'h2', className, delay = 0, onMount = false, underline = false }) {
  const Tag = motion[as];
  const lines = text.split('\n');
  let i = 0;
  let inAccent = false;
  const trigger = onMount
    ? { initial: 'hidden', animate: 'show' }
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } };

  return (
    <Tag className={className} {...trigger} aria-label={text.replace(/\*/g, '').replace(/\n/g, ' ')}>
      {lines.map((line, li) => (
        <span className="split-line" key={li} aria-hidden="true">
          {line.split(' ').map((word, wi) => {
            if (word.startsWith('*')) inAccent = true;
            const accent = inAccent;
            if (word.endsWith('*') || word.endsWith('*.') || word.endsWith('*,')) inAccent = false;
            const clean = word.replace(/\*/g, '');
            const n = i++;
            return (
              <span className="split-mask" key={wi}>
                <motion.span
                  className={accent ? 'split-word accent' : 'split-word'}
                  variants={{
                    hidden: { y: '110%', rotate: 4 },
                    show: { y: '0%', rotate: 0, transition: { duration: 0.9, ease, delay: delay + n * 0.06 } }
                  }}
                >
                  {clean}
                </motion.span>
                {wi < line.split(' ').length - 1 ? ' ' : null}
              </span>
            );
          })}
          {underline && li === lines.length - 1 && (
            <svg className="split-underline" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
              <motion.path
                d="M4 16 C 60 6, 120 4, 170 10 S 260 20, 296 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                variants={{
                  hidden: { pathLength: 0 },
                  show: { pathLength: 1, transition: { duration: 0.9, ease, delay: delay + i * 0.06 + 0.5 } }
                }}
              />
            </svg>
          )}
        </span>
      ))}
    </Tag>
  );
}

/* Endless strip whose speed and direction follow the reader's scrolling. */
export function VelocityMarquee({ children, baseVelocity = -2.5, className }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    // The strip holds two copies, so wrapping at -50% is seamless.
    let next = x.get() + move;
    if (next <= -50) next += 50;
    if (next > 0) next -= 50;
    x.set(next);
  });

  const tx = useTransform(x, (v) => `${v}%`);

  return (
    <div className={className}>
      <motion.div className="vm-track" style={{ x: tx }}>
        <div className="vm-copy">{children}</div>
        <div className="vm-copy" aria-hidden="true">{children}</div>
      </motion.div>
    </div>
  );
}

/* Moves its child at a different speed to the page for a little depth. */
export function Parallax({ children, offset = 60, className }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [offset, -offset]);
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/* Rangoli / kolam medallion: rings of petals that draw themselves, then turn
   very slowly. Purely decorative. */
export function Rangoli({ size = 520, className, petals = [12, 16, 24], stroke = 'currentColor', spin = 140 }) {
  const reduce = useReducedMotion();
  const c = 100;
  const rings = petals.map((count, r) => {
    const inner = 18 + r * 22;
    const outer = inner + 26;
    const width = (Math.PI * 2 * inner) / count / 1.4;
    return Array.from({ length: count }, (_, k) => {
      const a = (k / count) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const px = -sin * width;
      const py = cos * width;
      const x1 = c + cos * inner;
      const y1 = c + sin * inner;
      const x2 = c + cos * outer;
      const y2 = c + sin * outer;
      const mx = c + cos * ((inner + outer) / 2);
      const my = c + sin * ((inner + outer) / 2);
      return `M${x1.toFixed(2)} ${y1.toFixed(2)} Q${(mx + px).toFixed(2)} ${(my + py).toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)} Q${(mx - px).toFixed(2)} ${(my - py).toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}Z`;
    });
  });
  const dots = Array.from({ length: 36 }, (_, k) => {
    const a = (k / 36) * Math.PI * 2;
    const r = 18 + petals.length * 22 + 10;
    return [c + Math.cos(a) * r, c + Math.sin(a) * r];
  });

  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      animate={reduce ? undefined : { rotate: 360 }}
      transition={{ duration: spin, repeat: Infinity, ease: 'linear' }}
    >
      <motion.circle
        cx={c} cy={c} r={10} stroke={stroke} strokeWidth=".6"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease }}
      />
      {rings.map((paths, r) =>
        paths.map((d, k) => (
          <motion.path
            key={`${r}-${k}`}
            d={d}
            stroke={stroke}
            strokeWidth=".55"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease, delay: 0.3 + r * 0.35 + k * 0.025 }}
          />
        ))
      )}
      {dots.map(([x, y], k) => (
        <motion.circle
          key={k}
          cx={x} cy={y} r=".9" fill={stroke}
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.4 + k * 0.02, type: 'spring', stiffness: 300, damping: 14 }}
        />
      ))}
    </motion.svg>
  );
}
