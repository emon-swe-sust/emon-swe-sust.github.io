import { lazy, Suspense } from "react";
import { HashRouter, useLocation } from "react-router-dom";
import Router from "./Router";
import ScrollToTop from "./components/ScrollToTop";
import TopNav from "./components/nav/TopNav";
import Footer from "./components/Footer";

// The admin panel exists only in the dev server (`npm start`). The condition is
// replaced at build time, so production bundles contain none of the admin code.
const Admin =
  process.env.NODE_ENV === "development"
    ? lazy(() => import("./admin/Admin"))
    : null;

function Shell() {
  const { pathname } = useLocation();
  if (Admin && pathname.startsWith("/admin")) {
    return (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    );
  }
  return (
    <>
      <ScrollToTop />
      <TopNav />
      <Router />
      <Footer />
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}

export default App;
