import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import About from "./pages/about/About";
import Education from "./pages/education/Education";
import Experience from "./pages/experience/Experience";
import Projects from "./pages/projects/Projects";
import { initGA, trackPageView } from "./analytics";

function Router() {
  const location = useLocation();
  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<About />} />
      <Route path="/about" element={<About />} />
      <Route path="/education" element={<Education />} />
      <Route path="/experience" element={<Experience />} />
      <Route path="/project" element={<Projects />} />
      <Route path="*" element={<About />} />
    </Routes>
  );
}

export default Router;
