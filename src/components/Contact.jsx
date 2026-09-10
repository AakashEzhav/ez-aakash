import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ConfettiButton from "./ConfettiButton";
import "./Contact.css";

const CONTACT_CARDS = [
  {
    label: "email",
    icon: "✉",
    value: "ezhavaaakash@gmail.com",
    href: "mailto:ezhavaaakash@gmail.com",
    bg: "#f4917a",
  },
  {
    label: "linkedin",
    icon: "in",
    value: "aakash-ezhava",
    href: "https://linkedin.com/in/aakash-ezhava",
    bg: "#00d4f5",
  },
  {
    label: "phone",
    icon: "📞",
    value: "+91 7435878229",
    href: "tel:+917435878229",
    bg: "#ffd93d",
  },
  {
    label: "twitter / x",
    icon: "𝕏",
    value: "@AakashEzha73205",
    href: "https://x.com/AakashEzha73205",
    bg: "#a8e63d",
  },
];

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="contact" className="section-orange">
      <div className="contact__circle contact__circle--salmon" />
      <div className="contact__circle contact__circle--cyan" />
      <div className="contact__circle contact__circle--yellow" />

      <div className="container" ref={ref} style={{ position: "relative", zIndex: 1 }}>
        <motion.div className="contact__say-hi"
          initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4 }}>
          ♡ say hi
        </motion.div>

        <motion.h2 className="contact__heading"
          initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}>
          Let's build something<br />amazing together.
        </motion.h2>

        <motion.p className="contact__sub"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.22 }}>
          Recruiter, collaborator, or someone with a wild BI idea — my inbox is open.
        </motion.p>

        <div className="contact__cards">
          {CONTACT_CARDS.map((card, i) => (
            <motion.a
              key={card.label}
              href={card.href}
              className="contact__card"
              style={{ background: card.bg }}
              target={card.label !== "email" && card.label !== "phone" ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.1 + 0.3 }}
              whileHover={{ y: -4, boxShadow: "6px 6px 0 #0f0f0f" }}
            >
              <div className="contact__card-icon">
                <span>{card.icon}</span>
              </div>
              <div className="contact__card-text">
                <span className="contact__card-label">{card.label}</span>
                <span className="contact__card-value">{card.value}</span>
              </div>
              <span className="contact__card-arrow">↗</span>
            </motion.a>
          ))}
        </div>

        <motion.p className="contact__location"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.7 }}>
          📍 Ahmedabad, India
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.8 }}>
          <ConfettiButton />
        </motion.div>
      </div>

      <footer className="footer">
        <div className="container footer__inner">
          <p>Made with ♥, chai, and too many Power BI tabs — Aakash Ezhava</p>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </section>
  );
}
