import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { achievements, certifications } from "../data/certifications";
import "./Achievements.css";

export default function Achievements() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="achievements">
      <div className="container" ref={ref}>
        <motion.p className="ach__label"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}>
          ✦ badges unlocked
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}>
          Achievements & certifications.
        </motion.h2>

        <div className="ach__grid">
          <div>
            <p className="ach__col-label">Activities & Recognition</p>
            {achievements.map((a, i) => (
              <motion.div key={i} className="ach__item"
                initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.1 + 0.2 }}>
                <span className="ach__emoji">{a.emoji}</span>
                <div>
                  <div className="ach__item-header">
                    <strong>{a.title}</strong>
                    <span className="ach__date">{a.date}</span>
                  </div>
                  <p className="ach__desc">{a.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div>
            <p className="ach__col-label">Certifications</p>
            {certifications.map((c, i) => (
              <motion.div key={i} className="cert__item"
                initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 + 0.25 }}>
                <span className="cert__year">{c.year}</span>
                <div>
                  <p className="cert__name">{c.name}</p>
                  <p className="cert__org">{c.org}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
