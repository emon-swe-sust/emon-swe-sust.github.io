import { HashRouter } from "react-router-dom";
import Router from "./Router";
import ScrollToTop from "./components/ScrollToTop";
import TopNav from "./components/nav/TopNav";
import Footer from "./components/Footer";

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <TopNav />
      <Router />
      <Footer />
    </HashRouter>
  );
}

export default App;
