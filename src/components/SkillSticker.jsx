import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";
import "./SkillSticker.css";

const COLORS = [
  { bg: "#ffd93d", color: "#0f0f0f" },
  { bg: "#f4917a", color: "#0f0f0f" },
  { bg: "#a8e63d", color: "#0f0f0f" },
  { bg: "#00d4f5", color: "#0f0f0f" },
  { bg: "#ff6b9d", color: "#fff" },
  { bg: "#f4a261", color: "#0f0f0f" },
  { bg: "#c084fc", color: "#fff" },
  { bg: "#4ade80", color: "#0f0f0f" },
  { bg: "#60a5fa", color: "#fff" },
  { bg: "#fb923c", color: "#0f0f0f" },
];

export default function SkillSticker({ label, index }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform([x, y], ([lx, ly]) => (lx + ly) * 0.03);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });
  const { bg, color } = COLORS[index % COLORS.length];

  return (
    <motion.div
      className="skill-sticker"
      style={{ x: springX, y: springY, rotate, background: bg, color }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDrag={(_, info) => { x.set(info.offset.x); y.set(info.offset.y); }}
      onDragEnd={() => { x.set(0); y.set(0); }}
      whileDrag={{ scale: 1.12, zIndex: 50 }}
      whileHover={{ scale: 1.06 }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      {label}
    </motion.div>
  );
}
