import { useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "./context/Theme";

const IndividualTech = styled.div`
  padding: 4px 10px;
  border-radius: 4px;
  color: ${(props) => (props.theme.variant === "light" ? "black" : "white")};
  background-color: ${(props) =>
    props.theme.variant === "light" ? "#e3e2ff" : "#4d578e"};
`;

const TechnologyContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 14px;
  justify-content: flex-start;
`;

const Technology = ({ technologies }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <TechnologyContainer>
      {technologies &&
        technologies.map((technology, idx) => (
          <IndividualTech key={idx} id={idx} theme={theme}>
            {technology}
          </IndividualTech>
        ))}
    </TechnologyContainer>
  );
};

export default Technology;
