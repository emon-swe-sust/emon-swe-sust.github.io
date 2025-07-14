import React, { useState } from "react";

const darkTheme = {
  variant: "dark",
  colors: {
    primary: "#e4e4e4",
    navPrimary: "#e4e4e4",
    bg: "#1C2128",
    navbg: "#2b2e3f",
    navHover: "#434863",
    navSelected: "#363d64",
    title: "#c9c4e2",
    titleSecondary: "#cbcbcd",
    success: "#9efb9e",
    btnSuccess: "#009800",
    btnError: "#e9452f",
    btnDisable: "#8db88d",
    btnErrDisable: "#b37373",
    btnHover: "#01b201",
    bgSecondary: "#2D333B",
    bgCard: "#22272E",
    secondary: "#c2c0c0",
    navMobile: "#300e5e",
    border: "#454545",
    header: "#e4fbf1",
  },
  fonts: {
    primary: "Arial",
    secondary: "Helvetica",
  },
};

const lightTheme = {
  variant: "light",
  colors: {
    primary: "#181818",
    navPrimary: "#e4e4e4",
    bg: "#f9f5ff",
    navbg: "#121616",
    navHover: "#41434a",
    navSelected: "#38393d",
    title: "#517091",
    titleSecondary: "#494558",
    success: "#009800",
    btnSuccess: "#009800",
    btnError: "#981200",
    btnDisable: "#8db88d",
    btnErrDisable: "#b37373",
    btnHover: "#01b201",
    bgSecondary: "#ffffff",
    bgCard: "#F6F8FA",
    secondary: "#545454",
    navMobile: "#b8a4ff",
    border: "#a6a6a6",
    header: "#292920",
  },
  fonts: {
    primary: "Arial",
    secondary: "Helvetica",
  },
};

export const ThemeContext = React.createContext();

function Theme({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") === "dark" ? darkTheme : lightTheme
  );

  const changeTheme = (mode) => {
    if (mode === "dark") {
      setTheme(darkTheme);
      localStorage.setItem("theme", "dark");
    } else {
      setTheme(lightTheme);
      localStorage.setItem("theme", "light");
    }
  };
  return (
    <ThemeContext.Provider value={{ changeTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default Theme;
