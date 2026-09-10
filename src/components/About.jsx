import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "./About.css";

const ABOUT = {
  bio: "Data Analyst with 2+ years of experience building end-to-end BI platforms — from live REST API integrations and self-hosted ETL workflows (n8n) to star-schema PostgreSQL databases and Power BI dashboards with 20+ DAX measures. Certified in Power BI, SQL, and Python. Actively seeking roles in the Netherlands, Germany, Ireland, and Singapore.",
  tags: ["Power BI", "SQL", "DAX", "n8n", "PostgreSQL", "ETL", "Python", "Advanced Excel", "Tableau", "REST APIs"],
  openTo: ["Netherlands 🇳🇱", "Germany 🇩🇪", "Ireland 🇮🇪", "Singapore 🇸🇬"],
};

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const fade = (d) => ({
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay: d, ease: [0.22, 1, 0.36, 1] },
  });

  const TAG_COLORS = ["#ffd93d","#f4a261","#ff6b9d","#a8e63d","#00d4f5","#f4917a","#c084fc","#fbbf24","#4ade80","#60a5fa"];

  return (
    <section id="about">
      <div className="container" ref={ref}>
        <motion.p className="about__label" {...fade(0)}>✦ about me</motion.p>
        <motion.h2 {...fade(0.08)}>A quick hello.</motion.h2>
        <motion.p className="about__bio" {...fade(0.16)}>{ABOUT.bio}</motion.p>

        <motion.div className="about__tags" {...fade(0.24)}>
          {ABOUT.tags.map((t, i) => (
            <span key={t} className="about__tag" style={{ background: TAG_COLORS[i % TAG_COLORS.length] }}>
              {t}
            </span>
          ))}
        </motion.div>

        <motion.div className="about__open" {...fade(0.32)}>
          <p className="about__open-label">🌍 Open to relocation</p>
          <div className="about__open-tags">
            {ABOUT.openTo.map((c) => (
              <span key={c} className="about__open-tag">{c}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
