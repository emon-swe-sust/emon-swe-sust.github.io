import { useContext } from "react";
import styled from "styled-components";
import { TitleLabel } from "./utils";
import { ThemeContext } from "./context/Theme";
import { useLocation } from "react-router-dom";

const MobileContainer = styled.div`
  margin-bottom: 8px;
  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const TitleContainer = styled.div`
  padding-bottom: 8px;
  margin-bottom: 24px;
  border-bottom: 4px solid ${(props) => props.theme.colors.navHover};
  /* @media (max-width: 768px) {
    ${(props) => !props.pathname.includes("education") && "display: none;"}
  } */
`;

const Title = (props) => {
  const { theme } = useContext(ThemeContext);
  const { pathname } = useLocation();
  return (
    <MobileContainer>
      <TitleContainer theme={theme} pathname={pathname}>
        <TitleLabel theme={theme}>{props.children}</TitleLabel>
      </TitleContainer>
    </MobileContainer>
  );
};

export default Title;
