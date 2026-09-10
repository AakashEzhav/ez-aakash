import { useEffect, useRef } from "react";
import "./Cursor.css";

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let mx = 0, my = 0, rx = 0, ry = 0, raf;
    
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${mx}px,${my}px)`;
    };
    const animate = () => {
      rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(animate);
    };
    const onOver = (e) => {
      if (e.target.closest("a,button,[data-hover]")) {
        ring.current?.classList.add("cursor-ring--big");
        dot.current?.classList.add("cursor-dot--hide");
      }
    };
    const onOut = (e) => {
      if (e.target.closest("a,button,[data-hover]")) {
        ring.current?.classList.remove("cursor-ring--big");
        dot.current?.classList.remove("cursor-dot--hide");
      }
    };
    
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    raf = requestAnimationFrame(animate);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring} />
    </>
  );
}
