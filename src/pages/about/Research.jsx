import { SectionContainer, SubTitle2 } from "../../components/utils";
import data from "./../../data.json";
import Title from "../../components/Title";
import React, { useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../../components/context/Theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCode,
  faDatabase,
  faGlobe,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { DateLocationContainer } from "../../components/SectionTop";
import { StyledLink } from "../education/Degree";
import BulletPoints from "../../components/BulletPoints";

const P = styled.p`
  font-size: 14px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ResearchInfo = styled.div`
  font-size: small;
`;

const ResearchContainer = styled(SectionContainer)`
  gap: 8px;
`;

const Flex = styled.div`
  display: flex;
  justify-content: ${(props) => props.justify && props.justify};
  align-items: center;
  font-size: small;
  gap: 8px;
  @media (max-width: 768px) {
    font-size: x-small;
  }
`;

const IndividualResearchContainer = styled.div`
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.bgCard};
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SubTitleSecond = styled.div`
  font-size: large;
  color: ${(props) => props.theme.colors.titleSecondary};
  font-weight: 300;
  gap: 4px;
  align-items: center;
  font-family: "Patua One", cursive;
  @media (max-width: 768px) {
    font-size: medium;
  }
  width: fit-content;
  padding-right: 64px;
`;

const ItemContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const IndividualResearch = ({ research }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <IndividualResearchContainer theme={theme}>
      <SubTitleSecond theme={theme}>
        {research.link ? (
          <StyledLink
            to={research.link}
            target="_blank"
            border_bottom={"1px solid"}
          >
            {research.title}
            <FontAwesomeIcon
              icon={faLink}
              size="2xs"
              style={{ marginLeft: "2px" }}
            />
          </StyledLink>
        ) : (
          <React.Fragment>{research.title}</React.Fragment>
        )}
      </SubTitleSecond>
      {research.info && <ResearchInfo>{research.info}</ResearchInfo>}
      <DateLocationContainer>
        {research.year && (
          <Flex>
            <FontAwesomeIcon
              icon={faCalendarDays}
              style={{ color: theme.colors.titleSecondary }}
            />
            {research.year}
          </Flex>
        )}
        {research.doi && (
          <StyledLink
            to={research.doi}
            target="_blank"
            border_bottom={"1px solid"}
            fontSize={"small"}
            style={{ display: "flex", alignItems: "center", fontSize: "small" }}
          >
            <FontAwesomeIcon
              icon={faCode}
              size="x"
              style={{ margin: "0 4px", color: theme.colors.titleSecondary }}
            />
            DOI
          </StyledLink>
        )}

        {research.website && (
          <StyledLink
            to={research.website}
            target="_blank"
            border_bottom={"1px solid"}
            fontSize={"small"}
            style={{ display: "flex", alignItems: "center", fontSize: "small" }}
          >
            <FontAwesomeIcon
              icon={faGlobe}
              size="x"
              style={{ margin: "0 4px", color: theme.colors.titleSecondary }}
            />
            Website
          </StyledLink>
        )}
        {research.dataset && (
          <StyledLink
            to={research.dataset}
            target="_blank"
            border_bottom={"1px solid"}
            fontSize={"small"}
            style={{ display: "flex", alignItems: "center", fontSize: "small" }}
          >
            <FontAwesomeIcon
              icon={faDatabase}
              size="x"
              style={{ margin: "0 4px", color: theme.colors.titleSecondary }}
            />
            DataSet
          </StyledLink>
        )}
      </DateLocationContainer>
      {research.description && <P>{research.description}</P>}
      <ItemContainer>
        <BulletPoints bulletPoints={research.involvements} gap={"8px"} />
      </ItemContainer>
    </IndividualResearchContainer>
  );
};

function Research() {
  return (
    <div>
      <Title>Research Involvements</Title>
      <ResearchContainer>
        {data.researches.map((project, idx) => (
          <IndividualResearch key={idx} research={project} />
        ))}
      </ResearchContainer>
    </div>
  );
}

export default Research;
