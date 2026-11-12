import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Theme from "./components/context/Theme";
import { ChakraProvider } from "@chakra-ui/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Chakra is only used for its Spinner / toast; the site has its own styles. */}
    <ChakraProvider resetCSS={false}>
      <Theme>
        <App />
      </Theme>
    </ChakraProvider>
  </React.StrictMode>
);

reportWebVitals();
