import React, { useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "./context/Theme";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";

const Container = styled.i`
  margin: 36px 0;
  font-size: larger;
  display: flex;
  justify-content: flex-end;
  @media (max-width: 768px) {
    font-size: medium;
    margin: 18px 0;
    justify-content: center;
  }
`;

const StyledLink = styled(Link)`
  border-bottom: 1px solid ${(props) => props.theme.colors.title};
  color: ${(props) => props.theme.colors.title};
  display: flex;
  gap: 8px;
  align-items: center;
`;

function NextPage({ to, children }) {
  const { theme } = useContext(ThemeContext);
  return (
    <Container>
      <StyledLink theme={theme} to={to}>
        {children}
        <FontAwesomeIcon icon={faSquareArrowUpRight} />
      </StyledLink>
    </Container>
  );
}

export default NextPage;
