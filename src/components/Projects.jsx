import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { projects } from "../data/projects";
import "./Projects.css";

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="projects">
      <div className="container" ref={ref}>
        <motion.p className="projects__label"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}>
          ✦ my projects
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}>
          Things I've built &amp; broken.
        </motion.h2>

        <div className="projects__list">
          {projects.map((p, i) => (
            <ProjectRow key={p.number} project={p} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectRow({ project, index, inView }) {
  const isEven = index % 2 === 0;
  const { panelBg, emoji } = project;

  return (
    <motion.div
      className={`project-row ${isEven ? "project-row--image-left" : "project-row--image-right"}`}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Colored emoji panel */}
      <div className="project-row__panel" style={{ background: panelBg }}>
        <span className="project-row__emoji">{emoji}</span>
        {/* Decorative dots */}
        <span className="project-row__dot project-row__dot--1" />
        <span className="project-row__dot project-row__dot--2" />
        <span className="project-row__dot project-row__dot--3" />
      </div>

      {/* Content */}
      <div className="project-row__content">
        <p className="project-row__num">project #{project.number}</p>
        <h3 className="project-row__title">{project.title}</h3>
        <p className="project-row__desc">{project.shortDesc}</p>

        <div className="project-row__tech">
          {project.tech.map((t) => (
            <span key={t} className="project-row__tech-tag">{t}</span>
          ))}
        </div>

        <div className="project-row__links">
          {project.live ? (
            <a href={project.live} target="_blank" rel="noopener noreferrer"
               className="project-row__btn project-row__btn--primary">
              peek inside ✦
            </a>
          ) : (
            <span className="project-row__btn project-row__btn--locked">🔒 Available on request</span>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer"
               className="project-row__btn project-row__btn--gh">
              GitHub
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
