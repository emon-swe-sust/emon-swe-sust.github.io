import React, { useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../context/Theme";
import SidebarContent from "./SidebarContent";

const SidebarDesktopContainer = styled.div`
  background-color: ${(props) => props.theme.colors.navbg};
  color: ${(props) => props.theme.colors.navPrimary};
  width: 20%;
  height: 100vh;
  position: fixed;
  @media (max-width: 1200px) {
    width: 25%;
  }
`;

function SidebarDesktop() {
  const { theme } = useContext(ThemeContext);
  return (
    <SidebarDesktopContainer theme={theme}>
      <SidebarContent />
    </SidebarDesktopContainer>
  );
}

export default SidebarDesktop;
