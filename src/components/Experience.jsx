import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { experience } from "../data/experience";
import "./Experience.css";

const CARD_COLORS = ["#f4917a", "#f4a261", "#a8e63d"];

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="experience" className="section-cyan">
      <div className="container" ref={ref}>
        <motion.p className="exp__label"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}>
          ✦ the journey
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}>
          Where I've been showing up.
        </motion.h2>

        {/* Zigzag timeline */}
        <div className="exp__timeline">
          <div className="exp__timeline-line" />
          {experience.map((item, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={i}
                className={`exp__item ${isLeft ? "exp__item--left" : "exp__item--right"}`}
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.15 + 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="exp__card" style={{ background: CARD_COLORS[i % CARD_COLORS.length] }}>
                  <p className="exp__card-date">{item.date}</p>
                  <h3 className="exp__card-role">{item.role}</h3>
                  <p className="exp__card-company">{item.company} · {item.location}</p>
                  <ul className="exp__card-bullets">
                    {item.bullets.map((b, bi) => (
                      <li key={bi}>
                        <span className="exp__star">☆</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="exp__timeline-dot" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
