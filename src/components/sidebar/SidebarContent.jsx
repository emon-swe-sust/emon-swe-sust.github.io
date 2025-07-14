import React, { useContext } from "react";
import { FlexCol, FlexRow } from "../utils";
import styled from "styled-components";
import { ThemeContext } from "../context/Theme";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Container = styled(FlexCol)`
  justify-content: space-between;
  height: 100%;
  padding-top: 16px;
`;

const NavItem = styled.div`
  cursor: pointer;
  font-family: sans-serif;
  padding: 16px;
  border-bottom: 1px solid ${(props) => props.theme.colors.navHover};
  font-weight: bold;
  :hover {
    background-color: ${(props) =>
      !props.selected && props.theme.colors.navHover};
  }
  ${(props) =>
    props.selected &&
    `
    background-color: ${props.theme.colors.navSelected};`}
`;

const StyledImg = styled.img`
  height: 28px;
  cursor: pointer;
  @media (max-width: 768px) {
    height: 24px;
  }
`;

const IconContainer = styled.div`
  padding: 12px 24px;
  margin: auto;
  align-items: center;
  display: flex;
  gap: 8px;
`;

const ContactMe = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 16px;
  background-color: ${(props) => props.theme.colors.navHover};
  font-family: "Tajawal", sans-serif;
`;

const ContactItem = styled(FlexRow)`
  gap: 8px;
  align-items: center;
  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const P = styled.p`
  overflow-wrap: break-word;
  width: 80%;
  @media (max-width: 768px) {
    font-size: small;
  }
`;

function SidebarContent(props) {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const onItemClick = (link) => {
    navigate(link);
    if (props.closeSidebar) {
      props.closeSidebar();
    }
  };

  return (
    <Container>
      <FlexCol>
        <NavItem
          theme={theme}
          onClick={() => onItemClick("/about")}
          selected={
            location.pathname.includes("about") ||
            !location.pathname.split("/")[1]
          }
        >
          Profile
        </NavItem>
        <NavItem
          theme={theme}
          onClick={() => onItemClick("/experience")}
          selected={location.pathname.includes("experience")}
        >
          Career Journey
        </NavItem>
        <NavItem
          theme={theme}
          onClick={() => onItemClick("/project")}
          selected={location.pathname.includes("project")}
        >
          Major Projects
        </NavItem>
        <NavItem
          theme={theme}
          onClick={() => onItemClick("/education")}
          selected={location.pathname.includes("education")}
        >
          Education & Activities
        </NavItem>
      </FlexCol>
      <FlexCol>
        <ContactMe theme={theme}>
          <IconContainer>
            <Link
              to="https://www.sust.edu/institutes/iict/faculty/emon-iict@sust.edu"
              target="_blank"
            >
              <StyledImg src="/sust-logo.png" />
            </Link>
            <Link
              to="https://scholar.google.com/citations?user=ugFyqqEAAAAJ&hl=en"
              target="_blank"
            >
              <StyledImg src="icons/google_scholar.png" />
            </Link>
            <Link
              to="https://www.linkedin.com/in/emon-swe-sust/"
              target="_blank"
            >
              <StyledImg src="/icons/linkedin.png" target="_blank" />
            </Link>
            <Link to="https://github.com/emon-swe-sust" target="_blank">
              <StyledImg src="/icons/github-light.png" />
            </Link>
            <Link to="https://www.facebook.com/em0o0on/" target="_blank">
              <StyledImg src="/icons/facebook.png" />
            </Link>
            {/* <Link to="https://leetcode.com/emonnn/">
              <StyledImg src="/icons/leet-code-white.png" />
            </Link>
            <Link to="https://www.upwork.com/freelancers/~019b4ed80d044bb27f">
              <StyledImg src="/icons/upwork.png" />
            </Link>
            <Link to="https://codeforces.com/profile/emonnn">
              <StyledImg src="/icons/codeforces.png" />
            </Link> */}
          </IconContainer>
          <ContactItem>
            <StyledImg src="/icons/mail.png" />
            <P>emon.swe.sust@gmail.com</P>
          </ContactItem>
          <ContactItem>
            <StyledImg src="/icons/phone.png" />
            <P>+8801521702334</P>
          </ContactItem>
        </ContactMe>
      </FlexCol>
    </Container>
  );
}

export default SidebarContent;
