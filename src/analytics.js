import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-YM70VHLL4R"); // Replace with your measurement ID
};

export const trackPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
