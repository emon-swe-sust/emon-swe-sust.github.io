import React, { useContext, useState } from "react";
import { ThemeContext } from "../context/Theme";
import styled, { keyframes, css } from "styled-components";
import { FlexRow } from "../utils";
import SidebarContent from "./SidebarContent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";

const fadeIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0%);
  }
`;

const fadeOut = keyframes`
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(-100%);
  }
`;

const SidebarContainer = styled.div`
  background-color: ${(props) => props.theme.colors.navbg};
  color: ${(props) => props.theme.colors.navPrimary};
  height: 100vh;
  width: 70vw;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  ${(props) =>
    css`
      animation: ${props.closing ? fadeOut : fadeIn} 0.3s;
    `};
  z-index: 10;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9;
  background-color: rgba(146, 201, 241, 0.3);
  cursor: pointer;
`;

const SidebarMobileContainer = styled.div`
  z-index: 9;
`;

const NavbarContainer = styled.div`
  padding: 12px;
  background-color: ${(props) => props.theme.colors.navSelected};
  color: ${(props) => props.theme.colors.navPrimary};
  position: fixed;
  font-size: larger;
  width: 100%;
  font-family: "Patua One", cursive;
`;

const Row = styled(FlexRow)`
  justify-content: space-between;
  align-items: center;
`;

function SidebarMobile() {
  const { theme } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const { pathname } = useLocation();

  const toggleSidebar = () => {
    if (sidebarOpen) {
      setClosing(true);
      setTimeout(() => {
        setSidebarOpen(false);
        setClosing(false);
      }, 300);
    } else {
      setSidebarOpen(true);
    }
  };

  return (
    <SidebarMobileContainer>
      {sidebarOpen && (
        <>
          <SidebarContainer theme={theme} closing={closing}>
            <SidebarContent closeSidebar={toggleSidebar} />
          </SidebarContainer>
          <Overlay onClick={toggleSidebar} />
        </>
      )}
      <NavbarContainer theme={theme}>
        <Row>
          {pathname.includes("experience")
            ? "Career Journey"
            : pathname.includes("project")
            ? "Major Projects"
            : pathname.includes("education")
            ? "Education & Activities"
            : "Introducing Myself"}
          <FontAwesomeIcon size="xl" icon={faBars} onClick={toggleSidebar} />
        </Row>
      </NavbarContainer>
    </SidebarMobileContainer>
  );
}

export default SidebarMobile;
