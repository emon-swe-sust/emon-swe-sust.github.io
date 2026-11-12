import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import {
  Chip,
  Chips,
  Entity,
  ExtLink,
  ItemDate,
  ItemTitle,
  MetaItem,
  MetaList,
  Timeline,
  TimelineItem,
} from "../../components/ui";
import { tidyRange } from "../../components/format";

const Grade = styled.span`
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--ink);
  background: var(--surface-2);
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  border: 1px solid var(--line);
  border-color: color-mix(in srgb, var(--accent) 34%, var(--line));
  font-size: 0.8125rem;
  line-height: 1;
`;

const Description = styled.p`
  max-width: 68ch;
  color: var(--ink-2);
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BlockTitle = styled.h5`
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
`;

const Paper = styled.div`
  max-width: 68ch;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 18px;
  border-left: 2px solid var(--line-strong);

  a {
    font-family: var(--font-display);
    font-weight: 650;
    line-height: 1.35;
  }
  a svg {
    margin-left: 0.45em;
    font-size: 0.7em;
    color: var(--accent-ink);
  }
  a:hover {
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-underline-offset: 4px;
  }
  p {
    color: var(--ink-2);
    font-size: 0.9375rem;
  }
`;

function Degree({ degree }) {
  const grade = degree.cgpa
    ? `CGPA ${degree.cgpa}`
    : degree.gpa
    ? `GPA ${degree.gpa}`
    : null;
  const courses = degree.course_works
    ? [...degree.course_works.first_row, ...degree.course_works.second_row]
    : [];

  return (
    <Entity
      logo={degree["logo-light"]}
      name={degree.title}
      href={degree.title_link}
      meta={
        degree.location ? (
          <MetaList>
            <MetaItem icon={faLocationDot}>
              <ExtLink href={degree.location_link}>{degree.location}</ExtLink>
            </MetaItem>
          </MetaList>
        ) : null
      }
    >
      <Timeline>
        <TimelineItem>
          <ItemDate>
            {tidyRange(degree.year)}
            {grade && <Grade>{grade}</Grade>}
          </ItemDate>
          <ItemTitle>{degree.titleSecond}</ItemTitle>
          {degree.description && <Description>{degree.description}</Description>}

          {degree.publications && degree.publications.length > 0 && (
            <Block>
              <BlockTitle>Research work</BlockTitle>
              {degree.publications.map((publication, idx) => (
                <Paper key={idx}>
                  <ExtLink href={publication.link}>
                    {publication.title}
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  </ExtLink>
                  {publication.description && <p>{publication.description}</p>}
                </Paper>
              ))}
            </Block>
          )}

          {courses.length > 0 && (
            <Block>
              <BlockTitle>Major courses</BlockTitle>
              <Chips aria-label="Major courses">
                {courses.map((course, idx) => (
                  <Chip key={idx}>{course.trim()}</Chip>
                ))}
              </Chips>
            </Block>
          )}
        </TimelineItem>
      </Timeline>
    </Entity>
  );
}

export default Degree;
