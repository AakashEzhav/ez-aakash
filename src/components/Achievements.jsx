import { useState, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { achievements, certifications } from "../data/certifications";
import confetti from "canvas-confetti";
import "./Achievements.css";

/* ── Cert CARD — flip on click ────────────────────────── */
const CERT_COLORS = [
  { bg: "#ffd93d", fg: "#0f0f0f" },
  { bg: "#00d4f5", fg: "#0f0f0f" },
  { bg: "#ff6b9d", fg: "#fff" },
  { bg: "#a8e63d", fg: "#0f0f0f" },
  { bg: "#f4917a", fg: "#0f0f0f" },
  { bg: "#c084fc", fg: "#fff" },
];

function CertCard({ cert, index, inView }) {
  const [flipped, setFlipped] = useState(false);
  const { bg, fg } = CERT_COLORS[index % CERT_COLORS.length];

  const handleFlip = () => {
    setFlipped(f => !f);
    if (!flipped) {
      confetti({
        particleCount: 30, spread: 60, origin: { y: 0.6 },
        colors: [bg, "#e8623a", "#fff"],
        scalar: 0.7, startVelocity: 25,
      });
    }
  };

  return (
    <motion.div
      className="cert-card"
      initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -2 : 2 }}
      animate={inView ? { opacity: 1, y: 0, rotate: index % 2 === 0 ? -1 : 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 + 0.2 }}
      whileHover={{ y: -6, rotate: 0, scale: 1.03 }}
      onClick={handleFlip}
      style={{ cursor: "pointer" }}
    >
      <div className={`cert-card__inner ${flipped ? "cert-card__inner--flipped" : ""}`}>
        {/* Front */}
        <div className="cert-card__face cert-card__front" style={{ background: bg, color: fg }}>
          <span className="cert-card__num">#{String(index + 1).padStart(2, "0")}</span>
          <p className="cert-card__org">{cert.org}</p>
          <div className="cert-card__hint">tap to reveal 👆</div>
        </div>
        {/* Back */}
        <div className="cert-card__face cert-card__back">
          <span className="cert-card__year-badge" style={{ background: bg, color: fg }}>{cert.year}</span>
          <p className="cert-card__name">{cert.name}</p>
          <p className="cert-card__org-back">{cert.org}</p>
          <div className="cert-card__check">✓</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Achievement CARD — draggable sticky note ─────────── */
const ACH_COLORS = ["#ffd93d", "#a8e63d", "#f4917a", "#00d4f5"];
const ACH_ROTATIONS = [-3, 2, -2, 3];

function AchCard({ item, index, inView }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(x, { stiffness: 200, damping: 22 });
  const ry = useSpring(y, { stiffness: 200, damping: 22 });
  const [lifted, setLifted] = useState(false);
  const bg = ACH_COLORS[index % ACH_COLORS.length];
  const rot = ACH_ROTATIONS[index % ACH_ROTATIONS.length];

  return (
    <motion.div
      className={`ach-card ${lifted ? "ach-card--lifted" : ""}`}
      style={{ x: rx, y: ry, background: bg, rotate: rot, zIndex: lifted ? 20 : 1 }}
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragStart={() => setLifted(true)}
      onDrag={(_, info) => { x.set(info.offset.x); y.set(info.offset.y); }}
      onDragEnd={() => { x.set(0); y.set(0); setLifted(false); }}
      whileDrag={{ scale: 1.06, rotate: 0 }}
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, scale: 0.8, rotate: rot - 5 }}
      animate={inView ? { opacity: 1, scale: 1, rotate: rot } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 + 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ach-card__pin" />
      <div className="ach-card__emoji">{item.emoji}</div>
      <h3 className="ach-card__title">{item.title}</h3>
      <p className="ach-card__date">{item.date}</p>
      <p className="ach-card__desc">{item.description}</p>
      {item.bullets?.map((b, i) => (
        <p key={i} className="ach-card__bullet">{b}</p>
      ))}
      <div className="ach-card__drag-hint">✦ drag me</div>
    </motion.div>
  );
}

/* ── Main Section ─────────────────────────────────────── */
export default function Achievements() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [allFlipped, setAllFlipped] = useState(false);

  const flipAll = () => {
    setAllFlipped(true);
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: ["#ffd93d", "#ff6b9d", "#00d4f5", "#a8e63d"] });
  };

  return (
    <section id="achievements">
      <div className="container" ref={ref}>
        {/* Header */}
        <motion.p className="ach__label"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}>
          ✦ badges unlocked
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}>
          Achievements &amp; certifications.
        </motion.h2>
        <motion.p className="ach__subtitle"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.15 }}>
          drag the sticky notes · flip the cert cards 👇
        </motion.p>

        {/* ── Sticky note achievements ── */}
        <div className="ach__board">
          <div className="ach__board-label">📌 achievements</div>
          <div className="ach__stickies">
            {achievements.map((a, i) => (
              <AchCard key={i} item={a} index={i} inView={inView} />
            ))}
          </div>
        </div>

        {/* ── Flip cert cards ── */}
        <div className="ach__certs-header">
          <div className="ach__board-label">🏅 certifications — tap each card to reveal</div>
          <motion.button
            className="ach__flip-all"
            onClick={flipAll}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            🎉 reveal all
          </motion.button>
        </div>

        <div className="ach__cert-grid">
          {certifications.map((c, i) => (
            <CertCardControlled key={i} cert={c} index={i} inView={inView} forceFlip={allFlipped} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* Controlled cert card that responds to forceFlip */
function CertCardControlled({ cert, index, inView, forceFlip }) {
  const [flipped, setFlipped] = useState(false);
  const { bg, fg } = CERT_COLORS[index % CERT_COLORS.length];
  const isFlipped = flipped || forceFlip;

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true);
      confetti({
        particleCount: 28, spread: 55, origin: { y: 0.6 },
        colors: [bg, "#e8623a", "#fff"], scalar: 0.7, startVelocity: 22,
      });
    } else {
      setFlipped(false);
    }
  };

  return (
    <motion.div
      className="cert-card"
      initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -2 : 2 }}
      animate={inView ? { opacity: 1, y: 0, rotate: index % 2 === 0 ? -1 : 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 + 0.2 }}
      whileHover={{ y: -6, rotate: 0, scale: 1.03 }}
      onClick={handleFlip}
    >
      <div className={`cert-card__inner ${isFlipped ? "cert-card__inner--flipped" : ""}`}>
        <div className="cert-card__face cert-card__front" style={{ background: bg, color: fg }}>
          <span className="cert-card__num">#{String(index + 1).padStart(2, "0")}</span>
          <p className="cert-card__org-front">{cert.org}</p>
          <div className="cert-card__hint">tap to reveal 👆</div>
        </div>
        <div className="cert-card__face cert-card__back">
          <span className="cert-card__year-badge" style={{ background: bg, color: fg }}>{cert.year}</span>
          <p className="cert-card__name">{cert.name}</p>
          <p className="cert-card__org-back">{cert.org}</p>
          <div className="cert-card__check">✓</div>
        </div>
      </div>
    </motion.div>
  );
}
