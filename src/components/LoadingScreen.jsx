import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./LoadingScreen.css";

export default function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = show text, phase 1 = exit

  useEffect(() => {
    // After 2s start exit animation
    const t1 = setTimeout(() => setPhase(1), 2000);
    // After exit animation (0.6s), call onDone
    const t2 = setTimeout(() => onDone(), 2650);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase < 1 && (
        <motion.div
          className="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Background circles */}
          <div className="loading__circle loading__circle--1" />
          <div className="loading__circle loading__circle--2" />
          <div className="loading__circle loading__circle--3" />

          <div className="loading__content">
            <motion.p
              className="loading__hi"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Hello 👋
            </motion.p>

            <motion.h1
              className="loading__name"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
            >
              I'm <span>Aakash</span>
            </motion.h1>

            <motion.p
              className="loading__role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
            >
              Data Analyst &amp; BI Engineer
            </motion.p>

            <motion.div
              className="loading__bar-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <motion.div
                className="loading__bar"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.85, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
