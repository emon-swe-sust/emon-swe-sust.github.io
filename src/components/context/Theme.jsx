import React, { useCallback, useEffect, useMemo, useState } from "react";

// Colours now live in CSS custom properties (see index.css). This map keeps the
// old `theme.colors.*` names working by pointing them at those properties.
// The mode is stored in `data-mode` on <html> (not `data-theme`, which Chakra UI
// writes to and would overwrite).
const colors = {
  primary: "var(--ink)",
  navPrimary: "var(--ink)",
  bg: "var(--bg)",
  navbg: "var(--surface)",
  navHover: "var(--surface-2)",
  navSelected: "var(--surface-2)",
  title: "var(--ink)",
  titleSecondary: "var(--ink-2)",
  success: "var(--c-career-ink)",
  btnSuccess: "var(--c-career)",
  btnError: "#c0392b",
  btnDisable: "var(--line-strong)",
  btnErrDisable: "var(--line)",
  btnHover: "var(--c-career-ink)",
  bgSecondary: "var(--surface)",
  bgCard: "var(--surface)",
  secondary: "var(--muted)",
  navMobile: "var(--surface-2)",
  border: "var(--line)",
  header: "var(--ink)",
};

export const ThemeContext = React.createContext();

const readInitialVariant = () => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch (e) {
    /* storage can be unavailable (private mode); fall through */
  }
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function Theme({ children }) {
  const [variant, setVariant] = useState(readInitialVariant);

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", variant);
  }, [variant]);

  const changeTheme = useCallback((mode) => {
    const next = mode === "dark" ? "dark" : "light";
    setVariant(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ changeTheme, theme: { variant, colors } }),
    [changeTheme, variant]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default Theme;
