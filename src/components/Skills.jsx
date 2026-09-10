import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SkillSticker from "./SkillSticker";
import { skillGroups } from "../data/skills";
import "./Skills.css";

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const GROUP_ICONS = ["📊", "🔧", "🗄", "📗"];
  const GROUP_COLORS = ["#f4917a", "#f4a261", "#a8e63d", "#60a5fa"];

  return (
    <section id="skills" className="section-orange">
      <div className="container" ref={ref}>
        <motion.div className="skills__header-pill"
          initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4 }}>
          ✦ my toolbox
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}>
          Draggable skill stickers.
        </motion.h2>
        <motion.p className="skills__hint" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}>
          grab them, toss them, they'll bounce back 🎈
        </motion.p>

        <div className="skills__grid">
          {skillGroups.map((group, gi) => (
            <motion.div key={group.label} className="skills__card"
              initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: gi * 0.1 + 0.25 }}>
              <div className="skills__card-header">
                <span className="skills__card-icon" style={{ background: GROUP_COLORS[gi % GROUP_COLORS.length] }}>
                  {GROUP_ICONS[gi % GROUP_ICONS.length]}
                </span>
                <h3>{group.label}</h3>
              </div>
              <div className="skills__sticker-area">
                {group.skills.map((skill, si) => (
                  <SkillSticker key={skill} label={skill} index={gi * 10 + si} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
