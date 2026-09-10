import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import "./NotFound.css";

// Draggable floating sticker — reuse the site's playful drag vibe
function FloatingSticker({ children, initialX, initialY, color, textColor = "#0f0f0f", delay = 0 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 20 });
  const sy = useSpring(y, { stiffness: 180, damping: 20 });

  return (
    <motion.div
      className="nf__sticker"
      style={{ x: sx, y: sy, background: color, color: textColor, left: initialX, top: initialY }}
      drag
      dragMomentum={false}
      dragElastic={0.12}
      onDrag={(_, info) => { x.set(info.offset.x); y.set(info.offset.y); }}
      onDragEnd={() => { x.set(0); y.set(0); }}
      whileDrag={{ scale: 1.12, zIndex: 20 }}
      whileHover={{ scale: 1.07 }}
      initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Typewriter for the subtitle
const LINES = [
  "This page doesn't exist in my database.",
  "Not even a broken SQL query found it.",
  "404 rows affected: 0.",
  "Even n8n couldn't automate finding this.",
];

function Typewriter() {
  const [lineIdx, setLineIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const target = LINES[lineIdx];
    if (typing) {
      if (displayed.length < target.length) {
        const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 38);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 1800);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 18);
        return () => clearTimeout(t);
      } else {
        setLineIdx((i) => (i + 1) % LINES.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, lineIdx]);

  return (
    <p className="nf__typewriter">
      {displayed}
      <span className="nf__cursor">|</span>
    </p>
  );
}

export default function NotFound() {
  const goHome = () => { window.location.href = "/"; };

  return (
    <div className="nf">
      {/* Grid background inherited from body */}

      {/* Floating circles — match hero */}
      <div className="nf__circle nf__circle--salmon" />
      <div className="nf__circle nf__circle--cyan" />
      <div className="nf__circle nf__circle--yellow" />
      <div className="nf__circle nf__circle--green" />

      {/* Draggable stickers scattered around */}
      <FloatingSticker initialX="5%" initialY="12%" color="#ffd93d" delay={0.6}>📊 Power BI</FloatingSticker>
      <FloatingSticker initialX="72%" initialY="8%" color="#00d4f5" delay={0.7}>🗄 SQL</FloatingSticker>
      <FloatingSticker initialX="80%" initialY="55%" color="#ff6b9d" textColor="#fff" delay={0.8}>🔧 n8n</FloatingSticker>
      <FloatingSticker initialX="3%" initialY="65%" color="#a8e63d" delay={0.9}>🐍 Python</FloatingSticker>
      <FloatingSticker initialX="60%" initialY="78%" color="#c084fc" textColor="#fff" delay={1.0}>⚡ DAX</FloatingSticker>
      <FloatingSticker initialX="20%" initialY="80%" color="#f4917a" delay={1.1}>🌐 ETL</FloatingSticker>

      {/* Main content */}
      <div className="nf__content">
        {/* Big 404 */}
        <motion.div
          className="nf__big"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="nf__4 nf__4--left">4</span>
          <motion.span
            className="nf__zero"
            animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
            transition={{ duration: 1.2, delay: 0.8, ease: "easeInOut" }}
          >
            0
          </motion.span>
          <span className="nf__4 nf__4--right">4</span>
        </motion.div>

        {/* Label pill */}
        <motion.div
          className="nf__pill"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.35 }}
        >
          ✦ page not found
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="nf__heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.45 }}
        >
          Looks like this page<br />
          <span className="nf__heading-accent">went missing</span> from<br />
          the dashboard.
        </motion.h1>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Typewriter />
        </motion.div>

        {/* Status strip */}
        <motion.div
          className="nf__status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.85 }}
        >
          <span className="nf__status-dot" />
          <span>ERROR_CODE: 404 &nbsp;·&nbsp; ROWS_RETURNED: 0 &nbsp;·&nbsp; STATUS: PAGE_NOT_FOUND</span>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="nf__buttons"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <button className="nf__btn nf__btn--primary" onClick={goHome}>
            🏠 Take Me Home
          </button>
          <button
            className="nf__btn nf__btn--secondary"
            onClick={() => { window.location.href = "/#projects"; }}
          >
            📊 See My Work
          </button>
        </motion.div>

        {/* Footer quip */}
        <motion.p
          className="nf__quip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.3 }}
        >
          p.s. — even my best DAX measure couldn't calculate this page into existence.
        </motion.p>
      </div>
    </div>
  );
}
