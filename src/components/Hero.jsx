import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Hero.css";

// Each greeting replaces "Hello" entirely — no duplicate
const GREETINGS = [
  { text: "Hello",      lang: "English" },
  { text: "Namaste",    lang: "Hindi" },
  { text: "Namaskar",   lang: "Malayalam" },
  { text: "Konnichiwa", lang: "Japanese" },
  { text: "Privet",     lang: "Russian" },
  { text: "Hallo",      lang: "German / Dutch" },
  { text: "Bonjour",    lang: "French" },
  { text: "Vanakkam",   lang: "Tamil" },
];

export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % GREETINGS.length), 2000);
    return () => clearInterval(id);
  }, []);

  const fadeUp = (delay) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <section className="hero" id="top">
      <div className="hero__circle hero__circle--salmon" />
      <div className="hero__circle hero__circle--cyan" />
      <div className="hero__circle hero__circle--peach" />
      <div className="hero__circle hero__circle--yellow" />

      <div className="container hero__inner">

        {/* Rotating greeting — one word at a time, no duplicate text */}
        <motion.div className="hero__greeting-row" {...fadeUp(0.1)}>
          <AnimatePresence mode="wait">
            <motion.span
              key={idx}
              className="hero__greeting-word"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {GREETINGS[idx].text}
            </motion.span>
          </AnimatePresence>
          <span className="hero__greeting-suffix">, namaste 👋</span>
          <span className="hero__greeting-lang">— {GREETINGS[idx].lang}</span>
        </motion.div>

        {/* Status pill */}
        <motion.div className="hero__status" {...fadeUp(0.22)}>
          <span className="hero__status-dot" />
          Currently building with Power BI, SQL &amp; live REST APIs
        </motion.div>

        {/* Big name */}
        <motion.h1 className="hero__name" {...fadeUp(0.35)}>
          I'm <span className="hero__name-accent">Aakash</span>{" "}
          <span className="hero__name-accent2">Ezhava.</span>
        </motion.h1>

        {/* Role highlight box */}
        <motion.div className="hero__role-box" {...fadeUp(0.5)}>
          Data Analyst &amp; BI Engineer
        </motion.div>

        {/* Description */}
        <motion.p className="hero__desc" {...fadeUp(0.62)}>
          2+ years building end-to-end BI platforms — live REST API integrations,
          self-hosted ETL workflows (n8n), star-schema PostgreSQL databases, and
          Power BI dashboards with 20+ DAX measures.
        </motion.p>

        {/* Buttons */}
        <motion.div className="hero__buttons" {...fadeUp(0.74)}>
          <a
            href="#projects"
            className="hero__btn hero__btn--primary"
            onClick={(e) => { e.preventDefault(); document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" }); }}
          >
            🚀 Explore My Work
          </a>
          <a href="/Aakash_Ezhava_Resume.pdf" download className="hero__btn hero__btn--secondary">
            ⬇ Download Resume
          </a>
        </motion.div>
      </div>
    </section>
  );
}
