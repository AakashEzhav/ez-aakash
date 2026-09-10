import { useState, useCallback } from "react";
import LoadingScreen from "./components/LoadingScreen";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Achievements from "./components/Achievements";
import Contact from "./components/Contact";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const onDone = useCallback(() => setLoaded(true), []);

  return (
    <>
      <LoadingScreen onDone={onDone} />
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
