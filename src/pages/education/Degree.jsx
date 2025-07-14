import React, { useContext } from "react";
import styled from "styled-components";
import {
  Content,
  ContentContainer,
  ContentTitle,
  Description,
  SectionComponentContainer,
} from "../../components/utils";
import { ThemeContext } from "../../components/context/Theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import SectionTop from "../../components/SectionTop";

export const StyledLink = styled(Link)`
  text-decoration: none;
  cursor: alias;
  :hover {
    border-bottom: ${(props) => props.border_bottom && props.border_bottom};
  }
`;

const CourseCol = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 4px;
`;

const Course = styled.div`
  font-size: small;
`;

const ResearchTitle = styled.div`
  font-weight: 700;
  margin-top: 8px;
`;

function Degree({ degree }) {
  const { theme } = useContext(ThemeContext);
  return (
    <SectionComponentContainer theme={theme}>
      <SectionTop section={degree} />
      {degree.description && <Description>{degree.description}</Description>}
      {degree.publications && (
        <ContentContainer>
          <ContentTitle theme={theme}>Research Works</ContentTitle>
          {degree.publications.map((publication, idx) => (
            <React.Fragment key={idx}>
              <ResearchTitle>
                <StyledLink
                  to={publication.link}
                  target="_blank"
                  border_bottom={"1px solid"}
                >
                  {publication.title}
                  <FontAwesomeIcon
                    icon={faLink}
                    size="2xs"
                    style={{ marginLeft: "2px" }}
                  />
                </StyledLink>
              </ResearchTitle>
              <Description>{publication.description}</Description>
            </React.Fragment>
          ))}
        </ContentContainer>
      )}

      {degree.course_works && (
        <ContentContainer>
          <ContentTitle theme={theme}>Major courses</ContentTitle>
          <Content>
            <CourseCol>
              {degree.course_works.first_row.map((course, idx) => (
                <Course key={idx}>{course}</Course>
              ))}
            </CourseCol>
            <CourseCol>
              {degree.course_works.second_row.map((course, idx) => (
                <Course key={idx}>{course}</Course>
              ))}
            </CourseCol>
          </Content>
        </ContentContainer>
      )}
    </SectionComponentContainer>
  );
}

export default Degree;
