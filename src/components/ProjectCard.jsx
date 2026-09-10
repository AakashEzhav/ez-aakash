import { motion } from "framer-motion";
import "./ProjectCard.css";

export default function ProjectCard({ project, index, inView }) {
  const { bg, accent, dot } = project.color;

  return (
    <motion.article
      className="project-card"
      style={{ "--card-bg": bg, "--card-accent": accent, "--card-dot": dot }}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {/* Colored top bar */}
      <div className="project-card__bar" />

      <div className="project-card__header">
        <span className="project-card__emoji">{project.emoji}</span>
        <span className="project-card__num" style={{ color: accent }}>#{project.number}</span>
      </div>

      <h3 className="project-card__title">{project.title}</h3>
      <p className="project-card__desc">{project.description}</p>

      <div className="project-card__tech">
        {project.tech.map((t) => (
          <span key={t} className="project-card__tech-tag" style={{ background: dot, color: accent }}>
            {t}
          </span>
        ))}
      </div>

      <div className="project-card__footer">
        {project.live ? (
          <a href={project.live} target="_blank" rel="noopener noreferrer"
             className="project-card__link" style={{ color: accent }}>
            View Project ↗
          </a>
        ) : (
          <span className="project-card__coming">
            🔒 Available on request
          </span>
        )}
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer"
             className="project-card__link project-card__link--gh">
            GitHub
          </a>
        )}
      </div>
    </motion.article>
  );
}
