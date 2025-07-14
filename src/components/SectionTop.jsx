import React, { useContext } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCircleInfo,
  faLink,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { ThemeContext } from "./context/Theme";
import { SubTitle2 } from "./utils";

const StyledLink = styled(Link)`
  text-decoration: none;
  cursor: alias;
  :hover {
    border-bottom: ${(props) => props.border_bottom && props.border_bottom};
  }
`;

export const DateLocationContainer = styled.div`
  display: flex;
  gap: 32px;
  justify-content: flex-start;
  margin-bottom: 2px;
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 0;
  }
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

const TitleSecond = styled(Flex)`
  @media (max-width: 768px) {
    flex-direction: column;
    margin-right: auto;
    align-items: start;
    gap: 0;
  }
`;

const TitleSecondLeft = styled.div`
  font-weight: 600;
  font-size: medium;
  width: 60%;
  color: ${(props) => props.theme.colors.titleSecondary};
  @media (max-width: 768px) {
    width: 100%;
    font-size: small;
  }
`;

const SmallFont = styled.div`
  font-style: italic;
  color: ${(props) => props.theme.colors.titleSecondary};
`;

const SectionContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Logo = styled.img`
  height: 68px;
  @media (max-width: 768px) {
    height: 52px;
  }
`;

const SectionTopInfo = styled.div`
  width: 100%;
`;

const StyledImg = styled.img`
  height: 20px;
  @media (max-width: 768px) {
    height: 14px;
  }
`;

const GithubLinkContainer = styled(Link)`
  display: flex;
  gap: 4px;
  cursor: alias;
  @media (max-width: 768px) {
    margin-bottom: 2px;
  }
`;

function SectionTop(props) {
  const { section, isOrg } = props;
  const { theme } = useContext(ThemeContext);

  return (
    <SectionContainer>
      {theme.variant === "dark" && section["logo-dark"] ? (
        <Logo src={section["logo-dark"]} />
      ) : (
        section["logo-light"] && <Logo src={section["logo-light"]} />
      )}
      <SectionTopInfo>
        {section.title_link ? (
          <SubTitle2 theme={theme} isOrg={isOrg}>
            <StyledLink
              to={section.title_link}
              border_bottom={`2px solid ${theme.colors.title}`}
              target="_blank"
            >
              {section.title}
              <FontAwesomeIcon
                icon={faLink}
                size="2xs"
                style={{ marginLeft: "2px" }}
              />
            </StyledLink>
          </SubTitle2>
        ) : (
          <SubTitle2 theme={theme}>{section.title}</SubTitle2>
        )}
        <TitleSecond justify="space-between">
          <TitleSecondLeft theme={theme}>{section.titleSecond}</TitleSecondLeft>
          {section.cgpa ? (
            <SmallFont theme={theme}> CGPA: {section.cgpa}</SmallFont>
          ) : section.gpa ? (
            <SmallFont theme={theme}>GPA: {section.gpa}</SmallFont>
          ) : (
            section.github_link && (
              <GithubLinkContainer to={section.github_link}>
                {theme.variant === "dark" ? (
                  <StyledImg src="/icons/github-light.png" />
                ) : (
                  <StyledImg src="/icons/github-dark.png" />
                )}
                <SmallFont theme={theme}>{section.github_link}</SmallFont>
              </GithubLinkContainer>
            )
          )}
        </TitleSecond>
        <DateLocationContainer>
          {section.year && (
            <Flex>
              <FontAwesomeIcon
                icon={faCalendarDays}
                style={{ color: theme.colors.titleSecondary }}
              />
              {section.year}
            </Flex>
          )}
          {section.location && (
            <Flex>
              <FontAwesomeIcon
                icon={faLocationDot}
                style={{ color: theme.colors.titleSecondary }}
              />
              <StyledLink to={section.location_link} target="_blank">
                {section.location}
                <FontAwesomeIcon
                  icon={faLink}
                  size="2xs"
                  style={{ marginLeft: "2px" }}
                />
              </StyledLink>
            </Flex>
          )}
          {section.association_with && (
            <Flex>
              <FontAwesomeIcon
                icon={faCircleInfo}
                style={{ color: theme.colors.titleSecondary }}
              />
              {section.association_with}
            </Flex>
          )}
        </DateLocationContainer>
      </SectionTopInfo>
    </SectionContainer>
  );
}

export default SectionTop;
