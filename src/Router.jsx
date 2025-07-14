import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import About from "./pages/about/About";
import Education from "./pages/education/Education";
import Experience from "./pages/experience/Experience";
import Projects from "./pages/projects/Projects";
import { initGA, trackPageView } from "./analytics";

function Router(props) {
  const location = useLocation();
  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<About headerInitialHeight={props.headerInitialHeight} />}
        />
        <Route
          path="/about"
          element={<About headerInitialHeight={props.headerInitialHeight} />}
        />
        <Route path="/education" element={<Education />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/project" element={<Projects />} />
      </Routes>
    </>
  );
}

export default Router;
