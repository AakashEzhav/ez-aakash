import { motion } from "framer-motion";
import "./ExperienceItem.css";

const ROLE_COLORS = [
  { bg: "#fff5f2", accent: "#e8623a", dot: "#ffd4c4" },  // orange
  { bg: "#f2f5ff", accent: "#4a6cf7", dot: "#c4d0ff" },  // blue
  { bg: "#f2fff5", accent: "#2e7d32", dot: "#b9f0be" },  // green
];

export default function ExperienceItem({ item, index, inView }) {
  const { bg, accent, dot } = ROLE_COLORS[index % ROLE_COLORS.length];

  return (
    <motion.div
      className="exp-item"
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.13, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Left: date + colored indicator */}
      <div className="exp-item__left">
        <div className="exp-item__dot" style={{ background: accent }} />
        <span className="exp-item__date">{item.date}</span>
      </div>

      {/* Right: content card */}
      <div className="exp-item__card" style={{ background: bg, borderColor: dot }}>
        <div className="exp-item__card-top">
          <div>
            <h3 className="exp-item__role">{item.role}</h3>
            <p className="exp-item__company" style={{ color: accent }}>
              {item.company}
            </p>
            <p className="exp-item__location">{item.location}</p>
          </div>
          <span className="exp-item__badge" style={{ background: dot, color: accent }}>
            {index === 0 ? "Current" : index === 1 ? "2024–26" : "2024"}
          </span>
        </div>

        <ul className="exp-item__bullets">
          {item.bullets.map((b, i) => (
            <li key={i}>
              <span className="exp-item__bullet-dot" style={{ background: accent }} />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
