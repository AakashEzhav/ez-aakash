import { useCallback } from "react";
import confetti from "canvas-confetti";
import "./ConfettiButton.css";

export default function ConfettiButton() {
  const fire = useCallback(() => {
    const count = 250;
    confetti({ spread: 26, startVelocity: 55, particleCount: Math.floor(count * 0.25), origin: { y: 0.7 } });
    confetti({ spread: 60, particleCount: Math.floor(count * 0.2), origin: { y: 0.7 } });
    confetti({ spread: 100, decay: 0.91, scalar: 0.8, particleCount: Math.floor(count * 0.35), origin: { y: 0.7 } });
    confetti({ spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, particleCount: Math.floor(count * 0.1), origin: { y: 0.7 } });
    confetti({ spread: 120, startVelocity: 45, particleCount: Math.floor(count * 0.1), origin: { y: 0.7 } });
  }, []);

  return (
    <button className="confetti-btn" onClick={fire} aria-label="Throw some confetti">
      throw some confetti 🎉
    </button>
  );
}
