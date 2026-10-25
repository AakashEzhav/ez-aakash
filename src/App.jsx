import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EyeAsciiLoader from "./components/EyeAsciiLoader";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Achievements from "./components/Achievements";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";

function MainSite() {
  const [loaded, setLoaded] = useState(false);      // homepage mounted (starts under the loader's reveal phase)
  const [overlay, setOverlay] = useState(true);       // loader overlay still present
  const onReveal = useCallback(() => setLoaded(true), []);
  const onDone = useCallback(() => setOverlay(false), []);
  return (
    <>
      {overlay && <EyeAsciiLoader onReveal={onReveal} onComplete={onDone} oncePerSession={false} />}
      {loaded && (
        <>
          <Cursor />
          <Navbar />
          <main>
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Experience />
            <Achievements />
            <Contact />
          </main>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
