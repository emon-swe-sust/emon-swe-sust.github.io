import SidebarDesktop from "./components/sidebar/SidebarDesktop";
import { FlexCol, FlexRow } from "./components/utils";
import SidebarMobile from "./components/sidebar/SidebarMobile";
import styled from "styled-components";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "./components/context/Theme";
import Router from "./Router";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
const Row = styled(FlexRow)`
  gap: 0px;
`;
const Col = styled(FlexCol)`
  gap: 0px;
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.bg};
  color: ${(props) => props.theme.colors.primary};
  font-family: "Barlow", sans-serif;
  line-height: 1.5;
  text-align: justify;
`;

const PageContainer = styled.div`
  @media (min-width: 768px) {
    margin-left: 25%;
  }
  @media (min-width: 1200px) {
    margin-left: 20%;
  }
`;

export const BodyContainer = styled.div`
  padding: 2%;
  background-color: ${(props) => props.theme.colors.bg};
  @media (min-width: 768px) {
    padding: 2% 10%;
  }
  z-index: 50;
  margin-top: 48px;
`;

const ThemeIcon = styled.div`
  position: fixed;
  z-index: 5;
  bottom: 48px;
  right: 48px;
  height: 48px;
  width: 48px;
  border-radius: 100%;
  &:hover,
  &:focus {
    ${(props) =>
      `box-shadow: 0 0 40px ${
        props.variant === "light" ? "#868686" : "#02126e"
      }`}
  }

  @media (max-width: 768px) {
    bottom: 32px;
    right: 32px;
    height: 32px;
    width: 32px;
  }
`;

const StyledImg = styled.img`
  cursor: pointer;
  height: 48px;
  width: 48px;
  @media (max-width: 768px) {
    height: 32px;
    width: 32px;
  }
`;

function App() {
  const { theme, changeTheme } = useContext(ThemeContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Row>
        {windowWidth > 768 && <SidebarDesktop />}
        <Col theme={theme}>
          {windowWidth < 768 && <SidebarMobile />}
          <PageContainer>
            <Router headerInitialHeight={windowWidth > 768 ? 400 : 250} />
          </PageContainer>
        </Col>
        <ThemeIcon variant={theme.variant}>
          {theme.variant === "light" ? (
            <StyledImg
              src="/icons/light-mode.png"
              onClick={() => changeTheme("dark")}
            />
          ) : (
            <StyledImg
              src="/icons/dark-mode.png"
              onClick={() => changeTheme("light")}
            />
          )}
        </ThemeIcon>
      </Row>
    </BrowserRouter>
  );
}

export default App;
